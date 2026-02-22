import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import api from '../api/axios';
import type { BlogEntry } from '../types';

interface ExtendedBlogEntry extends BlogEntry {
    user: {
        username: string;
    };
}

import { motion } from 'framer-motion';

const PublicBlogPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [entry, setEntry] = useState<ExtendedBlogEntry | null>(null);

    useEffect(() => {
        api.get(`/blog/entries/${slug}/`).then(res => {
            setEntry(res.data);
        }).catch(console.error);
    }, [slug]);

    if (!entry) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-surface-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-24 -mt-24"></div>
            <div className="w-12 h-12 border-2 border-accent-blue border-t-transparent rounded-2xl animate-spin mb-6 shadow-glow-blue/20"></div>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Retrieving Chronicle</p>
        </div>
    );

    return (
        <div className="bg-surface-primary min-h-screen text-text-primary px-6 py-12 md:py-24 font-sans relative overflow-x-hidden" data-color-mode="dark">
            {/* Ambient Background Decor */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent-blue/5 blur-[150px] rounded-full pointer-events-none -mr-64 -mt-64 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none -ml-48 -mb-48 opacity-30"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back to timeline */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-16"
                >
                    <button
                        onClick={() => window.history.back()}
                        className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 group/back"
                    >
                        <span className="group-hover/back:-translate-x-1 transition-transform">←</span>
                    </button>
                </motion.div>

                <article className="space-y-16">
                    <header className="space-y-10 animate-fade-in">
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-accent-blue/20">
                                Operational Log // Day {entry.day}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/10 shrink-0"></div>
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-60">
                                {entry.published_at ? new Date(entry.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Local Draft Mode'}
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-white leading-[1.1]">
                            {entry.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-12 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-white/10 flex items-center justify-center text-white font-black text-lg shadow-premium">
                                    {entry.user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1 opacity-50">Authorized Personnel</p>
                                    <p className="text-xs font-black text-white uppercase tracking-tighter">{entry.user?.username || 'SYSTEM_CORE'}</p>
                                </div>
                            </div>
                            <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>
                            <div>
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1 opacity-50">Condition Index</p>
                                <p className="text-xs font-black text-white uppercase tracking-tighter">{entry.mood || 'STABLE'}</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>
                            <div>
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1 opacity-50">Data Accesses</p>
                                <p className="text-xs font-black text-white tracking-tighter">{(entry.views || 0) + 1} Pulses</p>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="prose prose-invert prose-xl max-w-none md-reader relative"
                        data-color-mode="dark"
                    >
                        <div className="absolute -left-10 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent-blue/20 via-white/5 to-transparent hidden xl:block"></div>
                        <MDEditor.Markdown
                            source={entry.content}
                            className="bg-transparent text-white/90 font-sans leading-relaxed tracking-tight"
                            style={{ backgroundColor: 'transparent', color: 'inherit' }}
                        />
                    </motion.div>

                    {/* Assets */}
                    {(entry.github_url || (entry.external_links && entry.external_links.length > 0)) && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8 pt-16"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-blue px-1">Resource Integration Registry</h3>
                            <div className="grid gap-4">
                                {entry.github_url && (
                                    <a href={entry.github_url} target="_blank" rel="noopener noreferrer" className="card group/asset p-6 border-white/5 hover:border-accent-green/40 hover:bg-white/[0.02] transition-all flex items-center gap-6 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-accent-green/5 opacity-0 group-hover/asset:opacity-100 transition-opacity"></div>
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shadow-premium relative z-10">📦</div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">Source Repository</p>
                                            <p className="text-sm font-black text-accent-green truncate tracking-tighter">{entry.github_url}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted group-hover/asset:bg-accent-green group-hover/asset:text-black transition-all transform group-hover/asset:translate-x-1 shrink-0">↗</div>
                                    </a>
                                )}
                                {entry.external_links?.map((link, idx) => (
                                    <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="card group/asset p-6 border-white/5 hover:border-accent-blue/40 hover:bg-white/[0.02] transition-all flex items-center gap-6 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover/asset:opacity-100 transition-opacity"></div>
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-2xl shadow-premium relative z-10">🔗</div>
                                        <div className="flex-1 min-w-0 relative z-10">
                                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">External Documentation</p>
                                            <p className="text-sm font-black text-accent-blue truncate tracking-tighter">{link.title}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted group-hover/asset:bg-accent-blue group-hover/asset:text-black transition-all transform group-hover/asset:translate-x-1 shrink-0">↗</div>
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Tags */}
                    <div className="pt-12 border-t border-white/5 flex flex-wrap gap-3">
                        {entry.tags?.map((tag: string) => (
                            <span key={tag} className="text-[9px] font-black text-text-muted bg-white/[0.03] px-4 py-2 rounded-xl border border-white/5 hover:border-white/20 hover:text-white transition-all uppercase tracking-tighter">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </article>

                <footer className="mt-32 pt-16 border-t border-white/5 text-center">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.5em] opacity-20">LiveJourney Protocol Hub // 2026</p>
                </footer>
            </div>
        </div>
    );
};
export default PublicBlogPage;
