import React from 'react';
import { motion } from 'framer-motion';

interface XPPopProps {
    xp: number;
    x: number;
    y: number;
    onComplete: () => void;
}

const XPPop: React.FC<XPPopProps> = ({ xp, x, y, onComplete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: y, x: x }}
            animate={{ opacity: 1, y: y - 100 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={onComplete}
            className="fixed z-[99] pointer-events-none text-accent-green font-mono font-bold text-xl drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]"
        >
            {xp > 0 ? '+' : ''}{xp} XP ⚡
        </motion.div>
    );
};

export default XPPop;
