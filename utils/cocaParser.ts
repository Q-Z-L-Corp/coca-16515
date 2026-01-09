export interface ParsedWordData {
  word: string;
  audioSrc: string | null;
  phonetic: string;
  definition: string;
  examples: string[];
}

export const parseCocaHtml = (html: string, originalWord: string): ParsedWordData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. Audio extraction
  // Format: <span class='word-audio audio' data-src='coca_00002_be.mp3'></span>
  const audioSpan = doc.querySelector('.word-audio');
  const audioSrc = audioSpan ? audioSpan.getAttribute('data-src') : null;

  // 2. Content Extraction (Phonetics and Definitions)
  // The raw file often has text directly in the body or pre tags.
  // Structure: word <div...>phonetic</div> <div...>definition</div> "<div>examples</div>"
  
  const allDivs = Array.from(doc.querySelectorAll('div')).map(d => d.textContent || '');
  let phonetic = '';
  let definition = '';

  for (const text of allDivs) {
    const trimmed = text.trim();
    // Heuristic for phonetic: usually contains brackets like [bi]
    if (trimmed.includes('[') && trimmed.includes(']')) {
      phonetic = trimmed;
    } 
    // Heuristic for definition: contains Chinese or part of speech markers, not examples
    else if ((trimmed.match(/^[a-z]+\./) || /[\u4e00-\u9fa5]/.test(trimmed)) && !trimmed.startsWith('例')) {
      // Ensure we capture the first substantial definition block
      if (!definition || definition.length < trimmed.length) {
         definition = trimmed;
      }
    }
  }

  // 3. Examples Extraction
  // Examples are often inside a quoted string containing HTML: "<div>...</div>"
  // We use regex to grab the quoted HTML string part.
  const examples: string[] = [];
  const exampleMatch = html.match(/"(<div.*<\/div>)"/s);
  
  if (exampleMatch && exampleMatch[1]) {
    const exDoc = parser.parseFromString(exampleMatch[1], 'text/html');
    exDoc.querySelectorAll('div').forEach(div => {
      let text = div.textContent || '';
      // Clean up common prefixes like "例："
      text = text.replace(/^(例|Example)[:：]?/, '').trim();
      if (text) examples.push(text);
    });
  }

  return {
    word: originalWord,
    audioSrc,
    phonetic,
    definition: definition || 'No definition available locally.',
    examples
  };
};
