import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from './ui/button';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl"
                >
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Cookie className="w-8 h-8 text-primary" />
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                We value your privacy
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                This website uses cookies to enhance your experience and keep you logged in.
                                By clicking "Accept All", you consent to our use of cookies.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                className="flex-1 md:flex-none border-slate-200 dark:border-slate-700"
                            >
                                Reject
                            </Button>
                            <Button
                                onClick={handleAccept}
                                className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                            >
                                Accept All
                            </Button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
