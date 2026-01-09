import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GEMINI_MODEL_FAST, GEMINI_MODEL_SMART } from "../constants";
import { WordDetails, QuizQuestion } from "../types";
import { COCA } from "../data/coca";
import { fetchWordHtml } from "../utils/contentProvider";
import { parseCocaHtml } from "../utils/cocaParser";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean text for keyword matching
const cleanText = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');

// Cache for COCA map to avoid rebuilding it every call
let cocaMap: Map<string, typeof COCA[0]> | null = null;
const getCocaMap = () => {
  if (!cocaMap) {
    cocaMap = new Map();
    // Skip the first empty entry and very common words (rank < 500) for context injection to save tokens
    // We assume the COCA array index corresponds roughly to frequency rank.
    COCA.forEach((item, index) => {
      if (item.word && index > 0) {
        cocaMap!.set(item.word.toLowerCase(), { ...item, rank: index });
      }
    });
  }
  return cocaMap!;
};

const getRelevantContext = async (text: string): Promise<string> => {
  const map = getCocaMap();
  const words = cleanText(text).split(/\s+/);
  const uniqueWords = Array.from(new Set(words));
  
  // Filter for words present in COCA, excluding very common ones (rank < 200) for efficiency
  // unless the query is very short (likely asking for a specific definition)
  const isShortQuery = words.length < 5;
  const threshold = isShortQuery ? 0 : 200;

  const matches = uniqueWords
    .map(w => map.get(w))
    .filter(item => item !== undefined && (item.rank || 0) > threshold)
    .sort((a, b) => (a!.rank || 0) - (b!.rank || 0)); // Sort by frequency (rank)

  // Take up to 3 most relevant (rare) words to keep context manageable
  // Actually, for learning, maybe we want the rarest words found? 
  // Let's take the ones with higher rank index (rarer).
  const topMatches = matches.reverse().slice(0, 3);

  if (topMatches.length === 0) return "";

  const contextParts = await Promise.all(topMatches.map(async (item) => {
    if (!item) return "";
    try {
      const html = await fetchWordHtml(item.html);
      const parsed = parseCocaHtml(html, item.word);
      return `Word: ${parsed.word}
Phonetic: ${parsed.phonetic}
Definition: ${parsed.definition}
Examples:
${parsed.examples.slice(0, 3).map(e => `- ${e}`).join('\n')}`;
    } catch (e) {
      console.warn(`Failed to fetch context for ${item.word}`);
      return "";
    }
  }));

  const validContexts = contextParts.filter(s => s.trim() !== "");
  if (validContexts.length === 0) return "";

  return `[GROUNDING DATA FROM COCA DATABASE]
The user's message contains the following vocabulary from our database. Use this as the source of truth for definitions and usage.
---
${validContexts.join('\n---\n')}
---
[END GROUNDING DATA]`;
};

export const getWordDetails = async (word: string): Promise<WordDetails | null> => {
  if (!apiKey) return null;

  try {
    // 1. Try to fetch grounding data locally first
    let groundingContext = "";
    const map = getCocaMap();
    const item = map.get(word.toLowerCase());
    
    if (item) {
        try {
            const html = await fetchWordHtml(item.html);
            const parsed = parseCocaHtml(html, item.word);
            groundingContext = `
            GROUND TRUTH DEFINITION: "${parsed.definition}"
            GROUND TRUTH EXAMPLES: ${JSON.stringify(parsed.examples)}
            `;
        } catch (e) {
            console.warn("Could not fetch local HTML for grounding");
        }
    }

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        definition: { type: Type.STRING },
        partOfSpeech: { type: Type.STRING },
        synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
        examples: { type: Type.ARRAY, items: { type: Type.STRING } },
        mnemonics: { type: Type.STRING },
      },
      required: ["definition", "partOfSpeech", "synonyms", "examples"],
    };

    const prompt = `Provide a detailed dictionary entry for the word "${word}" suitable for an IELTS/TOEFL student. 
    ${groundingContext ? `Use the following GROUND TRUTH data as the primary source for the definition and examples: ${groundingContext}` : ""}
    Include a mnemonic device to help remember it.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Details Error:", error);
    return null;
  }
};

export const generateQuizQuestion = async (word: string): Promise<QuizQuestion | null> => {
  if (!apiKey) return null;

  try {
    // Inject context for quiz generation too if available
    let contextInfo = "";
    const map = getCocaMap();
    const item = map.get(word.toLowerCase());
    if (item) {
         const html = await fetchWordHtml(item.html);
         const parsed = parseCocaHtml(html, item.word);
         contextInfo = `Context Definition: ${parsed.definition}. Examples: ${parsed.examples.slice(0,2).join('; ')}`;
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

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FAST, 
      contents: `Create a multiple-choice vocabulary question where the correct answer is "${word}". 
      ${contextInfo}
      The options should be other words that might be confusing. The question should test usage or definition based on the provided context if available.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
};

export const getTutorResponse = async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
  if (!apiKey) return "API Key missing.";

  try {
    const contextBlock = await getRelevantContext(newMessage);
    
    // We append the context to the last user message effectively by constructing a chat with system instruction
    // However, google-genai SDK handles history + new message. 
    // We can inject the context into the new message content for the model to see it immediately.
    
    const augmentedMessage = contextBlock 
      ? `${contextBlock}\n\nUser Question/Statement: ${newMessage}` 
      : newMessage;

    const chat = ai.chats.create({
      model: GEMINI_MODEL_SMART, // Pro for better reasoning and tutoring
      history: history,
      config: {
        systemInstruction: "You are a helpful, encouraging English tutor helping a student prepare for IELTS/TOEFL. Correct their grammar gently and encourage them to use sophisticated vocabulary. Always base your definitions and usage explanations on the [GROUNDING DATA] provided in the message if available.",
      }
    });

    const result = await chat.sendMessage({ message: augmentedMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I am having trouble connecting to the brain right now.";
  }
};