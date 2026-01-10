import React from "react";
import {
	BookOpen,
	Gamepad2,
	LayoutDashboard,
	MessageCircle,
	Library,
} from "lucide-react";
import { AppMode } from "@/types";

interface LayoutProps {
	currentMode: AppMode;
	setMode: (mode: AppMode) => void;
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
	const navItems = [
		{ id: AppMode.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
		{ id: AppMode.LEARN, label: "Flash Cards", icon: BookOpen },
		{ id: AppMode.BROWSER, label: "Browser", icon: Library },
		{ id: AppMode.QUIZ, label: "Quiz", icon: Gamepad2 },
		{ id: AppMode.TUTOR, label: "AI Tutor", icon: MessageCircle },
	];

	return (
		<div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans">
			{/* Desktop Sidebar */}
			<aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen shadow-sm z-10">
				<div className="mb-10 px-2">
					<h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
						COCA 16k
					</h1>
					<p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">
						Vocabulary Master
					</p>
				</div>

				<nav className="space-y-3">
					{navItems.map((item) => {
						const Icon = item.icon;
						const isActive = currentMode === item.id;
						return (
							<button
								key={item.id}
								onClick={() => setMode(item.id)}
								className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
									isActive
										? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105"
										: "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
								}`}
							>
								<Icon
									size={22}
									className={
										isActive
											? "text-white"
											: "text-slate-400 group-hover:text-indigo-600 transition-colors"
									}
								/>
								<span
									className={`font-bold text-base ${isActive ? "" : "font-semibold"}`}
								>
									{item.label}
								</span>
							</button>
						);
					})}
				</nav>

				<div className="mt-auto pt-6 border-t border-slate-100">
					<div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-2xl border border-indigo-100">
						<p className="text-xs font-semibold text-indigo-900 mb-1">
							Powered by Gemini 3
						</p>
						<p className="text-[10px] text-indigo-600/70">
							Next-gen AI tutoring enabled
						</p>
					</div>
				</div>
			</aside>

			{/* Mobile Header */}
			<header className="md:hidden flex items-center justify-between p-4 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-[60px]">
				<h1 className="text-xl font-black text-indigo-600 tracking-tight">
					COCA 16k
				</h1>
			</header>

			{/* Main Content */}
			<main className="flex-1 p-4 pb-28 md:p-8 md:pb-8 overflow-y-auto min-h-[calc(100vh-60px)] md:min-h-screen">
				<div className="max-w-6xl mx-auto h-full">{children}</div>
			</main>

			{/* Mobile Bottom Nav */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
				{navItems.map((item) => {
					const Icon = item.icon;
					const isActive = currentMode === item.id;
					return (
						<button
							key={item.id}
							onClick={() => setMode(item.id)}
							className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all ${
								isActive ? "text-indigo-600 bg-indigo-50" : "text-slate-400"
							}`}
						>
							<Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
							<span className="text-[10px] font-bold mt-1">{item.label}</span>
						</button>
					);
				})}
			</nav>
		</div>
	);
};

export default Layout;
