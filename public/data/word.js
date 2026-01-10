function startAnimation(e) {
	if (e.className == "word-audio audio") e.className = "word-audio audio-light";
	else if (e.className == "word-audio audio-light")
		e.className = "word-audio audio-playing";
	else e.className = "word-audio audio";
	console.log(e.className);
}
function play(e, context, audioBuffer) {
	const source = context.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(context.destination);
	source.start();
	let it = setInterval(function () {
		startAnimation(e);
	}, 300);
	startAnimation(e, 0);
	source.onended = function () {
		clearInterval(it);
		e.className = "word-audio audio";
	};
}
document.querySelectorAll(".word-audio").forEach(function (e, index) {
	let url = e.attributes["data-src"].nodeValue;
	let aw = new Audio(url);
	e.onclick = function () {
		aw.play();
		let it = setInterval(function () {
			startAnimation(e);
		}, 300);
		aw.onended = function () {
			clearInterval(it);
			e.className = "word-audio audio";
		};
	};
});
