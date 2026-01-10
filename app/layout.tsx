import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

export const metadata: Metadata = {
	metadataBase: new URL("https://coca.qz-l.com"),
	title: "Coca 16515",
	description:
		"A gamified English vocabulary learning application leveraging the top 16,515 COCA words and Gemini 3 AI for personalized tutoring, context generation, and smart quizzes.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
	openGraph: {
		title: "Coca 16515",
		description:
			"A gamified English vocabulary learning application leveraging the top 16,515 COCA words and Gemini 3 AI for personalized tutoring, context generation, and smart quizzes.",
		images: [
			{
				url: "/coca.png",
				width: 480,
				height: 360,
			},
		],
		siteName: "Coca 16515",
		type: "website",
		url: "https://coca.qz-l.com",
	},
	twitter: {
		card: "summary_large_image",
		title: "Coca 16515",
		description: "Smart short links with safety preview and AI analysis.",
		images: ["/coca.png"],
	},
};

const inter = Inter({
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
			<body className="bg-slate-900 text-slate-50 font-sans antialiased">
				{children}
			</body>
		</html>
	);
}
