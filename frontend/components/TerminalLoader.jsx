import React, { useState, useEffect, useRef } from 'react';

const TerminalLoader = () => {
    const [logs, setLogs] = useState([]);
    const terminalRef = useRef(null);

    const tasks = [
        "Initializing neural core...",
        ">> loading_modules: [vision, audio, physics]",
        "Accessing truth_lens database...",
        "Decrypting video metadata...",
        "Analyzing frame histograms...",
        "Detecting compression artifacts...",
        "Comparing biometric landmarks...",
        "Running temporal consistency check...",
        "FINALIZING VERDICT..."
    ];

    useEffect(() => {
        let delay = 0;
        tasks.forEach((task) => {
            // Random delay between 100ms and 400ms for realism
            delay += Math.random() * 300 + 100;

            setTimeout(() => {
                setLogs(prev => [...prev, task]);
                // Auto-scroll to bottom
                if (terminalRef.current) {
                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
                }
            }, delay);
        });
    }, []);

    return (
        <div className="mt-8 text-left w-full max-w-2xl mx-auto font-mono text-xs">
            {/* Terminal Header */}
            <div className="bg-gray-900 border-t border-l border-r border-green-500/30 px-3 py-1 flex items-center justify-between rounded-t-sm">
                <span className="text-green-600 font-bold">TRUTH_LENS // SYSTEM_LOG</span>
                <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
            </div>

            {/* Terminal Body */}
            <div
                ref={terminalRef}
                className="h-40 overflow-hidden bg-black/90 border-2 border-green-500/20 p-4 shadow-[0_0_20px_rgba(0,255,0,0.1)] relative"
            >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_2px,3px_100%] z-10 opacity-20"></div>

                <div className="flex flex-col justify-end min-h-full z-20 relative">
                    {logs.map((log, i) => (
                        <p key={i} className="text-green-500/80 mb-1 font-mono tracking-wide">
                            <span className="text-green-700 mr-2">root@truth_lens:~#</span>
                            {log}
                        </p>
                    ))}
                    <p className="text-green-500 animate-pulse mt-1">_</p>
                </div>
            </div>

            {/* Loading Bar */}
            <div className="w-full h-1 bg-gray-800 mt-1">
                <div className="h-full bg-green-500 animate-[width_3s_ease-in-out_infinite] w-full origin-left"></div>
            </div>
        </div>
    );
};

export default TerminalLoader;
