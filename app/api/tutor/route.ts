import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_SMART } from "@/app/constants";
import { WordDetails, QuizQuestion, UserStats } from "@/types";
import { COCA } from "@/app/coca";
import { fetchWordHtml } from "@/app/utils/contentProvider";
import { parseCocaHtml } from "@/app/utils/cocaParser";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

/* ----------------------- helpers ----------------------- */

const cleanText = (text: string) =>
	text.toLowerCase().replace(/[^a-z0-9\s]/g, "");

let cocaMap: Map<string, (typeof COCA)[0]> | null = null;

const getCocaMap = () => {
	if (!cocaMap) {
		cocaMap = new Map();
		COCA.forEach((item, index) => {
			if (item.word && index > 0) {
				cocaMap!.set(item.word.toLowerCase(), {
					...item,
					rank: index,
				});
			}
		});
	}
	return cocaMap!;
};

const getRelevantContext = async (text: string): Promise<string> => {
	const map = getCocaMap();
	const words = cleanText(text).split(/\s+/);
	const uniqueWords = Array.from(new Set(words));

	const isShortQuery = words.length < 5;
	const threshold = isShortQuery ? 0 : 200;

	const matches = uniqueWords
		.map((w) => map.get(w))
		.filter((item) => item && (item.rank || 0) > threshold)
		.sort((a, b) => (a!.rank || 0) - (b!.rank || 0))
		.reverse()
		.slice(0, 3);

	if (matches.length === 0) return "";

	const contextParts = await Promise.all(
		matches.map(async (item) => {
			try {
				const html = await fetchWordHtml(item!.html);
				const parsed = parseCocaHtml(html, item!.word);

				const exampleLines = parsed.usageBlocks
					.slice(0, 2) // up to 2 POS blocks
					.flatMap(
						(block) => block.examples.slice(0, 1), // 1 example per block
					)
					.map((ex) => `- ${ex}`)
					.join("\n");

				return `Word: ${parsed.word}
Phonetic: ${parsed.phonetic}
Definition: ${parsed.definition}
Examples:
${exampleLines}`;
			} catch {
				return "";
			}
		}),
	);

	const valid = contextParts.filter(Boolean);
	if (valid.length === 0) return "";

	return `[GROUNDING DATA FROM COCA DATABASE]
${valid.join("\n---\n")}
[END GROUNDING DATA]`;
};

/* ----------------------- handlers ----------------------- */

