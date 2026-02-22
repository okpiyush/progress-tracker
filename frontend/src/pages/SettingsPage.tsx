import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_OPTIONS = ['👨‍💻', '🧑‍💻', '👩‍💻', '🦾', '🚀', '⚡', '🐉', '🦁', '🔥', '🎯', '💎', '🏆'];

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuthStore();
    const [formData, setFormData] = useState({
        display_name: user?.profile?.display_name || '',
        bio: user?.profile?.bio || '',
        github_url: user?.profile?.github_url || '',
        linkedin_url: user?.profile?.linkedin_url || '',
        resume_url: user?.profile?.resume_url || '',
        leetcode_url: user?.profile?.leetcode_url || '',
        avatar_emoji: user?.profile?.avatar_emoji || '👨‍💻',
    });
    const [stats, setStats] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        api.get('/journey/stats/').then(res => setStats(res.data)).catch(console.error);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setStatus('idle');
        try {
            await api.patch('/auth/me/', { profile: formData });
            await fetchUser();
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch {
            setStatus('error');
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <div className="flex bg-surface-primary text-text-primary h-screen font-sans overflow-hidden">
            {/* Sidebar */}
            <Sidebar user={user} stats={stats} logout={useAuthStore.getState().logout} />

            {/* Main */}
            <main className="flex-1 overflow-y-auto relative bg-surface-primary/50">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48"></div>

                {/* Header */}
                <header className="sticky top-0 z-10 bg-surface-primary/80 backdrop-blur-xl border-b border-white/5 px-8 md:px-12 py-8">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 bg-accent-blue/10 text-accent-blue rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent-blue/20">System</span>
                                <span className="px-2.5 py-1 bg-white/5 text-text-muted rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">Configuration</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Account <span className="text-gradient-blue">Settings</span></h1>
                            <p className="text-sm text-text-secondary font-medium">Customize your digital identity and operational parameters.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/u/${user?.username}`)}
                                className="btn btn-secondary px-6 font-black uppercase text-[10px] tracking-widest shadow-premium"
                            >
                                View Live Profile ↗
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Form area */}
                        <div className="lg:col-span-8 space-y-10 animate-fade-in">
                            <form onSubmit={handleSave} className="space-y-10">
                                {/* Profile section */}
                                <div className="card p-8 md:p-10 space-y-10 group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-3xl -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white tracking-tight leading-none">Public Identity</h3>
                                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Core Profile Information</p>
                                    </div>

                                    {/* Avatar picker */}
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">System Avatar</label>
                                        <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
                                            {EMOJI_OPTIONS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => setFormData(f => ({ ...f, avatar_emoji: emoji }))}
                                                    className={`aspect-square text-2xl flex items-center justify-center rounded-2xl border transition-all duration-300 ${formData.avatar_emoji === emoji
                                                        ? 'border-accent-blue bg-accent-blue/10 scale-110 shadow-glow-blue/20 ring-1 ring-accent-blue/40'
                                                        : 'border-white/5 hover:border-white/20 bg-white/[0.02]'}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">Display Name</label>
                                            <input
                                                type="text"
                                                className="input block w-full bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] transition-all"
                                                value={formData.display_name}
                                                onChange={e => setFormData(f => ({ ...f, display_name: e.target.value }))}
                                                placeholder="Enter your public name"
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">System UUID</label>
                                            <input
                                                type="text"
                                                className="input block w-full bg-white/[0.01] border-white/5 text-text-muted opacity-50 cursor-not-allowed italic"
                                                value={`@${user?.username || 'unknown'}`}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">Personal Brief / Bio</label>
                                        <textarea
                                            className="input block w-full bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] min-h-[140px] resize-none leading-relaxed transition-all"
                                            value={formData.bio}
                                            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                                            placeholder="Architect your journey summary..."
                                        />
                                    </div>
                                </div>

                                {/* Links section */}
                                <div className="card p-8 md:p-10 space-y-8 group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white tracking-tight leading-none">Network Integration</h3>
                                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Connect your external nodes</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">GitHub Protocol</label>
                                            <div className="relative group/field">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted font-black text-[9px] uppercase tracking-widest border-r border-white/10 pr-3 mr-3 h-2/3 my-auto">GH /</div>
                                                <input
                                                    type="text"
                                                    className="input block w-full pl-[52px] bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] transition-all"
                                                    value={formData.github_url}
                                                    onChange={e => setFormData(f => ({ ...f, github_url: e.target.value }))}
                                                    placeholder="username"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">LinkedIn Protocol</label>
                                            <div className="relative group/field">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted font-black text-[9px] uppercase tracking-widest border-r border-white/10 pr-3 mr-3 h-2/3 my-auto">LI /</div>
                                                <input
                                                    type="text"
                                                    className="input block w-full pl-[52px] bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] transition-all"
                                                    value={formData.linkedin_url}
                                                    onChange={e => setFormData(f => ({ ...f, linkedin_url: e.target.value }))}
                                                    placeholder="username"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">Professional Resume</label>
                                            <div className="relative group/field">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted font-black text-[9px] uppercase tracking-widest border-r border-white/10 pr-3 mr-3 h-2/3 my-auto">CV /</div>
                                                <input
                                                    type="text"
                                                    className="input block w-full pl-[52px] bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] transition-all"
                                                    value={formData.resume_url}
                                                    onChange={e => setFormData(f => ({ ...f, resume_url: e.target.value }))}
                                                    placeholder="https://link-to-resume"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">LeetCode Profile</label>
                                            <div className="relative group/field">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted font-black text-[9px] uppercase tracking-widest border-r border-white/10 pr-3 mr-3 h-2/3 my-auto">LC /</div>
                                                <input
                                                    type="text"
                                                    className="input block w-full pl-[52px] bg-white/[0.02] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.04] transition-all"
                                                    value={formData.leetcode_url}
                                                    onChange={e => setFormData(f => ({ ...f, leetcode_url: e.target.value }))}
                                                    placeholder="username"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Save action */}
                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="btn btn-primary px-12 py-4 rounded-xl shadow-glow-blue w-full sm:w-auto font-black uppercase text-xs tracking-[0.2em]"
                                    >
                                        {isSaving ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Synchronizing...
                                            </div>
                                        ) : 'Update Architecture'}
                                    </button>

                                    <AnimatePresence>
                                        {status === 'success' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="text-accent-green font-black text-[10px] uppercase tracking-widest flex items-center gap-3 bg-accent-green/10 px-4 py-2 rounded-lg border border-accent-green/20"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                                                Sync Successful
                                            </motion.div>
                                        )}
                                        {status === 'error' && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="text-accent-red font-black text-[10px] uppercase tracking-widest flex items-center gap-3 bg-accent-red/10 px-4 py-2 rounded-lg border border-accent-red/20"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-red"></span>
                                                Write Conflict Detected
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar area */}
                        <div className="lg:col-span-4 space-y-8 animate-fade-in-up">
                            {/* Preview */}
                            <div className="card p-8 md:p-10 text-center group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-[length:200%_auto] animate-gradient-shift"></div>

                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-10 opacity-70">Visual Output</p>

                                <div className="relative mb-8 inline-block">
                                    <div className="absolute inset-0 bg-accent-blue/20 blur-3xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-700"></div>
                                    <div className="relative text-8xl mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500 cursor-default select-none transition-filter group-hover:brightness-125">
                                        {formData.avatar_emoji}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white tracking-tight line-clamp-1">{formData.display_name || 'Anonymous User'}</h3>
                                <p className="text-sm font-black text-accent-blue mb-6 tracking-wide opacity-80">@{user?.username}</p>

                                {formData.bio ? (
                                    <p className="text-sm text-text-secondary mt-6 italic leading-relaxed text-center px-2 line-clamp-4 font-medium">
                                        "{formData.bio}"
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-6 opacity-40">No bio defined</p>
                                )}

                                <div className="mt-10 pt-8 border-t border-white/5 space-y-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/u/${user?.username}`)}
                                        className="btn bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 w-full py-4 font-black uppercase text-[10px] tracking-widest transition-all"
                                    >
                                        Launch Terminal ↗
                                    </button>
                                </div>
                            </div>

                            {/* Status info */}
                            <div className="card p-8 space-y-8 relative overflow-hidden group">
                                <div className="absolute bottom-0 right-0 w-24 h-24 bg-accent-green/5 blur-3xl -mb-12 -mr-12 rounded-full"></div>

                                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-70">Operational Data</h4>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Sync Engine', value: 'Optimized', color: 'text-accent-green' },
                                        { label: 'Access Level', value: `LVL ${user?.profile?.current_level || 1}`, color: 'text-white' },
                                        { label: 'Total XP', value: user?.profile?.total_xp?.toLocaleString() || 0, color: 'text-accent-blue' },
                                        { label: 'Infrastructure', value: 'Edge', color: 'text-accent-green' },
                                    ].map(item => (
                                        <div key={item.label} className="flex justify-between items-center group/row">
                                            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-tight group-hover/row:text-white transition-colors">{item.label}</span>
                                            <span className={`text-xs font-black ${item.color} tracking-wide`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
