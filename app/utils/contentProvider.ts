// Embedded content for the sample words to ensure they load correctly without server configuration
const SAMPLE_CONTENT: Record<string, string> = {
	"coca_00002_be.html": `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='coca_00002_be.mp3'></span>
be <div style=''>英[bi] 美[bi]</div> <div style=''>v.是；有，存在；做，成为；发生；aux.用来表示某人或某物即主语本身，用来表示某人或某物属于某一群体或有某种性质；</div> "<div><br /></div><div style='color:RosyBrown'>AUX</div><div style='color:OrangeRed'>（和现在分词连用构成动词的进行式）</div><div style=""font-weight:bold;"">You use be with a present participle to form the continuous tenses of verbs.</div><div style=''><b>例：</b>This is happening in every school throughout the country...全国各地每所学校都在发生这样的事情。</div><div style=''><b>例：</b>She didn't always think carefully about what she was doing...她对自己在做的事情并不总是考虑得很清楚。</div>"
</pre>`,
	"coca_00003_and.html": `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='coca_00003_and.mp3'></span>
and <div style=''>英[ənd] 美[ənd, ən,ænd]</div> <div style=''>conj.和，与；而且；于是，然后；因此；</div> "<div><br /></div><div style='color:RosyBrown'>CONJ-COORD</div><div style='color:OrangeRed'>（连接两个以上的单词、词组或子句）和，与，同</div><div style=""font-weight:bold;"">You use and to link two or more words, groups, or clauses.</div><div style=''><b>例：</b>When he returned, she and Simon had already gone...他回来时，她和西蒙已经走了。</div>"
</pre>`,
	"coca_00004_of.html": `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='coca_00004_of.mp3'></span>
of <div style=''>英[əv] 美[ʌv]</div> <div style=''>prep.关于；属于…的；由…制成；aux.助动词 [非标准用语、方言] =have [主用于虚拟语气]；</div> "<div><br /></div><div style='color:RosyBrown'>PREP</div><div style='color:OrangeRed'>（用于连接两个名词，其中前者表示后者的特定方面）</div><div style=""font-weight:bold;"">You use of to combine two nouns when the first noun identifies the feature of the second noun that you want to talk about.</div><div style=''><b>例：</b>The average age of the women interviewed was only 21.5.参加面试的女性平均年龄才21.5岁。</div>"
</pre>`,
	"coca_00005_a.html": `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='coca_00005_a.mp3'></span>
a <div style=''>英[ə] 美[eɪ]</div> <div style=''>art.一（个）；每一（个）；任一（个）；</div> "<div><br /></div><div style='color:RosyBrown'>DET</div><div style='color:OrangeRed'>（指初次提及或非特指的人或物）一（个）</div><div style=""font-weight:bold;"">You use a or an when you are referring to someone or something for the first time.</div><div style=''><b>例：</b>A waiter entered with a tray...侍者端着托盘进来了。</div>"
</pre>`,
	"coca_00006_in.html": `<pre style='word-break: break-word;white-space: normal;background-color: floralwhite;text-align:left;padding:40px;'>
<meta charset='UTF-8'>
<span class='word-audio audio' data-src='coca_00006_in.mp3'></span>
in <div style=''>英[ɪn] 美[ɪn]</div> <div style=''>prep.采用（某种方式）；穿着，带着；（表示位置）在…里面；</div> "<div><br /></div><div style='color:RosyBrown'>PREP</div><div style='color:OrangeRed'>在…里;在…之内</div><div style=""font-weight:bold;"">Someone or something that is in something else is enclosed by it or surrounded by it.</div><div style=''><b>例：</b>He was in his car.他坐在他的车里。</div>"
</pre>`,
};

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
	// Check embedded samples first
	if (SAMPLE_CONTENT[filename]) {
		return SAMPLE_CONTENT[filename];
	}

	// Fallback to network fetch
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
