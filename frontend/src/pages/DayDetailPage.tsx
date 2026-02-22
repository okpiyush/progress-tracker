import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import XPPop from '../components/XPPop';
import LevelUpOverlay from '../components/LevelUpOverlay';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';
import confetti from 'canvas-confetti';
import type { JourneyDay, Task as ITask } from '../types';

const DayDetailPage: React.FC = () => {
    const { dayId } = useParams<{ dayId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [day, setDay] = useState<JourneyDay | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [pops, setPops] = useState<{ id: number; xp: number; x: number; y: number }[]>([]);
    const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);
    const [kcAnswers, setKcAnswers] = useState<Record<number, string>>({});
    const [isSaving, setIsSaving] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const fetchDay = useCallback(() => {
        api.get(`/journey/days/${dayId}/`).then(res => {
            setDay(res.data);
            const answers: Record<number, string> = {};
            res.data.knowledge_checks.forEach((kc: any) => {
                answers[kc.id] = kc.answer_notes || '';
            });
            setKcAnswers(answers);
            setError(null);
        }).catch(err => {
            console.error(err);
            setError(err.response?.status === 404 ? 'PROTOCOL_NOT_FOUND' : 'SYSTEM_MALFUNCTION');
        });
    }, [dayId]);

    const fetchStats = useCallback(() => {
        api.get('/journey/stats/').then(res => setStats(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        fetchDay();
        fetchStats();
    }, [fetchDay, fetchStats]);

    const handleLevelUp = (newLevel: number) => {
        setLevelUpData({ level: newLevel, title: "Level Up!" });
    };

    const toggleTask = (taskId: number, e: React.MouseEvent) => {
        api.patch(`/journey/tasks/${taskId}/toggle/`).then(res => {
            const data = res.data;
            if (data.xp_gained > 0) {
                setPops(prev => [...prev, { id: Date.now(), xp: data.xp_gained, x: e.clientX, y: e.clientY }]);
            }
            if (data.leveled_up) {
                handleLevelUp(data.new_level);
            }
            fetchDay();
            fetchStats();
        });
    };

    const saveKC = (kcId: number) => {
        setIsSaving(kcId);
        api.patch(`/journey/knowledge-checks/${kcId}/`, {
            answer_notes: kcAnswers[kcId],
            is_answered: !!kcAnswers[kcId] && kcAnswers[kcId].trim().length > 0
        })
            .then(() => {
                fetchDay();
                setTimeout(() => setIsSaving(null), 1000);
            })
            .catch(console.error);
    };

    const markComplete = () => {
        api.patch(`/journey/days/${dayId}/complete/`).then(res => {
            const data = res.data;
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00FF88', '#3B82F6', '#8B5CF6']
            });
            if (data.leveled_up) handleLevelUp(data.new_level);
            fetchDay();
            fetchStats();
            if (data.perfect_week) {
                // Could be a toast/overlay instead of alert
                console.log("PERFECT WEEK BONUS");
            }
        });
    };

    const flexComplete = (type: 'pre' | 'post') => {
        const endpoint = type === 'pre'
            ? `/journey/days/${dayId}/pre-complete/`
            : `/journey/days/${dayId}/post-complete/`;
        api.patch(endpoint).then(res => {
            const data = res.data;
            confetti({ particleCount: 100, spread: 50, origin: { y: 0.7 } });
            if (data.leveled_up) handleLevelUp(data.new_level);
            fetchDay();
            fetchStats();
        }).catch(err => {
            alert(err.response?.data?.error || "Action failed.");
        });
    };

    const deleteTask = (taskId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Terminate this task node?")) {
            api.delete(`/journey/tasks/${taskId}/`).then(() => {
                fetchDay();
            });
        }
    };

    const updateTitle = (newTitle: string) => {
        api.patch(`/journey/days/${dayId}/`, { title: newTitle }).then(() => {
            fetchDay();
            setIsEditingTitle(false);
        });
    };

    if (error) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-surface-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/5 blur-[120px] rounded-full pointer-events-none -mr-24 -mt-24"></div>
            <div className="w-20 h-20 bg-accent-red/10 rounded-3xl flex items-center justify-center border border-accent-red/20 mb-8">
                <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">{error}</h2>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mb-10">Requested Day ID {dayId} is out of bounds or unauthorized.</p>
            <button
                onClick={() => navigate('/journey')}
                className="bg-accent-blue text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-glow-blue transition-all"
            >
                Return to Matrix
            </button>
        </div>
    );

    if (!day) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-surface-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-24 -mt-24"></div>
            <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-2xl animate-spin mb-6 shadow-glow-blue/20"></div>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Core Details</p>
        </div>
    );

    const completedTasks = day.tasks.filter((t: ITask) => t.is_completed).length;
    const progressPercent = Math.floor((completedTasks / day.tasks.length) * 100) || 0;
    const dayDate = new Date(day.date).toDateString();
    const todayStr = new Date().toDateString();
    const isToday = dayDate === todayStr;
    const isFinalized = ['completed', 'pre_completed', 'post_completed'].includes(day.status);

    return (
        <div className="flex bg-surface-primary text-text-primary h-screen font-sans overflow-hidden">
            <Sidebar user={user} stats={stats} logout={useAuthStore.getState().logout} />

            <main className="flex-1 overflow-y-auto relative no-scrollbar">
                {/* Ambient Decorative Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent-blue/5 blur-[150px] rounded-full pointer-events-none -mr-64 -mt-64"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none -ml-48 -mb-48"></div>

                <AnimatePresence>
                    {pops.map(pop => (
                        <XPPop key={pop.id} xp={pop.xp} x={pop.x} y={pop.y} onComplete={() => setPops(prev => prev.filter(p => p.id !== pop.id))} />
                    ))}
                </AnimatePresence>

                {levelUpData && <LevelUpOverlay level={levelUpData.level} title={levelUpData.title} onClose={() => setLevelUpData(null)} />}

                <div className="p-8 md:p-12 max-w-[1400px] mx-auto space-y-12 relative z-10 pb-24">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 animate-fade-in group pb-4">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/journey')}
                                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 group/back"
                                >
                                    <span className="group-hover/back:-translate-x-1 transition-transform">←</span>
                                </button>
                                <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                                <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                                    Day {day.day_number}
                                </span>
                                {isToday && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-accent-green/10 text-accent-green rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-green/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                                        Live Now
                                    </span>
                                )}
                            </div>
                            {isEditingTitle ? (
                                <input
                                    autoFocus
                                    className="bg-transparent border-b-2 border-accent-blue outline-none text-4xl md:text-6xl font-black text-white tracking-tightest leading-none w-full"
                                    defaultValue={day.title}
                                    onBlur={(e) => updateTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && updateTitle((e.target as HTMLInputElement).value)}
                                />
                            ) : (
                                <h1
                                    onClick={() => !isFinalized && setIsEditingTitle(true)}
                                    className={`text-4xl md:text-6xl font-black text-white tracking-tightest leading-none ${isFinalized ? 'cursor-default' : 'cursor-text hover:text-white/80'} transition-colors`}
                                >
                                    {day.title}
                                </h1>
                            )}
                            <div className="flex flex-wrap items-center gap-6 pt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">Status Protocol:</span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${day.status === 'completed' || day.status.includes('completed') ? 'text-accent-green' : 'text-accent-orange'}`}>
                                        {day.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-white/10 shrink-0"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-60">Temporal Ref:</span>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{dayDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl backdrop-blur-md flex items-end gap-6 group/xp">
                            <div className="text-right">
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-1 shadow-glow-orange/0 group-hover/xp:shadow-glow-orange/20 transition-all">Reward Integrity</p>
                                <p className="text-4xl font-black text-accent-orange leading-none">+{day.xp_reward}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-xl shadow-glow-orange/10">✨</div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Tasks (Lg: 8) */}
                        <div className="lg:col-span-12 xl:col-span-8 space-y-10">
                            <section className="card p-4 md:p-10 border-white/5 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 blur-3xl -mr-32 -mt-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Daily Execution</h2>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mt-1">Operational Objectives</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-0.5">Integrity</p>
                                            <p className="text-sm font-black text-white tracking-tighter">{completedTasks} / {day.tasks.length}</p>
                                        </div>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/10">
                                            <span className="text-lg">🎯</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10">
                                    {day.tasks.map((task: ITask, i) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={(e) => (!isFinalized && !task.is_completed) && toggleTask(task.id, e)}
                                            className={`group/task flex items-center gap-5 p-5 md:p-6 rounded-2xl ${(isFinalized || task.is_completed) ? 'cursor-default' : 'cursor-pointer'} transition-all border ${task.is_completed
                                                ? 'bg-accent-green/[0.03] border-accent-green/20'
                                                : 'bg-white/[0.02] border-white/5 ' + (!isFinalized ? 'hover:border-accent-blue/30 hover:bg-white/[0.04]' : '')}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${task.is_completed
                                                ? 'bg-accent-green text-black border-accent-green shadow-glow-green/20'
                                                : 'bg-transparent border-white/10 text-text-muted group-hover/task:border-accent-blue/40 group-hover/task:text-accent-blue'}`}>
                                                {task.is_completed ? <span className="font-black text-xs">✓</span> : <span className="text-[10px] font-black opacity-30">{i + 1}</span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-base font-black tracking-tight leading-tight ${task.is_completed ? 'line-through text-text-muted opacity-60' : 'text-white'}`}>
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2.5">
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${task.difficulty === 'easy' ? 'text-accent-green bg-accent-green/10' : task.difficulty === 'hard' ? 'text-accent-red bg-accent-red/10' : 'text-accent-blue bg-accent-blue/10'}`}>
                                                        {task.difficulty}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">+{task.xp_value} XP Payload</span>
                                                </div>
                                            </div>
                                            {!isFinalized && (
                                                <div className="opacity-0 group-hover/task:opacity-100 transition-opacity flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => deleteTask(task.id, e)}
                                                        className="w-8 h-8 rounded-lg bg-accent-red/10 text-accent-red flex items-center justify-center hover:bg-accent-red hover:text-white transition-all text-sm"
                                                    >
                                                        ✕
                                                    </button>
                                                    <span className="text-lg grayscale group-hover/task:grayscale-0 transition-all cursor-default">✨</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-12 pt-10 border-t border-white/5 relative z-10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1 opacity-60">Completion Density</p>
                                            <p className="text-xl font-black text-white tracking-tighter">{progressPercent}% Calculated</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1 opacity-60">Yield Status</p>
                                            <p className={`text-xl font-black tracking-tighter ${progressPercent === 100 ? 'text-accent-green' : 'text-accent-blue'}`}>
                                                {progressPercent === 100 ? 'MAXIMAL' : 'OPERATIONAL'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, ease: "circOut" }}
                                            className={`h-full rounded-full ${progressPercent === 100 ? 'bg-gradient-to-r from-accent-green to-accent-blue shadow-glow-green/20' : 'bg-accent-blue shadow-glow-blue/20'}`}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Finalize Section */}
                            {(progressPercent === 100 && (day.status === 'active' || day.status === 'upcoming')) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-1 rounded-[2rem] bg-gradient-to-r from-accent-green/40 via-accent-blue/40 to-accent-purple/40 shadow-glow-green/20 animate-pulse-slow"
                                >
                                    <button
                                        onClick={markComplete}
                                        className="w-full bg-surface-secondary py-8 rounded-[1.9rem] flex flex-col items-center justify-center group/complete hover:bg-transparent transition-all overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-accent-green/5 opacity-0 group-hover/complete:opacity-100 transition-opacity"></div>
                                        <span className="text-3xl mb-3 transform group-hover/complete:scale-125 transition-transform duration-500">⚡</span>
                                        <span className="text-xl font-black text-white uppercase tracking-[0.3em]">Finalize Documentation & Synchronize</span>
                                        <span className="text-[10px] font-black text-accent-green uppercase tracking-widest mt-2 opacity-60">+ FULL XP PAYLOAD ACTIVATED</span>
                                    </button>
                                </motion.div>
                            )}

                            {day.status === 'upcoming' && !isToday && (
                                <section className="card p-8 bg-accent-orange/[0.02] border-accent-orange/10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-2xl">⏳</div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight">Temporal Anomaly detected</h4>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Starting this cycle prior to schedule is authorized.</p>
                                        </div>
                                    </div>
                                    <button onClick={() => flexComplete('pre')} className="bg-accent-orange/10 text-accent-orange hover:bg-accent-orange border border-accent-orange/20 hover:text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap">Override Schedule</button>
                                </section>
                            )}
                        </div>

                        {/* Right Column: Journal & Knowledge (Lg: 4) */}
                        <div className="lg:col-span-12 xl:col-span-4 space-y-10">
                            {/* Journal Card */}
                            <section className="card p-10 text-center relative overflow-hidden group border-white/5 h-fit">
                                <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        ✍️
                                    </div>
                                    <h2 className="text-2xl font-black text-white tracking-tight mb-4">Chronicle Entry</h2>
                                    <p className="text-[11px] text-text-muted font-bold leading-relaxed mb-10 uppercase tracking-widest px-4 opacity-60">
                                        Deep architectural reflection is required for data persistence.
                                    </p>
                                    <button
                                        onClick={() => day.blog_slug
                                            ? navigate(`/blog/${day.blog_slug}/edit`)
                                            : navigate(`/blog/new/edit?day=${dayId}`)}
                                        className="w-full bg-accent-blue text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-premium hover:shadow-glow-blue/40 transition-all border border-white/10"
                                    >
                                        {day.blog_slug ? 'Update Matrix Log' : 'Initialize New Log'}
                                    </button>
                                </div>
                            </section>

                            {/* Knowledge Check */}
                            <section className="card p-10 border-white/5 relative h-fit">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-lg">💡</div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Logic Validation</h2>
                                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">Knowledge Integrity Test</p>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {day.knowledge_checks.map((kc: any) => (
                                        <div key={kc.id} className="space-y-5 group/kc">
                                            <div className="flex justify-between items-center px-1">
                                                <label className="text-xs font-black text-white flex gap-4 leading-normal uppercase tracking-wider">
                                                    <span className="text-accent-purple opacity-40 shrink-0">0{kc.order}_</span>
                                                    {kc.question}
                                                </label>
                                                {!isFinalized && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm("Discard this validation node?")) {
                                                                api.delete(`/journey/knowledge-checks/${kc.id}/`).then(fetchDay);
                                                            }
                                                        }}
                                                        className="opacity-0 group-hover/kc:opacity-100 text-[10px] text-accent-red font-black uppercase tracking-widest transition-opacity"
                                                    >
                                                        Discard
                                                    </button>
                                                )}
                                            </div>
                                            <div className="relative">
                                                <textarea
                                                    className="w-full bg-white/[0.02] border border-white/5 focus:border-accent-purple/40 rounded-2xl p-6 text-xs text-white outline-none min-h-[140px] resize-none transition-all placeholder:text-text-muted/10 font-medium leading-relaxed group-hover/kc:bg-white/[0.03]"
                                                    placeholder="Synthesize your response protocol..."
                                                    value={kcAnswers[kc.id] || ''}
                                                    onChange={(e) => setKcAnswers({ ...kcAnswers, [kc.id]: e.target.value })}
                                                    onBlur={() => saveKC(kc.id)}
                                                />
                                                <AnimatePresence>
                                                    {isSaving === kc.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                                            className="absolute bottom-6 right-6 text-[9px] font-black text-accent-green uppercase tracking-[0.2em] flex items-center gap-2 px-3 py-1.5 bg-accent-green/10 rounded-lg"
                                                        >
                                                            <span className="w-1 h-1 bg-accent-green rounded-full animate-ping"></span>
                                                            Buffer Syncing...
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}

                                    {!isFinalized && (
                                        <div className="pt-6 border-t border-white/5">
                                            <input
                                                type="text"
                                                placeholder="NEW_LOGIC_PROMPT..."
                                                className="w-full bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] text-accent-purple placeholder:text-accent-purple/20"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const q = (e.target as HTMLInputElement).value;
                                                        if (q.trim()) {
                                                            api.post('/journey/knowledge-checks/', {
                                                                day: day.id,
                                                                question: q.trim(),
                                                                order: day.knowledge_checks.length + 1
                                                            }).then(() => {
                                                                (e.target as HTMLInputElement).value = '';
                                                                fetchDay();
                                                            });
                                                        }
                                                    }
                                                }}
                                            />
                                            <p className="text-[8px] text-text-muted opacity-40 uppercase font-bold tracking-widest mt-2 px-1">Press Enter to Inject Validation Node</p>
                                        </div>
                                    )}

                                    {day.knowledge_checks.length === 0 && (
                                        <div className="text-center py-10 flex flex-col items-center gap-6 opacity-20 group">
                                            <div className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-110">📡</div>
                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">No Knowledge Checks Encountered</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Strategic Notes */}
                            <section className="card p-10 border-white/5 relative h-fit group/notes">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-lg">📓</div>
                                    <h2 className="text-xl font-black text-white tracking-tight">Strategic Notes</h2>
                                </div>
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-xs text-text-muted leading-relaxed min-h-[120px] resize-none font-medium placeholder:text-text-muted/10"
                                    placeholder="PERSIST_CORE_OBSERVATIONS_HERE..."
                                    defaultValue={day.notes || ''}
                                    readOnly={isFinalized}
                                    onBlur={(e) => {
                                        if (!isFinalized) {
                                            api.patch(`/journey/days/${dayId}/`, { notes: e.target.value }).then(fetchDay);
                                        }
                                    }}
                                />
                            </section>

                            {/* Add Task Quick Inject */}
                            {!isFinalized && (
                                <section className="card p-8 border-dashed border-white/10 relative h-fit bg-accent-blue/[0.01] hover:bg-accent-blue/[0.02] transition-colors group/add">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center text-accent-blue text-sm">+</div>
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Inject Task Node</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="TASK_TITLE_IDENTIFIER"
                                                id="new-task-title"
                                                className="bg-transparent border-b border-white/10 w-full py-2 text-sm font-bold outline-none focus:border-accent-blue/40 transition-colors placeholder:text-text-muted/20 uppercase"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const title = (e.target as HTMLInputElement).value;
                                                        if (title.trim()) {
                                                            api.post('/journey/tasks/', {
                                                                day: day.id,
                                                                title: title.trim(),
                                                                difficulty: 'medium',
                                                                xp_value: 25
                                                            }).then(() => {
                                                                (e.target as HTMLInputElement).value = '';
                                                                fetchDay();
                                                            });
                                                        }
                                                    }
                                                }}
                                            />
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] opacity-40 px-1">Press Enter to Commit to Registry</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DayDetailPage;
