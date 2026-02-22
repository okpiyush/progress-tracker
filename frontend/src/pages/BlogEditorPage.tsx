import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import api from '../api/axios';
import type { BlogEntry } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const BlogEditorPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const dayId = searchParams.get('day');

    const [entry, setEntry] = useState<Partial<BlogEntry>>({
        title: '',
        content: '',
        mood: 'focused',
        tags: [],
        github_url: '',
        external_links: [],
        day: dayId ? parseInt(dayId) : null
    });

    const [tagInput, setTagInput] = useState('');
    const [linkTitleInput, setLinkTitleInput] = useState('');
    const [linkUrlInput, setLinkUrlInput] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const debounceTimer = useRef<number | null>(null);

    const moods = [
        { id: 'focused', label: 'focused', icon: '🎯' },
        { id: 'grinding', label: 'grinding', icon: '💪' },
        { id: 'breakthrough', label: 'breakthrough!', icon: '🚀' },
        { id: 'tough', label: 'tough day', icon: '😤' },
        { id: 'relaxed', label: 'relaxed', icon: '🍵' }
    ];

    const fetchEntry = useCallback(async () => {
        if (slug && slug !== 'new') {
            try {
                const res = await api.get(`/blog/entries/${slug}/`);
                setEntry(res.data);
                setLastSaved(new Date());
            } catch (e) {
                console.error(e);
            }
        } else if (slug === 'new' && dayId) {
            try {
                const res = await api.get(`/journey/days/${dayId}/`);
                const dayData = res.data;
                const completedTasks = dayData.tasks.filter((t: any) => t.is_completed);
                let contentInit = `## Mission Log: Day ${dayData.day_number}\n\n### Objective\n${dayData.title}\n\n### Architected Topics & Modules\n`;
                if (completedTasks.length > 0) {
                    completedTasks.forEach((t: any) => {
                        contentInit += `- **${t.title}**: [Add insights here]\n`;
                    });
                    contentInit += `- [Document your process here]\n`;
                }

                contentInit += `\n### Logic Validations\n`;
                const answeredKCs = dayData.knowledge_checks.filter((kc: any) => kc.is_answered);
                if (answeredKCs.length > 0) {
                    answeredKCs.forEach((kc: any) => {
                        contentInit += `#### ${kc.question}\n${kc.answer_notes || '_No insights provided._'}\n\n`;
                    });
                } else {
                    contentInit += `*No architectural validations recorded for this cycle.*\n`;
                }

                contentInit += `\n### Algorithmic Execution (LeetCode)\n- **Problem:** [Insert Problem Name]\n- **Approach:** O(N) Time, O(1) Space.\n\n### Key Takeaways\n\n> "Leave it better than you found it."\n`;

                setEntry({
                    title: `Day ${dayData.day_number} // ${dayData.title}`,
                    content: contentInit,
                    mood: 'focused',
                    tags: ['engineering', `day${dayData.day_number}`],
                    github_url: '',
                    external_links: [],
                    day: parseInt(dayId),
                    slug: dayData.blog_slug || null
                });
            } catch (e) {
                console.error("Failed to load day data", e);
            }
        } else {
            setEntry({
                title: `LOG_ENTRY_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}`,
                content: '## Mission Log\n\n- What did I build today?\n- What bugs did I squash?\n- What did I learn?\n\n### Algorithmic Execution\n- LeetCode: [Problem name / link]\n\n### Key Takeaways\n> "Leave it better than you found it."\n\n```js\n// snippet goes here\n```',
                mood: 'focused',
                tags: [],
                github_url: '',
                external_links: [],
                day: null
            });
        }
    }, [slug, dayId]);

    useEffect(() => {
        fetchEntry();
    }, [fetchEntry]);

    const saveDraft = useCallback(async (currentEntry: Partial<BlogEntry>) => {
        setIsSaving(true);
        try {
            const data = {
                title: currentEntry.title,
                content: currentEntry.content,
                mood: currentEntry.mood,
                tags: currentEntry.tags,
                github_url: currentEntry.github_url,
                external_links: currentEntry.external_links,
                day: currentEntry.day
            };

            if (currentEntry.slug || (slug !== 'new' && slug)) {
                const currentSlug = currentEntry.slug || slug;
                await api.patch(`/blog/entries/${currentSlug}/`, data);
            } else {
                const res = await api.post('/blog/entries/', data);
                navigate(`/blog/${res.data.slug}/edit`, { replace: true });
                setEntry(res.data);
            }
            setLastSaved(new Date());
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    }, [slug, navigate]);

    useEffect(() => {
        if (!entry.title) return;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = window.setTimeout(() => {
            saveDraft(entry);
        }, 3000);
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [entry.content, entry.title, entry.mood, entry.tags, entry.github_url, entry.external_links, saveDraft]);

    const publishEntry = async () => {
        setIsSaving(true);
        try {
            const data = {
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags,
                github_url: entry.github_url,
                external_links: entry.external_links,
                day: entry.day
            };

            let publishSlug = entry.slug || (slug !== 'new' ? slug : null);
            if (!publishSlug) {
                // Check if we have a draft already for this day to avoid duplicate POST
                const existingLogs = await api.get('/blog/entries/');
                const logs = Array.isArray(existingLogs.data) ? existingLogs.data : (existingLogs.data.results || []);
                const matchingLog = logs.find((l: any) => l.day === entry.day);

                if (matchingLog) {
                    publishSlug = matchingLog.slug;
                    await api.patch(`/blog/entries/${publishSlug}/`, data);
                } else {
                    const res = await api.post('/blog/entries/', data);
                    publishSlug = res.data.slug;
                    setEntry(res.data);
                }
            } else {
                await api.patch(`/blog/entries/${publishSlug}/`, data);
            }

            await api.post(`/blog/entries/${publishSlug}/publish/`);
            alert('+50 XP! Blog Published Successfully! ⚡');
            navigate('/blog');
        } catch (e) {
            console.error('Failed to publish', e);
            alert('Failed to publish entry.');
        } finally {
            setIsSaving(false);
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const currentTags = entry.tags || [];
            if (!currentTags.includes(tagInput.trim())) {
                setEntry({ ...entry, tags: [...currentTags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        const currentTags = entry.tags || [];
        setEntry({ ...entry, tags: currentTags.filter((t: string) => t !== tagToRemove) });
    };

    const addLink = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (linkTitleInput.trim() && linkUrlInput.trim()) {
            const newLinks = [...(entry.external_links || []), { title: linkTitleInput.trim(), url: linkUrlInput.trim() }];
            setEntry({ ...entry, external_links: newLinks });
            setLinkTitleInput('');
            setLinkUrlInput('');
        }
    };

    const removeLink = (index: number) => {
        const currentLinks = entry.external_links || [];
        setEntry({ ...entry, external_links: currentLinks.filter((_, i) => i !== index) });
    };

    return (
        <div className="bg-surface-primary min-h-screen text-text-primary p-6 md:p-8 font-sans w-full mx-auto flex flex-col h-screen overflow-hidden" data-color-mode="dark">
            {/* Ambient Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-purple/5 blur-[100px] rounded-full pointer-events-none -ml-24 -mb-24"></div>

            <div className="max-w-[1800px] mx-auto w-full flex flex-col h-full relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 py-6 px-10 card relative overflow-hidden group border-white/5 shrink-0">
                    <div className="flex gap-10 items-center flex-1 w-full">
                        <button
                            onClick={() => navigate('/blog')}
                            className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0 group/back"
                        >
                            <span className="group-hover/back:-translate-x-1 transition-transform">←</span>
                        </button>
                        <div className="flex-1 space-y-1">
                            <input
                                className="bg-transparent border-none outline-none text-3xl font-black text-white w-full focus:ring-0 placeholder:text-text-muted/20 tracking-tightest leading-tight"
                                value={entry.title}
                                onChange={e => setEntry({ ...entry, title: e.target.value })}
                                placeholder="ENTRY_TITLE_IDENTIFIER"
                            />
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-accent-blue/10 text-accent-blue rounded text-[9px] font-black uppercase tracking-widest border border-accent-blue/20">Operational Log</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">
                                    {isSaving ? (
                                        <span className="text-accent-orange animate-pulse">Synchronizing Data...</span>
                                    ) : lastSaved ? (
                                        `Integrated at ${lastSaved.toLocaleTimeString()}`
                                    ) : 'Local Buffer Only'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 mt-6 md:mt-0">
                        <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>
                        <button
                            onClick={publishEntry}
                            className="bg-accent-blue text-white px-10 py-3.5 font-black text-[10px] rounded-2xl shadow-premium hover:shadow-glow-blue/40 transition-all flex items-center gap-3 uppercase tracking-[0.25em] border border-white/10"
                        >
                            <span className="text-sm">⚡</span> Commit to Public
                        </button>
                    </div>
                </header>

                <div className="flex gap-8 flex-1 min-h-0 pb-6 overflow-hidden">
                    {/* Sidebar area (Tools on LEFT) */}
                    <div className="w-[420px] space-y-6 overflow-y-auto pr-4 shrink-0 hide-scrollbar flex flex-col pb-10">
                        {/* Entry Mood */}
                        <div className="card p-8 space-y-6 border-white/5 bg-white/[0.01]">
                            <h3 className="text-[10px] font-black text-accent-blue uppercase tracking-[0.3em]">Emotional Index</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {moods.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setEntry({ ...entry, mood: mood.id })}
                                        className={`px-4 py-3 text-[9px] font-black rounded-xl border transition-all uppercase tracking-widest flex items-center gap-3 ${entry.mood === mood.id
                                            ? 'bg-accent-blue text-white border-accent-blue shadow-glow-blue/20'
                                            : 'bg-white/[0.02] border-white/5 text-text-muted hover:border-white/20'
                                            }`}
                                    >
                                        <span className="text-sm">{mood.icon}</span>
                                        {mood.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="card p-8 space-y-8 border-white/5 bg-white/[0.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black text-accent-green uppercase tracking-[0.3em]">Resource Integration</h3>
                                <span className="text-[8px] font-bold text-text-muted/40 uppercase tracking-widest">v4.0.1</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">Source Repository</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <span className="text-accent-green opacity-40">🔗</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={entry.github_url || ''}
                                            onChange={e => setEntry({ ...entry, github_url: e.target.value })}
                                            className="input block w-full pl-12 pr-4 py-4 bg-white/[0.03] border-white/5 focus:border-accent-green/30 rounded-2xl text-[11px] font-medium transition-all group-hover:bg-white/[0.05]"
                                            placeholder="https://github.com/identity/repo"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-60">External References</label>

                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {(entry.external_links || []).map((link, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group/item"
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <div className="font-black text-white text-[10px] truncate uppercase tracking-tighter">{link.title}</div>
                                                        <div className="text-[9px] text-text-muted truncate mt-1 opacity-60">{link.url}</div>
                                                    </div>
                                                    <button onClick={() => removeLink(idx)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-accent-red/5 text-accent-red opacity-0 group-hover/item:opacity-100 hover:bg-accent-red hover:text-white transition-all text-[10px]">✕</button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl space-y-4">
                                        <input
                                            type="text"
                                            value={linkTitleInput}
                                            onChange={e => setLinkTitleInput(e.target.value)}
                                            className="bg-transparent border-b border-white/5 w-full py-2 text-[10px] font-bold outline-none focus:border-accent-green/40 transition-colors placeholder:text-text-muted/20 uppercase tracking-widest"
                                            placeholder="REF_TITLE"
                                        />
                                        <input
                                            type="text"
                                            value={linkUrlInput}
                                            onChange={e => setLinkUrlInput(e.target.value)}
                                            className="bg-transparent border-b border-white/5 w-full py-2 text-[10px] font-bold outline-none focus:border-accent-green/40 transition-colors placeholder:text-text-muted/20 uppercase tracking-widest"
                                            placeholder="REF_URL"
                                        />
                                        <button onClick={addLink} className="w-full bg-accent-green/5 text-accent-green hover:bg-accent-green/10 border border-accent-green/20 font-black py-3 rounded-xl text-[9px] uppercase tracking-[0.2em] transition-all">
                                            + Inject Resource
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="card p-8 space-y-6 border-white/5 bg-white/[0.01]">
                            <h3 className="text-[10px] font-black text-accent-purple uppercase tracking-[0.3em] px-1">Tag Indexing</h3>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="text-accent-purple opacity-40">#</span>
                                </div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={addTag}
                                    className="input block w-full pl-10 pr-4 py-4 bg-white/[0.03] border-white/5 focus:border-accent-purple/30 rounded-2xl text-[11px] font-medium transition-all group-hover:bg-white/[0.05]"
                                    placeholder="APPEND_TAG..."
                                />
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {(entry.tags || []).map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="bg-white/[0.03] px-3.5 py-2 rounded-xl text-[9px] font-black text-text-muted border border-white/5 flex items-center gap-3 group/tag hover:border-accent-purple/40 hover:text-white transition-all uppercase tracking-tighter"
                                    >
                                        #{tag}
                                        <button
                                            onClick={() => removeTag(tag)}
                                            className="text-white/20 hover:text-accent-red font-bold"
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                                {(entry.tags || []).length === 0 && (
                                    <div className="text-[10px] text-text-muted italic opacity-20 px-1 py-2 font-medium">INDEX_EMPTY</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Editor area (Expansion area on RIGHT) */}
                    <div className="flex-1 flex flex-col overflow-hidden card relative no-padding border-white/5 shadow-2xl" data-color-mode="dark">
                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none"></div>
                        <MDEditor
                            value={entry.content || ''}
                            onChange={(val) => setEntry({ ...entry, content: val || '' })}
                            height="100%"
                            className="h-full border-none shadow-none bg-transparent relative z-10"
                            previewOptions={{
                                rehypePlugins: [[rehypeSanitize]],
                            }}
                            style={{ backgroundColor: 'transparent' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogEditorPage;
