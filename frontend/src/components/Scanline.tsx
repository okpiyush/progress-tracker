import React from 'react';

const Scanline: React.FC = () => {
    return (
        <>
            {/* Moving scanline */}
            <div className="scanline-move pointer-events-none" />

            {/* Global flicker overlay (very subtle) */}
            <div className="fixed inset-0 pointer-events-none z-[1001] bg-black opacity-[0.015] animate-flicker" />

            {/* Static scanline pattern */}
            <div className="fixed inset-0 pointer-events-none z-[1002]" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.1) 1px, rgba(0, 0, 0, 0.1) 2px)',
                backgroundSize: '100% 2px'
            }} />
        </>
    );
};

export default Scanline;
