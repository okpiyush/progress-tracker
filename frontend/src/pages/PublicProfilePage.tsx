import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    XAxis, Tooltip,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import type { BlogEntry } from '../types';
import { motion } from 'framer-motion';

const LEVEL_NAMES: Record<number, string> = {
    1: 'ROOKIE', 2: 'LEARNER', 3: 'BUILDER', 4: 'HACKER', 5: 'ENGINEER',
    6: 'CRAFTSMAN', 7: 'SPECIALIST', 8: 'ARCHITECT', 9: 'PRINCIPAL', 10: 'LEGEND'
};

interface ProfileData {
    display_name: string;
    avatar_emoji: string;
    bio: string;
    github_url: string;
    linkedin_url: string;
    resume_url: string;
    leetcode_url: string;
    journey_title: string;
    total_xp: number;
    current_level: number;
    current_streak: number;
    longest_streak: number;
    journey_grid: any[];
    xp_history: any[];
    recent_blogs: BlogEntry[];
}

const PublicProfilePage: React.FC = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<ProfileData | null>(null);
    const [error, setError] = useState(false);

    const safeUrl = (url: string, platform?: 'github' | 'linkedin' | 'leetcode' | 'resume') => {
        if (!url) return '#';
        let formattedUrl = url;
        if (!formattedUrl.includes('.') && platform) {
            if (platform === 'github') formattedUrl = `github.com/${formattedUrl}`;
            if (platform === 'linkedin') formattedUrl = `linkedin.com/in/${formattedUrl}`;
            if (platform === 'leetcode') formattedUrl = `leetcode.com/${formattedUrl}`;
        }
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            return `https://${formattedUrl}`;
        }
        return formattedUrl;
    };

    useEffect(() => {
        api.get(`/auth/public/profiles/${username}/`)
            .then(res => setData(res.data))
            .catch(() => setError(true));
    }, [username]);

    if (error) return (
        <div className="h-screen bg-surface-primary flex flex-col items-center justify-center font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
            >
                <div className="text-8xl font-black text-white/5 tracking-tighter">404</div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white">Profile Not Found</h2>
                    <p className="text-text-secondary font-medium italic">The requested identity does not exist in our systems.</p>
                </div>
                <button onClick={() => navigate('/')} className="btn btn-secondary px-8 shadow-premium font-black uppercase tracking-[0.2em] text-[10px]">
                    Return to Nexus
                </button>
            </motion.div>
        </div>
    );

    if (!data) return (
        <div className="h-screen bg-surface-primary flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Accessing Data Stream...</p>
        </div>
    );

    const levelName = LEVEL_NAMES[data.current_level] || 'LEGEND';
    const grid = data.journey_grid || [];
    const completed = grid.filter((c: any) => ['completed', 'pre_completed', 'post_completed'].includes(c.status)).length;
    const missed = grid.filter((c: any) => c.status === 'missed').length;
    const remaining = 60 - completed - missed;
    const pct = Math.round((completed / 60) * 100);

    return (
        <div className="bg-surface-primary min-h-screen text-text-primary font-sans relative overflow-x-hidden">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full pointer-events-none -mr-64 -mt-64"></div>
            <div className="absolute top-[800px] left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none -ml-48"></div>

            <header className="border-b border-white/5 px-8 md:px-12 py-6 flex items-center justify-between sticky top-0 bg-surface-primary/80 backdrop-blur-xl z-[60]">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-accent-blue/10 rounded-xl flex items-center justify-center text-accent-blue font-black border border-accent-blue/20 group-hover:scale-110 transition-transform">
                        L
                    </div>
                    <span className="font-black tracking-tighter text-2xl text-white">LiveJourney</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-accent-green/10 text-accent-green rounded-full text-[9px] font-black uppercase tracking-widest border border-accent-green/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green inline-block mr-2 animate-pulse"></span>
                        Status: Operational
                    </span>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16 relative z-10">
                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-10 md:p-16 relative overflow-hidden group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/10 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-accent-blue/20 transition-all duration-1000"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent-blue/20 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-1000"></div>
                            <div className="relative text-9xl md:text-[12rem] leading-none select-none transition-filter group-hover:brightness-125 duration-500 hover:scale-105 transition-transform">
                                {data.avatar_emoji}
                            </div>
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-2 bg-accent-blue text-white rounded-2xl text-xs font-black shadow-glow-blue border border-white/20 whitespace-nowrap"
                            >
                                LEVEL {data.current_level}
                            </motion.div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tightest leading-none">
                                    {data.display_name}
                                </h1>
                                <p className="text-xl md:text-2xl text-text-secondary max-w-2xl font-medium leading-relaxed italic">
                                    "{data.bio || 'Building the future, one commit at a time.'}"
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-3 opacity-60">Cumulative XP</p>
                                    <p className="text-3xl font-black text-white">✨ {data.total_xp.toLocaleString()}</p>
                                </div>
                                <div className="w-[1px] h-12 bg-white/10 hidden sm:block self-end"></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-3 opacity-60">Active Streak</p>
                                    <p className="text-3xl font-black text-accent-orange">🔥 {data.current_streak} <span className="text-xs font-bold opacity-60">DAYS</span></p>
                                </div>
                                <div className="w-[1px] h-12 bg-white/10 hidden sm:block self-end"></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mb-3 opacity-60">Class Rank</p>
                                    <p className="text-3xl font-black text-gradient-blue uppercase tracking-tighter">{levelName}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                {data.github_url && (
                                    <a href={safeUrl(data.github_url, 'github')} target="_blank" rel="noreferrer" className="btn bg-white/[0.03] border-white/10 hover:border-white/20 px-8 py-3.5 shadow-premium text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group/link">
                                        <span className="text-text-muted group-hover/link:text-accent-blue transition-colors">GH</span> GitHub ↗
                                    </a>
                                )}
                                {data.linkedin_url && (
                                    <a href={safeUrl(data.linkedin_url, 'linkedin')} target="_blank" rel="noreferrer" className="btn bg-white/[0.03] border-white/10 hover:border-white/20 px-8 py-3.5 shadow-premium text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group/link">
                                        <span className="text-text-muted group-hover/link:text-accent-blue transition-colors">LI</span> LinkedIn ↗
                                    </a>
                                )}
                                {data.leetcode_url && (
                                    <a href={safeUrl(data.leetcode_url, 'leetcode')} target="_blank" rel="noreferrer" className="btn bg-white/[0.03] border-white/10 hover:border-white/20 px-8 py-3.5 shadow-premium text-[10px] font-black uppercase tracking-widest flex items-center gap-3 group/link">
                                        <span className="text-text-muted group-hover/link:text-accent-blue transition-colors">LC</span> LeetCode ↗
                                    </a>
                                )}
                                {data.resume_url && (
                                    <a href={safeUrl(data.resume_url, 'resume')} target="_blank" rel="noreferrer" className="btn bg-accent-blue/10 border-accent-blue/20 hover:border-accent-blue/40 px-8 py-3.5 shadow-glow-blue/10 text-[10px] font-black text-accent-blue uppercase tracking-widest flex items-center gap-3">
                                        <span className="text-accent-blue opacity-50">CV</span> View Resume ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left Col - Progress & Matrix */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Matrix Area */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Activity Hub</h2>
                                <div className="flex gap-6 text-[9px] font-black text-text-muted uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-[4px] bg-accent-green"></span> Done</div>
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-[4px] bg-accent-blue"></span> Active</div>
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 bg-white/[0.05] rounded-[4px]"></span> Pending</div>
                                </div>
                            </div>

                            <div className="card p-10 md:p-12 group">
                                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2.5">
                                    {grid.map((cell: any, i: number) => {
                                        let statusColor = 'bg-white/[0.03]';
                                        let glow = '';
                                        if (['completed', 'pre_completed', 'post_completed'].includes(cell.status)) {
                                            statusColor = 'bg-accent-green';
                                            glow = 'hover:shadow-glow-green';
                                        }
                                        else if (cell.status === 'missed') statusColor = 'bg-accent-red opacity-60';
                                        else if (cell.status === 'active') {
                                            statusColor = 'bg-accent-blue ring-2 ring-accent-blue/30 ring-offset-4 ring-offset-surface-secondary';
                                            glow = 'shadow-glow-blue';
                                        }

                                        return (
                                            <motion.div
                                                key={cell.day_number}
                                                onClick={() => cell.blog_slug && navigate(`/u/${username}/${cell.blog_slug}`)}
                                                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.01 }}
                                                className={`aspect-square rounded-md text-[9px] font-black flex items-center justify-center transition-all duration-300 ${statusColor} ${glow} ${cell.blog_slug ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}`}
                                            >
                                                {cell.blog_slug ? '📓' : cell.status === 'active' ? '●' : ''}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Recent Blogs */}
                        <section className="space-y-6">
                            <div className="px-2">
                                <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Public Log</h2>
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">Shared Journeys & Insights</p>
                            </div>

                            <div className="grid md:grid-cols-1 gap-6">
                                {data.recent_blogs?.length > 0 ? data.recent_blogs.map((blog: any, i: number) => (
                                    <motion.div
                                        key={blog.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => navigate(`/u/${username}/${blog.slug}`)}
                                        className="card p-8 group cursor-pointer hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-accent-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Day {blog.day_number}</span>
                                                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">{blog.published_at ? new Date(blog.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'LOGGED'}</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-white group-hover:text-accent-blue transition-colors leading-tight">
                                                {blog.title}
                                            </h4>
                                            <div className="flex gap-2">
                                                {blog.tags?.slice(0, 3).map((t: string) => (
                                                    <span key={t} className="text-[9px] font-black text-text-muted bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5 uppercase tracking-tighter">#{t}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center gap-4">
                                            <span className="text-[10px] font-black text-accent-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">Read Entry →</span>
                                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-blue/20 transition-colors">
                                                <span className="text-lg">↗</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="card p-20 text-center border-dashed border-white/10">
                                        <div className="text-4xl mb-4 opacity-20">📭</div>
                                        <p className="text-text-muted font-black uppercase tracking-widest text-[10px]">Archives are empty for this user</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Col - Progress & Chart */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Progress Section */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-white tracking-tight px-2 uppercase tracking-[0.1em]">Protocol Stats</h2>
                            <div className="card p-8 md:p-10 space-y-10 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16 group-hover:opacity-100 opacity-50 transition-opacity"></div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">Status</p>
                                        <p className="text-xl font-black text-white">{data.journey_title || '60-Day Challenge'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-gradient-green">{pct}%</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">
                                        <span>Current milestone</span>
                                        <span className="text-white">Day {completed} / 60</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${pct}%` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            className="h-full bg-accent-green shadow-glow-green/30"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">Locked</p>
                                        <p className="text-lg font-black text-accent-green">{completed}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">Void</p>
                                        <p className="text-lg font-black text-accent-red">{missed}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">Target</p>
                                        <p className="text-lg font-black text-white font-black">{remaining}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Chart Area */}
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-white tracking-tight px-2 uppercase tracking-[0.1em]">XP Velocity</h2>
                            <div className="card p-8 md:p-10 min-h-[350px] flex flex-col group relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-blue/5 blur-[80px] rounded-full point-events-none -mb-16 -mr-16"></div>

                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-10 opacity-60">Engagement Intensity</p>

                                {data.xp_history && data.xp_history.length > 0 ? (
                                    <div className="flex-1 w-full relative h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.xp_history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="day" hide />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#09090b',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        borderRadius: '12px',
                                                        fontSize: '10px',
                                                        fontWeight: 'black',
                                                        textTransform: 'uppercase'
                                                    }}
                                                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                                                />
                                                <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" animationDuration={2000} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                        <div className="text-2xl opacity-10">📉</div>
                                        <p className="text-text-muted font-black uppercase tracking-widest text-[9px]">Awaiting Data Points</p>
                                    </div>
                                )}

                                <div className="mt-10 pt-8 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Protocol Version</p>
                                        <p className="text-[10px] font-black text-white">v3.0.4 - STABLE</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="py-20 border-t border-white/5 mt-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/[0.01] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white font-black text-sm">L</div>
                        <span className="font-black tracking-tightest uppercase text-[10px] text-text-muted">LiveJourney OS // Protocol 2026</span>
                    </div>
                    <div className="flex gap-10 text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">
                        <a href="#" className="hover:text-white transition-colors">Safety</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Sync</a>
                    </div>
                    <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.4em]">
                        Architect the Void
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PublicProfilePage;
