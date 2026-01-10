export interface UsageBlock {
	pos: string; // DET
	usageZh: string; // 中文说明
	usageEn: string; // English explanation
	examples: string[]; // examples
}

export interface ParsedWordData {
	word: string;
	audioSrc: string | null;
	phonetic: string;
	definition: string;
	usageBlocks: UsageBlock[];
}

export const parseCocaHtml = (
	html: string,
	originalWord: string,
): ParsedWordData => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// 1. Audio extraction
	// Format: <span class='word-audio audio' data-src='coca_00002_be.mp3'></span>
	const audioSpan = doc.querySelector(".word-audio");
	const audioSrc = audioSpan ? audioSpan.getAttribute("data-src") : null;

	// 2. Content Extraction (Phonetics and Definitions)
	// The raw file often has text directly in the body or pre tags.
	// Structure: word <div...>phonetic</div> <div...>definition</div> "<div>examples</div>"

	const allDivs = Array.from(doc.querySelectorAll("div")).map(
		(d) => d.textContent || "",
	);

	const phonetic = allDivs[0].trim();

	const definition = allDivs[1].trim();

	// 3. Examples Extraction
	const usageBlocks = parseExamples(doc);

	return {
		word: originalWord,
		audioSrc,
		phonetic,
		definition: definition || "No definition available locally.",
		usageBlocks,
	};
};

function parseExamples(doc: Document): UsageBlock[] {
	const blocks: UsageBlock[] = [];

	const divs = Array.from(doc.querySelectorAll("div"));

	let i = 0;

	while (i < divs.length) {
		const div = divs[i];

		console.log("Processing div:", div.style.color, div.textContent);

		// 1️⃣ Detect section start
		if (div.style.color === "rosybrown") {
			const pos = (div.textContent || "").trim();

			// 2️⃣ Next div: Chinese usage
			const usageZhDiv = divs[++i];
			const usageZh = (usageZhDiv?.textContent || "").trim();

			// 3️⃣ Next div: English usage
			const usageEnDiv = divs[++i];
			const usageEn = (usageEnDiv?.textContent || "").trim();

			// 4️⃣ Collect examples until <div><br /></div>
			const examples: string[] = [];

			i++;
			while (i < divs.length) {
				const current = divs[i];

				// End of this block
				if (
					current.innerHTML.trim() === "<br>" ||
					current.innerHTML.trim() === "<br />"
				) {
					break;
				}

				let text = (current.textContent || "").trim();
				text = text.replace(/^(例|Example)[:：]?\s*/, "");

				if (text) {
					examples.push(text);
				}

				i++;
			}

			blocks.push({
				pos,
				usageZh,
				usageEn,
				examples,
			});
		}

		i++;
	}
	return blocks;
}
