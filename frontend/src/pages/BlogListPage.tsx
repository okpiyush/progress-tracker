import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const MOOD_EMOJI: Record<string, string> = {
    great: '🔥', good: '✅', okay: '😐', tough: '😤', bad: '💀',
};

const BlogListPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [entries, setEntries] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/blog/entries/?page_size=100').then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setEntries(data);
        }).catch(console.error).finally(() => setLoading(false));
        api.get('/journey/stats/').then(res => setStats(res.data)).catch(console.error);
    }, []);

    const drafts = entries.filter(e => e.status === 'draft');
    const published = entries.filter(e => e.status === 'published');
    const visible = filter === 'all' ? entries : filter === 'draft' ? drafts : published;

    return (
        <div className="flex bg-surface-primary text-text-primary h-screen font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} stats={stats} logout={useAuthStore.getState().logout} />

            {/* Main */}
            <main className="flex-1 overflow-y-auto bg-surface-primary/50 relative flex flex-col">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48"></div>

                {/* Header */}
                <header className="sticky top-0 z-10 bg-surface-primary/80 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 py-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-accent-purple/10 text-accent-purple rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-purple/20">Archive</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse"></span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Personal <span className="text-gradient-purple">Journal</span></h1>
                        <p className="text-sm text-text-secondary font-medium">Documenting the evolution of your mindset and discipline.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Filter tabs */}
                        <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 shadow-inner">
                            {(['all', 'draft', 'published'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-5 py-2 text-[10px] font-black rounded-xl uppercase tracking-[0.2em] transition-all duration-300 ${filter === f ? 'bg-accent-blue text-white shadow-glow-blue/20' : 'text-text-muted hover:text-white'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/blog/new/edit')}
                            className="btn btn-primary px-8 py-3.5 rounded-xl shadow-premium text-[10px] font-black uppercase tracking-[0.2em] w-full sm:w-auto"
                        >
                            + New Log Entry
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 relative z-10">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-32 space-y-4"
                            >
                                <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-text-muted font-black uppercase tracking-widest text-xs">Querying Archives...</p>
                            </motion.div>
                        ) : visible.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-32 text-center max-w-xl mx-auto"
                            >
                                <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-5xl mb-10 shadow-inner group">
                                    <span className="group-hover:rotate-12 transition-transform duration-500">✍️</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">The archives are empty.</h3>
                                <p className="text-text-secondary font-medium mb-10 leading-relaxed">Your journey awaits its documentation. Establishing a consistent log is vital for long-term growth analysis.</p>
                                <button onClick={() => navigate('/blog/new/edit')} className="btn btn-secondary px-10 py-4 shadow-premium font-black uppercase tracking-widest text-[10px]">
                                    Initialize First Entry
                                </button>
                            </motion.div>
                        ) : (
                            <div className="max-w-5xl mx-auto space-y-6">
                                {visible.map((entry, i) => (
                                    <motion.div
                                        key={entry.slug}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => entry.status === 'published'
                                            ? navigate(`/u/${user?.username}/${entry.slug}`)
                                            : navigate(`/blog/${entry.slug}/edit`)}
                                        className="group card p-8 cursor-pointer hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-accent-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex-1 min-w-0 space-y-5">
                                            <div className="flex flex-wrap items-center gap-4">
                                                {entry.day_number && (
                                                    <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">
                                                        Day {entry.day_number}
                                                    </span>
                                                )}
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${entry.status === 'published' ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'}`}>
                                                    {entry.status}
                                                </span>
                                                {entry.mood && (
                                                    <span className="text-[10px] text-text-muted font-black uppercase tracking-widest flex items-center gap-2 pr-2 border-r border-white/5">
                                                        <span className="text-base">{MOOD_EMOJI[entry.mood] || '😐'}</span>
                                                        {entry.mood}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
                                                    {entry.published_at
                                                        ? new Date(entry.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : `Modified ${new Date(entry.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-black text-white group-hover:text-accent-blue transition-colors tracking-tight line-clamp-2">
                                                {entry.title || 'Untitled Operation Log'}
                                            </h3>

                                            {entry.tags?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {entry.tags.map((tag: string) => (
                                                        <span key={tag} className="text-[9px] font-black text-text-muted bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5 uppercase tracking-tighter group-hover:border-white/10 transition-colors">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-6 shrink-0 pt-6 md:pt-0 border-t md:border-t-0 border-white/5">
                                            {entry.status === 'published' && (
                                                <div className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-3 px-4 py-2 bg-white/[0.02] rounded-full border border-white/5 group-hover:border-white/10 transition-colors">
                                                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full shadow-glow-green/40"></span>
                                                    {entry.views || 0} READS
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                {entry.day && (
                                                    <button
                                                        onClick={e => { e.stopPropagation(); navigate(`/journey/day/${entry.day}`); }}
                                                        className="btn btn-secondary px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all border-white/5 hover:border-accent-purple/30"
                                                    >
                                                        Protocol
                                                    </button>
                                                )}
                                                <button
                                                    onClick={e => { e.stopPropagation(); navigate(`/blog/${entry.slug}/edit`); }}
                                                    className="btn btn-secondary px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all border-white/5 hover:border-accent-blue/30"
                                                >
                                                    Edit Log
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default BlogListPage;
