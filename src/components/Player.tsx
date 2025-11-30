import React from 'react';
import { motion } from 'framer-motion';

interface PlayerProps {
    y: number;
}

const Player: React.FC<PlayerProps> = ({ y }) => {
    return (
        <motion.div
            className="absolute left-10 bottom-20 w-10 h-10 bg-black border-2 border-neon-pink shadow-[0_0_15px_#ff00ff]"
            style={{ y }} // Framer motion handles the transform
            animate={{ rotate: y !== 0 ? 180 : 0 }} // Rotate when jumping
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="absolute inset-2 bg-neon-pink opacity-50 blur-sm" />
        </motion.div>
    );
};

export default Player;
