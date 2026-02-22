import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
    user: any;
    stats?: any;
    logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, stats, logout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Add default stats payload if none provided
    const displayStats = stats || {
        level: user?.profile?.current_level || 1,
        xp_in_current: user?.profile?.total_xp || 0,
        xp_needed: 1000,
        streak: user?.profile?.current_streak || 0
    };

    const xpPercent = Math.min(100, Math.floor((displayStats.xp_in_current / displayStats.xp_needed) * 100)) || 0;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '⌘', id: 'dashboard' },
        { path: '/journey', label: 'Roadmap', icon: '◬', id: 'journey' },
        { path: '/blog', label: 'Logs', icon: '📓', id: 'blog' },
        { path: '/settings', label: 'Engine', icon: '⚙', id: 'settings' }
    ];

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <aside className="w-[300px] bg-surface-secondary border-r border-white/5 h-full flex flex-col shrink-0 relative overflow-hidden z-20 shadow-2xl">
            {/* Ambient Sidebar Decor */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-accent-blue/5 blur-[80px] rounded-full pointer-events-none -mt-48"></div>

            {/* Header / Brand */}
            <div className="px-10 py-12 relative z-10">
                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-premium group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                        <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tightest leading-none">LiveJourney</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"></span>
                            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.25em] opacity-60 font-mono text-accent-green">Stable_v3.2</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-6 space-y-2 relative z-10">
                <p className="px-4 text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-4 opacity-40">System_Protocol</p>
                {navItems.map(item => {
                    const active = isActive(item.path);
                    const labelMap: Record<string, string> = {
                        'Dashboard': 'Mission_Ctrl',
                        'Roadmap': 'Operations',
                        'Logs': 'Chronicle',
                        'Engine': 'Settings'
                    };
                    return (
                        <div
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`relative flex items-center gap-4 px-5 py-3.5 cursor-pointer rounded-2xl transition-all duration-500 group ${active
                                ? 'bg-white/[0.04] text-white border border-white/10 shadow-premium'
                                : 'text-text-muted hover:text-white hover:bg-white/[0.02] border border-transparent'}`}
                        >
                            <span className={`text-xl transition-all duration-500 ${active ? 'scale-110 text-accent-blue' : 'group-hover:scale-110 group-hover:text-accent-blue'}`}>
                                {item.icon}
                            </span>

                            <span className={`text-[11px] font-black tracking-[0.15em] uppercase transition-colors ${active ? 'text-white' : 'group-hover:text-white'}`}>
                                {labelMap[item.label] || item.label}
                            </span>

                            {active && (
                                <motion.div
                                    layoutId="activeNavIndicatorSidebar"
                                    className="absolute right-4 w-1.5 h-1.5 bg-accent-blue rounded-full shadow-glow-blue"
                                />
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Profile & Footer */}
            <div className="p-8 mt-auto relative z-10 space-y-8 bg-white/[0.01] border-t border-white/5">
                <div className="space-y-6">
                    {/* Level Progress */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                            <span className="text-white/40">Tier_{displayStats.level}</span>
                            <span className="text-accent-blue">{xpPercent}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full shadow-glow-blue/20"
                                initial={{ width: 0 }}
                                animate={{ width: `${xpPercent}%` }}
                                transition={{ duration: 1.5, ease: 'circOut' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Continuity</span>
                            <span className="text-xs font-black text-accent-orange leading-none">{displayStats.streak} CYCLES</span>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-40">Yield</span>
                            <span className="text-xs font-black text-white leading-none">{displayStats.xp_in_current} XP</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-10 h-10 rounded-xl bg-surface-tertiary flex items-center justify-center text-xl border border-white/10 group-hover:scale-110 transition-all relative z-10 shadow-premium">
                            {user?.profile?.avatar_emoji || '👨‍💻'}
                        </div>
                        <div className="min-w-0 flex-1 relative z-10 text-left">
                            <div className="font-black text-xs text-white truncate uppercase tracking-tighter">{user?.profile?.display_name || user?.username}</div>
                            <div className="text-[9px] text-text-muted font-black truncate uppercase tracking-[0.1em] opacity-50">OPERATOR_ID</div>
                        </div>
                    </button>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-accent-red/[0.03] border border-accent-red/10 text-accent-red hover:bg-accent-red hover:text-black transition-all text-[10px] font-black uppercase tracking-[0.3em]"
                    >
                        Disconnect_Session
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
