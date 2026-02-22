import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';

import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG: Record<string, { icon: string; label: string; cls: string }> = {
    completed: { icon: '✓', label: 'Done', cls: 'text-accent-green' },
    pre_completed: { icon: '⚡', label: 'Pre', cls: 'text-accent-blue' },
    post_completed: { icon: '↩', label: 'Recovered', cls: 'text-accent-orange' },
    active: { icon: '▶', label: 'Active', cls: 'text-accent-green animate-pulse' },
    missed: { icon: '✕', label: 'Missed', cls: 'text-accent-red' },
    upcoming: { icon: '·', label: 'Locked', cls: 'text-text-muted' },
};

const WEEK_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

const JourneyPage: React.FC = () => {
    const [weeks, setWeeks] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
    const navigate = useNavigate();
    const { user } = useAuthStore();

    useEffect(() => {
        api.get('/journey/weeks/?page_size=20').then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setWeeks(data);
            const activeWeek = data.find((w: any) => w.days?.some((d: any) => d.status === 'active'));
            if (activeWeek) setExpandedWeek(activeWeek.id);
            else if (data.length > 0) setExpandedWeek(data[0].id);
        }).catch(console.error);
        api.get('/journey/stats/').then(res => setStats(res.data)).catch(console.error);
    }, []);

    const getWeekProgress = (week: any) => {
        const days = week.days || [];
        const done = days.filter((d: any) => ['completed', 'pre_completed', 'post_completed'].includes(d.status)).length;
        return { done, total: days.length, pct: days.length ? Math.round((done / days.length) * 100) : 0 };
    };

    return (
        <div className="flex bg-surface-primary text-text-primary h-screen font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} stats={stats} logout={useAuthStore.getState().logout} />

            {/* Main */}
            <main className="flex-1 overflow-y-auto bg-surface-primary relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full pointer-events-none -mr-64 -mt-64"></div>

                <div className="max-w-5xl mx-auto p-8 md:p-12 space-y-12 relative z-10">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 animate-fade-in">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">Timeline</span>
                                <span className="px-2.5 py-1 bg-accent-green/10 text-accent-green rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-green/20">Progress Protocol</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Journey <span className="text-gradient-blue">Roadmap</span>
                            </h1>
                            <p className="text-text-secondary font-medium">Strategize your growth and visualize your evolution through milestones.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-1">Completion</p>
                                <p className="text-2xl font-black text-white">{stats?.percent_complete || 0}%</p>
                            </div>
                            {user?.username && (
                                <button onClick={() => navigate(`/u/${user.username}`)} className="btn btn-secondary px-6 shadow-premium">
                                    Public Report ↗
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="space-y-6">
                        {weeks.map((week, wi) => {
                            const prog = getWeekProgress(week);
                            const color = WEEK_COLORS[wi % WEEK_COLORS.length];
                            const isOpen = expandedWeek === week.id;
                            const hasActive = week.days?.some((d: any) => d.status === 'active');

                            return (
                                <div
                                    key={week.id}
                                    className={`card overflow-hidden transition-all duration-500 border-white/5 ${isOpen ? 'ring-1 ring-accent-blue/30 bg-white/[0.03]' : 'hover:bg-white/[0.01]'}`}
                                >
                                    {/* Week header */}
                                    <div
                                        onClick={() => setExpandedWeek(isOpen ? null : week.id)}
                                        className="flex items-center justify-between p-8 cursor-pointer relative group"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-accent-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex items-center gap-8">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg"
                                                style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                                            >
                                                <span className="text-[10px] uppercase tracking-tighter opacity-70">WK</span>
                                                <span className="text-xl leading-none">{week.week_number}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">{week.theme || 'Focus Phase'}</p>
                                                <h3 className="text-xl font-bold text-white group-hover:text-accent-blue transition-colors">
                                                    {week.title}
                                                    {hasActive && <span className="ml-4 px-2 py-1 bg-accent-green/10 text-accent-green text-[9px] rounded-lg uppercase font-black border border-accent-green/20 align-middle">In Progress</span>}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="hidden md:block">
                                                <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
                                                    <span>Phase completion</span>
                                                    <span className="text-white">{prog.pct}%</span>
                                                </div>
                                                <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-accent-blue"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${prog.pct}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={`text-2xl text-text-muted transition-all duration-500 ${isOpen ? 'rotate-180 text-accent-blue' : 'group-hover:translate-y-1'}`}>
                                                ⌄
                                            </div>
                                        </div>
                                    </div>

                                    {/* Days */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: 'circOut' }}
                                                className="border-t border-white/5 bg-black/20"
                                            >
                                                <div className="divide-y divide-white/[0.03]">
                                                    {(week.days || []).map((day: any) => {
                                                        const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.upcoming;
                                                        const isDone = ['completed', 'pre_completed', 'post_completed'].includes(day.status);
                                                        const isActive = day.status === 'active';
                                                        const isLocked = day.status === 'upcoming';

                                                        return (
                                                            <div
                                                                key={day.id}
                                                                onClick={() => navigate(`/journey/day/${day.id}`)}
                                                                className={`flex items-center justify-between p-6 px-10 transition-all cursor-pointer relative group/day ${isLocked ? 'opacity-60 hover:opacity-100' : 'hover:bg-white/[0.04]'}`}
                                                            >
                                                                <div className="flex items-center gap-8">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-all shadow-sm ${isDone ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : isActive ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/40 shadow-glow-blue/20' : 'bg-white/5 text-text-muted border border-white/5'}`}>
                                                                        {cfg.icon}
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <div className="flex items-center gap-3">
                                                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">Day {day.day_number}</p>
                                                                            {day.blog_slug && <span className="text-[9px] bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Logged</span>}
                                                                        </div>
                                                                        <h4 className={`text-base font-bold transition-colors ${isActive ? 'text-accent-blue' : 'text-white'} ${day.status === 'missed' ? 'line-through text-text-muted' : ''}`}>{day.title}</h4>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-10">
                                                                    <div className="text-right hidden sm:block">
                                                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 shadow-sm ${isDone ? 'text-accent-green' : 'text-text-muted opacity-40'}`}>{isDone ? 'Earned' : 'Reward'}</p>
                                                                        <p className={`text-base font-black ${isDone ? 'text-accent-green' : 'text-text-muted'}`}>{isDone ? `+${day.xp_earned}` : `${day.xp_reward}`} XP</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center opacity-0 group-hover/day:opacity-100 transition-all ${isDone ? 'text-accent-green' : 'text-accent-blue'}`}>
                                                                            →
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {weeks.length === 0 && (
                            <div className="py-32 flex flex-col items-center justify-center space-y-4">
                                <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-text-muted font-black uppercase tracking-widest text-xs">Loading Timeline...</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JourneyPage;
