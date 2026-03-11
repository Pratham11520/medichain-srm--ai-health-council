import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    in: {
        opacity: 1,
        y: 0
    },
    out: {
        opacity: 0,
        y: -20
    }
};

const pageTransition: any = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
};

export const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};