export async function POST(req: NextRequest) {
	if (!apiKey) {
		return NextResponse.json({ error: "API key missing" }, { status: 500 });
	}

	try {
		const body = await req.json();
		const { action } = body;

		switch (action) {
			case "wordDetails":
				return NextResponse.json(await handleWordDetails(body.word));

			case "quiz":
				return NextResponse.json(await handleQuiz(body.word));

			case "chat":
				return NextResponse.json(await handleChat(body.history, body.message));
			case "flashcards":
				return NextResponse.json(
					await handleFlashcards(body.userStats, body.wordsSeen),
				);

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}
	} catch (err) {
		console.error(err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

/* ----------------------- implementations ----------------------- */

function getRankWindow(userStats: UserStats) {
	const base = 300;
	const levelInfluence = userStats.level * 50;
	const xpInfluence = Math.min(userStats.xp / 10, 500); // cap it
	const streakInfluence = userStats.streak * 20;

	let start = base + levelInfluence + xpInfluence + streakInfluence;
	start += Math.floor(Math.random() * 50); // randomize a little

	let windowSize = 800;
	let end = start + windowSize;

	// ensure we don't exceed COCA length
	end = Math.min(end, COCA.length - 1);

	// safety: make sure we have at least 20 words
	if (end - start < 20) {
		start = Math.max(0, end - 20);
	}

	return { start, end };
}

async function handleFlashcards(
	userStats: UserStats,
	wordsSeen?: string[],
): Promise<any> {
	try {
		const { start, end } = getRankWindow(userStats);

		const candidates = COCA.filter((w) => !wordsSeen?.includes(w.word))
			.slice(start, end)
			.filter((w) => w.word && w.html)
			.map((w, i) => ({
				word: w.word,
				rank: start + i,
			}));

		const prompt = `
You are an English vocabulary tutor.

From the list below, select exactly 20 words for flashcards.

Rules:
- Suitable for IELTS/TOEFL learners
- Avoid archaic or rare words
- Mix nouns, verbs, adjectives
- Prefer academic and conversational usefulness
- Avoid extremely abstract words

Candidate words (JSON):
${JSON.stringify(candidates)}

Return JSON only:
{
  "words": [
    { "word": string, "rank": number, "reason": string }
  ]
}
`;

		const responseSchema: Schema = {
			type: Type.OBJECT,
			properties: {
				words: {
					type: Type.ARRAY,
					items: {
						type: Type.OBJECT,
						properties: {
							word: { type: Type.STRING },
							rank: { type: Type.NUMBER },
							reason: { type: Type.STRING },
						},
						required: ["word", "rank", "reason"],
					},
				},
			},
			required: ["words"],
		};

		const response = await ai.models.generateContent({
			model: GEMINI_MODEL_FAST,
			contents: prompt,
			config: {
				responseMimeType: "application/json",
				responseSchema,
			},
		});
		return JSON.parse(response.text || "{}");
	} catch (error) {
		console.error("Gemini Flashcards Error:", error);
		const index = Math.floor(Math.random() * (COCA.length - 20));
		return {
			words: COCA.filter((w) => !wordsSeen?.includes(w.word))
				.slice(index, index + 20)
				.map((w, i) => ({ word: w.word, rank: i + 1 })),
		};
	}
}

async function handleWordDetails(word: string): Promise<WordDetails | null> {
	let groundingContext = "";
	const item = getCocaMap().get(word.toLowerCase());

	if (item) {
		try {
			const html = await fetchWordHtml(item.html);
			const parsed = parseCocaHtml(html, item.word);

			const groundedExamples = parsed.usageBlocks
				.slice(0, 2) // up to 2 POS blocks
				.flatMap((block) => block.examples.slice(0, 1))
				.map((ex) => `- ${ex}`)
				.join("\n");

			groundingContext = `
GROUND TRUTH DEFINITION:
${parsed.definition}

GROUND TRUTH EXAMPLES:
${groundedExamples}
`;
		} catch {}
	}

	const responseSchema: Schema = {
		type: Type.OBJECT,
		properties: {
			definition: { type: Type.STRING },
			partOfSpeech: { type: Type.STRING },
			synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
			examples: { type: Type.ARRAY, items: { type: Type.STRING } },
		},
		required: ["definition", "partOfSpeech", "synonyms", "examples"],
	};

	const prompt = `Provide a clear, accurate dictionary entry for the word "${word}" suitable for an IELTS/TOEFL student.

${
	groundingContext
		? `Use the following GROUND TRUTH data as the primary and authoritative source. Do NOT contradict it:\n${groundingContext}`
		: ""
}

Respond strictly in the requested JSON format.`;

	const response = await ai.models.generateContent({
		model: GEMINI_MODEL_FAST,
		contents: prompt,
		config: {
			responseMimeType: "application/json",
			responseSchema,
		},
	});

	return JSON.parse(response.text || "{}");
}
async function handleQuiz(word: string): Promise<QuizQuestion | null> {
	let contextInfo = "";
	const item = getCocaMap().get(word.toLowerCase());

	if (item) {
		try {
			const html = await fetchWordHtml(item.html);
			const parsed = parseCocaHtml(html, item.word);

			const exampleText = parsed.usageBlocks
				.flatMap((block) => block.examples)
				.slice(0, 2)
				.join("; ");

			contextInfo = `Definition: ${parsed.definition}. Example usage: ${exampleText}`;
		} catch {}
	}

	const responseSchema: Schema = {
		type: Type.OBJECT,
		properties: {
			question: { type: Type.STRING },
			options: { type: Type.ARRAY, items: { type: Type.STRING } },
			correctAnswer: { type: Type.STRING },
			explanation: { type: Type.STRING },
		},
		required: ["question", "options", "correctAnswer", "explanation"],
	};

	const prompt = `Create a multiple-choice vocabulary question for an IELTS/TOEFL student.

The correct answer must be "${word}".

${
	contextInfo
		? `Base the question on the following definition and example usage:\n${contextInfo}`
		: ""
}

- The question should test understanding of meaning or usage.
- The incorrect options should be plausible but clearly wrong.
- Do not include the correct answer in the question stem.
- Respond strictly in JSON.`;

	const response = await ai.models.generateContent({
		model: GEMINI_MODEL_FAST,
		contents: prompt,
		config: {
			responseMimeType: "application/json",
			responseSchema,
		},
	});

	return JSON.parse(response.text || "{}");
}

async function handleChat(
	history: { role: string; parts: { text: string }[] }[],
	message: string,
) {
	const contextBlock = await getRelevantContext(message);
	const augmentedMessage = contextBlock
		? `${contextBlock}\n\nUser Message: ${message}`
		: message;

	const chat = ai.chats.create({
		model: GEMINI_MODEL_SMART,
		history,
		config: {
			systemInstruction:
				"You are a helpful, encouraging English tutor for IELTS/TOEFL. Always prioritize [GROUNDING DATA] if present.",
		},
	});

	const result = await chat.sendMessage({
		message: augmentedMessage,
	});

	return { reply: result.text };
}
