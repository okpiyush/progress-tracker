import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import type { JourneyStats, JourneyDay, BlogEntry } from '../types';

const LEVEL_NAMES: Record<number, string> = {
    1: 'ROOKIE', 2: 'LEARNER', 3: 'BUILDER', 4: 'HACKER', 5: 'ENGINEER',
    6: 'CRAFTSMAN', 7: 'SPECIALIST', 8: 'ARCHITECT', 9: 'PRINCIPAL', 10: 'LEGEND'
};

const DashboardPage: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState<JourneyStats | null>(null);
    const [journeyData, setJourneyData] = useState<JourneyDay[]>([]);
    const [recentLogs, setRecentLogs] = useState<BlogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, journeyRes, blogsRes] = await Promise.all([
                    api.get('/journey/stats/'),
                    api.get('/journey/days/?page_size=100'),
                    api.get('/blog/entries/?page_size=20'),
                ]);
                setStats(statsRes.data);
                const days = Array.isArray(journeyRes.data) ? journeyRes.data : (journeyRes.data.results || []);
                setJourneyData(days);
                const blogs = Array.isArray(blogsRes.data) ? blogsRes.data : (blogsRes.data.results || []);
                setRecentLogs(blogs.filter((e: any) => e.status === 'published').slice(0, 3));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading || !stats) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-surface-primary overflow-hidden relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center relative z-10"
            >
                <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center border border-accent-blue/20 mb-8 animate-pulse-soft">
                    <span className="text-3xl">⚡</span>
                </div>
                <div className="space-y-4 text-center">
                    <div className="text-xl font-bold tracking-tight text-white">Preparing your dashboard</div>
                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden mx-auto">
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            className="h-full w-2/3 bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );

    const levelName = LEVEL_NAMES[stats.level] || 'LEGEND';

    const heatmapCells = Array.from({ length: 60 }).map((_, i) => {
        const dayNum = i + 1;
        const day = journeyData.find(d => d.day_number === dayNum);
        let cls = 'upcoming';
        if (day?.status === 'completed') cls = 'done';
        else if (day?.status === 'pre_completed') cls = 'pre-done';
        else if (day?.status === 'post_completed') cls = 'post-done';
        else if (day?.status === 'active') cls = 'active';
        else if (day?.status === 'missed') cls = 'missed';
        return { id: day?.id, number: dayNum, cls, xp: day?.xp_earned || 0, title: day?.title || '', hasLog: !!day?.blog_slug };
    });

    const weekData = stats.daily_xp?.map((d: any) => ({
        name: d.day_name,
        xp: d.xp,
        isToday: new Date(d.date).toDateString() === new Date().toDateString(),
    })) || [];

    return (
        <div className="flex bg-surface-primary text-text-primary h-screen font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} stats={stats} logout={logout} />

            {/* Main content */}
            <main className="flex-1 overflow-y-auto bg-surface-primary/50 relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-purple/5 blur-[100px] rounded-full pointer-events-none -ml-24 -mb-24"></div>

                <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 relative z-10">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-bold uppercase tracking-widest border border-accent-blue/20">Dashboard</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Good morning, <span className="text-gradient-blue">{user?.username || 'User'}</span>
                            </h1>
                            <p className="text-text-secondary text-sm font-medium">Here's what's happening on your journey today.</p>
                        </div>
                        <button
                            onClick={() => {
                                const activeDay = journeyData.find(d => d.status === 'active');
                                if (activeDay) navigate(`/journey/day/${activeDay.id}`);
                                else navigate('/journey');
                            }}
                            className="btn btn-primary px-8 py-3.5 shadow-glow-blue"
                        >
                            Active Protocol
                        </button>
                    </header>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Total XP', value: stats.total_xp.toLocaleString(), sub: 'Progress point', color: 'blue', icon: '✨' },
                            { label: 'Current Streak', value: `${stats.streak} Days`, sub: `Personal best: ${user?.profile?.longest_streak || 0}`, color: 'orange', icon: '🔥' },
                            { label: 'Days Active', value: `${stats.days_completed}`, sub: `of ${stats.total_days} total`, color: 'green', icon: '✅' },
                            { label: 'Completion', value: `${stats.percent_complete}%`, sub: 'Overall journey', color: 'purple', icon: '📊' },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="card group p-6 flex flex-col justify-between hover:-translate-y-1"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`p-2 rounded-xl bg-accent-${s.color}/10 border border-accent-${s.color}/20 group-hover:scale-110 transition-transform`}>
                                        <span className="text-xl">{s.icon}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.label}</span>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white mb-2 leading-none">{s.value}</div>
                                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-tight">{s.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Heatmap & Chart */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Heatmap */}
                        <div className="lg:col-span-2 card p-8 group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">Journey Matrix</h2>
                                    <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">60-Day Progress Visualization</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4 text-[10px] text-text-muted font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[4px] bg-accent-green"></span> Done</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[4px] bg-accent-blue"></span> Active</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[4px] bg-surface-tertiary"></span> Pending</span>
                                    </div>
                                    <button onClick={() => navigate('/journey')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-blue/20 hover:text-accent-blue transition-all">
                                        <span className="text-xs">↗</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-2.5">
                                {heatmapCells.map(cell => {
                                    let statusColor = 'bg-surface-tertiary/40';
                                    let glowColor = '';
                                    if (['done', 'pre-done', 'post-done'].includes(cell.cls)) {
                                        statusColor = 'bg-accent-green';
                                        glowColor = 'hover:shadow-glow-green';
                                    }
                                    else if (cell.cls === 'missed') statusColor = 'bg-accent-red opacity-60';
                                    else if (cell.cls === 'active') {
                                        statusColor = 'bg-accent-blue ring-2 ring-accent-blue/30 ring-offset-4 ring-offset-surface-secondary';
                                        glowColor = 'shadow-glow-blue';
                                    }

                                    return (
                                        <div
                                            key={cell.number}
                                            onClick={() => cell.id && navigate(`/journey/day/${cell.id}`)}
                                            className={`heatmap-cell flex items-center justify-center cursor-pointer ${statusColor} ${glowColor}`}
                                            title={`Day ${cell.number}: ${cell.title}`}
                                        >
                                            {cell.hasLog && <span className="text-[10px] filter saturate-0 brightness-200">📓</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* XP Chart */}
                        <div className="card p-8 flex flex-col group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                            <div className="mb-10">
                                <h2 className="text-xl font-black text-white tracking-tight">Activity Graph</h2>
                                <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">Daily XP Intensity</p>
                            </div>
                            <div className="flex-1 min-h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weekData} barSize={14}>
                                        <XAxis
                                            dataKey="name"
                                            fontSize={9}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#71717a' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{
                                                background: '#121214',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                color: '#fafafa'
                                            }}
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                        <Bar dataKey="xp" radius={[4, 4, 4, 4]}>
                                            {weekData.map((entry: any, i: number) => (
                                                <Cell
                                                    key={i}
                                                    fill={entry.isToday ? 'url(#activeGradient)' : 'rgba(255,255,255,0.05)'}
                                                    stroke={entry.isToday ? '#3b82f6' : 'transparent'}
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Bar>
                                        <defs>
                                            <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1.5 opacity-60">Status</p>
                                    <p className="text-lg font-black text-white">{levelName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-1.5 opacity-60">Velocity</p>
                                    <p className="text-lg font-black text-accent-green">
                                        <span className="text-xs mr-0.5 opacity-50">×</span>
                                        {Math.min(1.0 + (stats.streak * 0.1), 2.0).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journal & CTA */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Recent Journal Entries */}
                        <div className="lg:col-span-2 card p-8 group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-white tracking-tight">Recent Journal</h2>
                                    <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">Documented Progress Logs</p>
                                </div>
                                <button onClick={() => navigate('/blog')} className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:text-white transition-colors bg-accent-blue/10 px-4 py-2 rounded-xl border border-accent-blue/10 hover:border-accent-blue/30">
                                    View All Records
                                </button>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-5">
                                {recentLogs.length === 0 ? (
                                    <div className="col-span-3 text-center py-10">
                                        <div className="text-4xl mb-4 opacity-10">✍️</div>
                                        <p className="text-text-muted text-sm font-medium italic">Your journal is empty. Start writing your daily progress.</p>
                                    </div>
                                ) : recentLogs.map((log) => (
                                    <div
                                        key={log.slug}
                                        onClick={() => navigate(`/u/${user?.username}/${log.slug}`)}
                                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-blue/40 hover:bg-white/[0.04] transition-all cursor-pointer flex flex-col justify-between group/item"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{log.published_at ? new Date(log.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Draft'}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-accent-blue opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                            </div>
                                            <h4 className="text-base font-bold text-white line-clamp-2 leading-tight group-hover/item:text-accent-blue transition-colors">{log.title}</h4>
                                        </div>
                                        <div className="mt-8 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest">Read Entry</span>
                                            <span className="text-sm font-bold opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all">→</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Call to Action Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                                const activeDay = journeyData.find(d => d.status === 'active');
                                if (activeDay) navigate(`/journey/day/${activeDay.id}`);
                                else navigate('/journey');
                            }}
                            className="card p-8 bg-gradient-to-br from-indigo-600/20 via-blue-600/10 to-transparent border-indigo-500/20 hover:border-indigo-400/40 cursor-pointer flex flex-col justify-between group/cta overflow-hidden relative shadow-glow-blue/5"
                        >
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-2xl -ml-12 -mb-12 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-indigo-500/20 group-hover:border-indigo-400/40 transition-all">
                                        <span className="text-xl">🏔️</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Next Target</span>
                                        <span className="text-sm font-bold text-white">Daily Accomplishment</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-4 group-hover:text-gradient-blue transition-all">Day {stats.days_completed + 1}</h2>
                                <p className="text-text-secondary text-sm font-medium leading-relaxed mb-6">
                                    Keep the momentum going. Document your progress for Day {stats.days_completed + 1} and protect your {stats.streak}-day streak.
                                </p>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Progress to next level</span>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{stats.percent_complete}%</span>
                                </div>
                                <button className="btn w-full bg-white text-bg-primary hover:bg-indigo-50 font-black uppercase text-[11px] tracking-[0.1em] shadow-xl group-hover:shadow-indigo-500/20 transition-all py-3.5">
                                    Continue My Journey
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
