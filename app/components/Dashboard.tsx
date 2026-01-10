import React from "react";
import { UserStats } from "@/types";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import {
	Trophy,
	Flame,
	Brain,
	Target,
	ArrowRight,
	ChevronDown,
} from "lucide-react";

interface DashboardProps {
	stats: UserStats;
}

const StatCard: React.FC<{
	title: string;
	value: string | number;
	icon: React.ElementType;
	colorClass: string;
	bgClass: string;
}> = ({ title, value, icon: Icon, colorClass, bgClass }) => (
	<div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center space-x-5 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-default">
		<div className={`p-4 rounded-2xl ${bgClass} ${colorClass}`}>
			<Icon size={32} strokeWidth={2.5} />
		</div>
		<div>
			<p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
				{title}
			</p>
			<h3 className="text-3xl font-black text-slate-800">{value}</h3>
		</div>
	</div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
	return (
		<div className="space-y-8 animate-fade-in pb-20">
			<div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
				<div>
					<h2 className="text-4xl font-extrabold text-slate-800 mb-2">
						Hello, Scholar 👋
					</h2>
					<p className="text-slate-500 font-medium">
						Ready to expand your vocabulary today?
					</p>
				</div>
				<div className="hidden md:block text-right">
					<p className="text-sm text-slate-400 font-medium">Current Goal</p>
					<p className="text-lg font-bold text-indigo-600">Top 5000 Words</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Words Learned"
					value={stats.wordsLearned}
					icon={Brain}
					colorClass="text-violet-600"
					bgClass="bg-violet-100"
				/>
				<StatCard
					title="XP Earned"
					value={stats.xp}
					icon={Trophy}
					colorClass="text-amber-500"
					bgClass="bg-amber-100"
				/>
				<StatCard
					title="Day Streak"
					value={stats.streak}
					icon={Flame}
					colorClass="text-rose-500"
					bgClass="bg-rose-100"
				/>
				<StatCard
					title="Level"
					value={stats.level}
					icon={Target}
					colorClass="text-emerald-500"
					bgClass="bg-emerald-100"
				/>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Chart Section */}
				<div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/40">
					<div className="flex justify-between items-center mb-8">
						<h3 className="text-2xl font-bold text-slate-800">
							Learning Activity
						</h3>

						{/* Custom Styled Select */}
						<div className="relative group">
							<select className="appearance-none bg-white border border-slate-200 text-slate-600 font-bold text-sm py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all">
								<option>This Week</option>
								<option>Last Week</option>
							</select>
							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
								<ChevronDown size={16} strokeWidth={2.5} />
							</div>
						</div>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={stats.history}>
								<XAxis
									dataKey="date"
									stroke="#94a3b8"
									fontSize={13}
									fontWeight={600}
									tickLine={false}
									axisLine={false}
									dy={10}
								/>
								<YAxis hide />
								<Tooltip
									cursor={{ fill: "#f1f5f9", radius: 8 }}
									contentStyle={{
										backgroundColor: "#1e293b",
										borderRadius: "12px",
										border: "none",
										color: "#f8fafc",
										boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
									}}
									itemStyle={{ color: "#fff", fontWeight: "bold" }}
								/>
								<Bar dataKey="xp" radius={[8, 8, 8, 8]} barSize={40}>
									{stats.history.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={
												index === stats.history.length - 1
													? "#4f46e5"
													: "#e2e8f0"
											}
											className="transition-all duration-300 hover:opacity-80"
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Progress Card */}
				<div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 shadow-xl shadow-indigo-200 flex flex-col justify-between text-white relative overflow-hidden">
					{/* Decorative circles */}
					<div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
					<div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8 blur-lg"></div>

					<div>
						<div className="flex items-center space-x-2 mb-4 opacity-90">
							<Target size={20} />
							<span className="font-bold text-sm uppercase tracking-wider">
								Mastery Goal
							</span>
						</div>
						<h3 className="text-3xl font-black mb-2">0.8%</h3>
						<p className="text-indigo-100 font-medium leading-relaxed">
							You have mastered{" "}
							<span className="font-bold text-white">142</span> out of 16,515
							words.
						</p>
					</div>

					<div className="mt-8">
						<div className="flex justify-between text-xs font-bold text-indigo-200 mb-2">
							<span>Beginner</span>
							<span>Master</span>
						</div>
						<div className="w-full bg-black/20 rounded-full h-3 mb-8 backdrop-blur-sm">
							<div
								className="bg-white h-3 rounded-full shadow-lg relative"
								style={{ width: `${(stats.wordsLearned / 16515) * 100}%` }}
							>
								<div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md scale-125"></div>
							</div>
						</div>

						<button className="w-full py-4 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center group shadow-lg">
							Continue Learning{" "}
							<ArrowRight
								size={18}
								className="ml-2 group-hover:translate-x-1 transition-transform"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
