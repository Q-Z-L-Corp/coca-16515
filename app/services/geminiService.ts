import { ChatHistory } from "@/types";

export const getTutorResponse = async (
	history: ChatHistory[],
	userInput: string,
	action: string = "chat",
): Promise<string | null> => {
	const res = await fetch("/api/tutor", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			action,
			history,
			message: userInput,
		}),
	});
	const data = await res.json();
	return data.reply;
};
