import React, { useState, useRef, useEffect } from "react";
import { getTutorResponse } from "../services/geminiService";
import { Send, Bot, User } from "lucide-react";
import { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatTutor: React.FC = () => {
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: "model",
			text: "Hello! I'm your vocabulary tutor. Try using a word like 'ubiquitous' or 'serendipity' in a sentence, and I'll give you feedback.",
		},
	]);
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSend = async () => {
		if (!input.trim() || loading) return;

		const userMsg: ChatMessage = { role: "user", text: input };
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setLoading(true);

		const history = messages.map((m) => ({
			role: m.role,
			parts: [{ text: m.text }],
		}));

		const responseText = await getTutorResponse(history, userMsg.text);

		if (responseText) {
			setMessages((prev) => [...prev, { role: "model", text: responseText }]);
		}
		setLoading(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
			{/* Header */}
			<div className="bg-white p-5 border-b border-slate-100 flex items-center space-x-4">
				<div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-md shadow-indigo-200">
					<Bot size={24} className="text-white" />
				</div>
				<div>
					<h3 className="font-extrabold text-slate-800 text-lg">
						Professor Gemini
					</h3>
					<p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
						Online
					</p>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[85%] p-5 rounded-2xl shadow-sm ${
								msg.role === "user"
									? "bg-indigo-600 text-white rounded-br-none shadow-indigo-200"
									: "bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-slate-200"
							}`}
						>
							<div
								className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${msg.role === "user" ? "text-indigo-200" : "text-slate-400"}`}
							>
								{msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
								<span>{msg.role === "model" ? "Tutor" : "You"}</span>
							</div>
							<div className="prose prose-sm md:prose-base max-w-none prose-slate">
								<ReactMarkdown remarkPlugins={[remarkGfm]}>
									{msg.text}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				))}
				{loading && (
					<div className="flex justify-start animate-pulse">
						<div className="bg-white px-6 py-4 rounded-2xl rounded-bl-none border border-slate-200">
							<div className="flex space-x-1">
								<div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
								<div
									className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: "0.1s" }}
								></div>
								<div
									className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
									style={{ animationDelay: "0.2s" }}
								></div>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="p-4 bg-white border-t border-slate-100">
				<div className="relative flex items-center">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type your sentence here..."
						className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium shadow-inner placeholder-slate-400"
					/>
					<button
						onClick={handleSend}
						disabled={loading || !input.trim()}
						className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transform active:scale-95"
					>
						<Send size={20} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatTutor;
