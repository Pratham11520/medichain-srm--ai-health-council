import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const pageVariants = {
    initial: {
        opacity: 0,
        scale: 0.98,
        filter: "blur(10px)"
    },
    in: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)"
    },
    out: {
        opacity: 0,
        scale: 1.02,
        filter: "blur(10px)"
    }
};

const pageTransition: any = {
    type: "tween",
    ease: "circOut",
    duration: 0.4
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
