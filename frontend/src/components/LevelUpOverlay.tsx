import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelUpOverlayProps {
    level: number;
    title?: string;
    onClose: () => void;
}

const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({ level, title, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 500); // Allow animation to finish
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-surface-primary/95 backdrop-blur-sm pointer-events-none"
                    onClick={() => setIsVisible(false)}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="text-center p-12 relative"
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-accent-green/10 rounded-full blur-[100px] animate-pulse"></div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-accent-green font-mono text-2xl mb-2 tracking-[0.5em]"
                        >
                            LEVEL UP
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                            className="text-[12rem] font-black text-text-primary leading-none font-mono tracking-tighter"
                        >
                            {level}
                        </motion.div>

                        {title && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="text-accent-blue font-mono mt-4 text-xl border border-accent-blue/50 px-6 py-2 inline-block bg-accent-blue/5"
                            >
                                ▸ {title.toUpperCase()}
                            </motion.div>
                        )}

                        <div className="mt-12 flex justify-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: 1.2 + (i * 0.1), duration: 0.3 }}
                                    className="w-1 h-8 bg-accent-green/40 mx-1"
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpOverlay;
