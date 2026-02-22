import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState(import.meta.env.VITE_INITIAL_USERNAME || '');
    const [password, setPassword] = useState(import.meta.env.VITE_INITIAL_PASSWORD || '');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login/', { username, password });
            login(data.access, data.refresh);
            navigate('/dashboard');
        } catch {
            setError('Invalid username or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-surface-primary text-text-primary font-sans overflow-hidden relative">
            {/* Ambient Animated Backgrounds */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-blue/10 blur-[120px] rounded-full animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[150px] rounded-full animate-float"></div>
            </div>

            {/* Left Side - Visual/Branding */}
            <div className="hidden lg:flex w-7/12 bg-surface-primary items-center justify-center relative p-20 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="relative z-10 max-w-xl"
                >
                    <div className="w-16 h-16 bg-accent-blue/10 rounded-2xl flex items-center justify-center border border-accent-blue/20 mb-10 shadow-glow-blue/20">
                        <span className="text-3xl">⚡</span>
                    </div>

                    <h1 className="text-8xl font-black text-white mb-8 tracking-tightest leading-[0.9]">
                        Design your <br />
                        <span className="text-gradient-blue">Greatness.</span>
                    </h1>

                    <p className="text-xl text-text-secondary leading-relaxed font-medium mb-12 max-w-md">
                        The elite 60-day challenge to architect your discipline, habits, and unstoppable growth.
                    </p>

                    <div className="flex gap-12">
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white">60</p>
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em]">Day Protocol</p>
                        </div>
                        <div className="w-[1px] h-12 bg-white/10 self-center"></div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-white">100%</p>
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-[0.3em]">Consistency</p>
                        </div>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center opacity-20">
                    <div className="w-[150%] h-[150%] border-[1px] border-white/5 rounded-full animate-pulse-soft"></div>
                    <div className="absolute w-[180%] h-[180%] border-[1px] border-white/5 rounded-full animate-pulse-soft delay-700"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-5/12 flex items-center justify-center p-8 md:p-16 relative z-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="card p-10 bg-white/[0.02] border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                        {/* Card Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 blur-3xl -mr-16 -mt-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="mb-12 relative z-10">
                            <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Access Hub</h2>
                            <p className="text-text-secondary font-medium italic">Authenticate to continue your evolution.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-1 opacity-70">User Identifier</label>
                                <input
                                    type="text"
                                    className="input block w-full bg-white/[0.03] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.05] shadow-inner font-semibold py-3.5"
                                    placeholder="your_username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-70">Security Protocol</label>
                                </div>
                                <input
                                    type="password"
                                    className="input block w-full bg-white/[0.03] border-white/10 hover:border-accent-blue/30 focus:bg-white/[0.05] shadow-inner font-semibold py-3.5"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3"
                                >
                                    <span>⚠️</span> {error}
                                </motion.div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn w-full bg-accent-blue hover:bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] py-4 shadow-glow-blue transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Decrypting...
                                    </div>
                                ) : (
                                    'Establish Connection'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-12 flex flex-col items-center gap-6 opacity-30">
                        <div className="h-[1px] w-20 bg-white/20"></div>
                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted">
                            © 2026 ARCHITECT OS
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
