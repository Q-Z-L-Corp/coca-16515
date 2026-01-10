const generateFallbackHtml = (filename: string): string => {
	const match = filename.match(/coca_\d+_(.+)\.html/);
	const word = match
		? match[1]
		: filename.replace(".html", "").replace(/coca_\d+_/, "");
	const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1);

	return `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='${filename.replace(".html", ".mp3")}'></span>
${word} <div style=''>[/${word}/]</div> <div style=''>n./v. ${capitalizedWord} (Demo Definition)</div> "<div><br /><div style='color:RosyBrown'>DEMO</div><div style='color:OrangeRed'>Auto-generated content</div><div style=""font-weight:bold;"">The detailed dictionary entry for '${word}' is not available in this offline demo.</div><div style=''><b>Example:</b> This is a placeholder example sentence for ${word}.</div></div>"
</pre>`;
};

export const fetchWordHtml = async (filename: string): Promise<string> => {
	try {
		const response = await fetch(`data/${filename}`);
		if (!response.ok) {
			// If file not found (404), return generated fallback instead of throwing
			console.warn(`File ${filename} not found, using fallback content.`);
			return generateFallbackHtml(filename);
		}
		return await response.text();
	} catch (error) {
		console.warn(`Could not load ${filename}, using fallback.`);
		// Network error or other issue, return fallback
		return generateFallbackHtml(filename);
	}
};

export const isWordAvailable = (filename: string): boolean => {
	// In this robust version, we technically "have" every word via fallback
	return true;
};
