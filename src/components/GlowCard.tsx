import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
    delay?: number;
}

export function GlowCard({
    children,
    className,
    glowColor = "rgba(var(--primary), 0.3)",
    delay = 0,
}: GlowCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className={cn(
                "relative group rounded-3xl p-px overflow-hidden bg-gradient-to-b from-border/50 to-transparent hover:from-primary/50 transition-all duration-500",
                className
            )}
        >
            {/* Animated Gradient Border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glow Effect */}
            <div
                className="absolute -inset-1 rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 z-0"
                style={{ backgroundColor: glowColor }}
            />

            <div className="relative z-10 h-full w-full bg-card/80 backdrop-blur-xl rounded-[23px] overflow-hidden flex flex-col">
                {children}
            </div>
        </motion.div>
    );
}
