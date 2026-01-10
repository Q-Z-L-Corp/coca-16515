"use client";

import App from "./App";
import { UserStatsProvider } from "./UserStatsProvider";

export default function Home() {
	return (
		<UserStatsProvider>
			<App />;
		</UserStatsProvider>
	);
}
