import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background overflow-hidden">
            {/* Dynamic Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/30 blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-accent/30 blur-[120px]"
                />
            </div>

            <div className="relative flex flex-col items-center">
                {/* Pulsing Logo Container */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    {/* Animated Glow Rings */}
                    {[1, 2, 3].map((index) => (
                        <motion.div
                            key={index}
                            animate={{
                                scale: [1, 1.5],
                                opacity: [0.3, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.6,
                                ease: "easeOut"
                            }}
                            className="absolute inset-0 rounded-2xl bg-primary/20 blur-md"
                        />
                    ))}

                    {/* Core Logo */}
                    <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-primary/40 relative z-10">
                        <Sparkles className="h-10 w-10 text-primary-foreground" />
                    </div>
                </motion.div>

                {/* Text and Status */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-8 text-center"
                >
                    <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
                        IntelliScan
                    </h2>
                    <div className="mt-4 flex items-center justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-60">
                        Initializing Secure Session
                    </p>
                </motion.div>
            </div>

            {/* Decorative Floating Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0,
                            scale: Math.random() * 0.5 + 0.5
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0, 0.4, 0]
                        }}
                        transition={{
                            duration: Math.random() * 5 + 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                        className="absolute w-1 h-1 rounded-full bg-primary/30"
                    />
                ))}
            </div>
        </div>
    );
};
