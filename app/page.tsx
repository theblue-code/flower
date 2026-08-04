"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const RoseSVG = ({ color }: { color: string }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        <path d="M12 10c-1-1-2.5-1.5-4-1.5-1.5 0-2.5.5-3 1.5.5 1.5 2.5 3 5 4 2.5-1 4.5-2.5 5-4-.5-1-1.5-1.5-3-1.5-1.5 0-3 .5-4 1.5z" fill="rgba(0,0,0,0.15)" />
        <path d="M12 13c-1.5 1.5-3 2-4 2 2 1.5 5 2.5 6 1 .5-.5.5-1.5 0-2.5-.5-.5-1.5-.5-2-.5z" fill="rgba(255,255,255,0.2)" />
    </svg>
);

export default function RomanticSurprise() {
    const [started, setStarted] = useState(false);
    const [phase, setPhase] = useState(0);
    const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [numRoses, setNumRoses] = useState(70);
    const [initialPositions, setInitialPositions] = useState<{ x: number; y: number }[]>([]);

    useEffect(() => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleStart = () => {
        if (audioRef.current) {
            audioRef.current.volume = 0.6;
            audioRef.current.play().catch(() => { });
        }

        setInitialPositions(Array.from({ length: numRoses }).map(() => getRandomPosition()));
        setStarted(true);

        setTimeout(() => setPhase(1), 4000);

        setTimeout(() => setPhase(2), 7000);
    };



    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf = 0;
        let particles: Array<any> = [];
        const maxParticles = 80; // lower density for cleaner look

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = Math.max(600, windowSize.w) * dpr;
            canvas.height = Math.max(600, windowSize.h) * dpr;
            canvas.style.width = Math.max(600, windowSize.w) + 'px';
            canvas.style.height = Math.max(600, windowSize.h) + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        resize();

        const heartPoint = (t: number, scale = 1) => {
            // parametric heart curve (classic)
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return { x: x * scale, y: y * scale };
        };

        const samplePointOnBoundary = (): { x: number; y: number } => {
            // sample a point on or very near the heart boundary (outline)
            const t = Math.random() * Math.PI * 2;
            const boundary = heartPoint(t, 1);
            // stay near the outline to avoid filling the heart (r ~ 0.94-1.02)
            const r = 0.96 + (Math.random() - 0.5) * 0.12;
            return { x: boundary.x * r, y: boundary.y * r };
        };

        // convert heart coordinates to canvas coordinates (centered)
        const toCanvas = (p: { x: number; y: number }) => {
            const scale = windowSize.w < 768 ? windowSize.w / 45 : windowSize.w / 60;
            const cx = canvas.width / (window.devicePixelRatio || 1) / 2;
            const cy = canvas.height / (window.devicePixelRatio || 1) / 2 - (windowSize.w < 768 ? 20 : 40);
            return { x: cx + p.x * scale, y: cy + p.y * scale };
        };

        const spawn = () => {
            if (particles.length > maxParticles) return;
            const base = samplePointOnBoundary();
            const pos = toCanvas(base);
            particles.push({
                x: pos.x + (Math.random() - 0.5) * 4,
                y: pos.y + (Math.random() - 0.5) * 4,
                vx: (Math.random() - 0.5) * 0.12,
                vy: (Math.random() - 0.8) * 0.24,
                life: 0.9 + Math.random() * 1.4,
                size: 0.6 + Math.random() * 1.2,
                hue: 335 + Math.random() * 14,
            });
        };

        const step = (dt: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // spawn fewer particles and mainly on the outline to avoid clutter
            if (phase >= 1) {
                // lower spawn rate for cleaner appearance
                for (let i = 0; i < 1; i++) spawn();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * dt * 0.06;
                p.y += p.vy * dt * 0.06;
                p.life -= 0.016 * (0.6 + Math.random() * 0.4);
                const alpha = Math.max(0, Math.min(1, p.life / 1.6));

                // draw smaller soft glow to avoid heavy overlap
                ctx.globalCompositeOperation = 'lighter';
                const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                grad.addColorStop(0, `hsla(${p.hue}, 85%, 67%, ${alpha * 0.9})`);
                grad.addColorStop(0.5, `hsla(${p.hue}, 85%, 67%, ${alpha * 0.45})`);
                grad.addColorStop(1, `rgba(255,255,255,0)`);
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';

                if (p.life <= 0) particles.splice(i, 1);
            }
        };

        let last = performance.now();
        const loop = (now: number) => {
            const dt = now - last;
            last = now;
            step(dt);
            raf = requestAnimationFrame(loop);
        };

        raf = requestAnimationFrame(loop);

        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, [canvasRef, phase, windowSize.w, windowSize.h]);


    const getHeartPosition = (index: number, total = numRoses) => {
        const t = (index / total) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        const scale = windowSize.w < 768 ? windowSize.w / 45 : windowSize.w / 60;

        return {
            x: x * scale,
            y: y * scale - (windowSize.w < 768 ? 20 : 40),
        };
    };

    const getRandomPosition = () => {
        return {
            x: (Math.random() - 0.5) * (windowSize.w * 0.9),
            y: (Math.random() - 0.5) * (windowSize.h * 0.9),
        };
    };

    const getCurvePoints = (start: { x: number; y: number }, end: { x: number; y: number }, steps = 5) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.hypot(dx, dy) || 1;
        const mx = (start.x + end.x) / 2;
        const my = (start.y + end.y) / 2;
        const offset = Math.min(220, dist * 0.5) * (Math.random() < 0.5 ? -1 : 1);
        const nx = -dy / dist;
        const ny = dx / dist;
        const cx = mx + nx * offset;
        const cy = my + ny * offset - Math.abs(offset) * 0.15;

        const xs: number[] = [];
        const ys: number[] = [];
        for (let s = 0; s < steps; s++) {
            const t = (s + 1) / (steps + 1);
            const inv = 1 - t;
            // quadratic Bezier
            const x = inv * inv * start.x + 2 * inv * t * cx + t * t * end.x;
            const y = inv * inv * start.y + 2 * inv * t * cy + t * t * end.y;
            xs.push(x);
            ys.push(y);
        }
        return { xs: [start.x, ...xs, end.x], ys: [start.y, ...ys, end.y] };
    };

    useEffect(() => {
        if (started) return;
        setInitialPositions(Array.from({ length: numRoses }).map(() => getRandomPosition()));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numRoses, windowSize.w, windowSize.h]);

    if (windowSize.w === 0) return <div className="bg-[#0a0608] min-h-screen"></div>;

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#0a0608] to-[#1a0f14] overflow-hidden flex items-center justify-center font-serif">
            {/* Matrix hearts background */}
            <div className="matrix-hearts">
                {Array.from({ length: 70 }).map((_, i) => {
                    const left = Math.random() * 100;
                    const duration = 8 + Math.random() * 12; // 8-20s
                    const delay = -Math.random() * 20; // start offset
                    const size = 8 + Math.random() * 14;
                    const style: React.CSSProperties = {
                        left: `${left}%`,
                        top: `${-10 - Math.random() * 20}vh`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animationDuration: `${duration}s`,
                        animationDelay: `${delay}s`,
                        opacity: 0.6 + Math.random() * 0.4,
                        transform: 'rotate(-45deg)'
                    };
                    return <div key={i} className="matrix-heart fall" style={style} />;
                })}
            </div>

            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10" />

            <audio ref={audioRef} src="/him-and-i.mp3" loop playsInline aria-hidden="true" style={{ display: 'none' }} />

            {/* زر البدء */}
            <AnimatePresence>
                {!started && (
                    <motion.button
                        onClick={handleStart}
                        className="z-50 px-8 py-4 bg-rose-950/40 text-rose-200 border border-rose-500/30 rounded-full text-xl md:text-2xl backdrop-blur-md transition-all hover:bg-rose-900/60 shadow-[0_0_30px_rgba(225,29,72,0.2)] tracking-wider cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                    >
                        Click to Open
                    </motion.button>
                )}
            </AnimatePresence>

            {started && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                    {Array.from({ length: numRoses }).map((_, i) => {
                        const randomPos = initialPositions[i] ?? getRandomPosition();
                        const heartPos = getHeartPosition(i, numRoses);
                        const path = getCurvePoints(randomPos, heartPos, 5);
                        // التنويع بين الأحمر والزهري
                        const isRed = i % 2 === 0;
                        const roseColor = isRed ? "#e11d48" : "#fb7185";
                        // مسارات الحركة: إذا كنا في مرحلة التشكيل، نمرر مصفوفات نقاط x/y
                        const animateX = phase >= 1 ? path.xs : [randomPos.x];
                        const animateY = phase >= 1 ? path.ys : [randomPos.y];
                        const dur = phase === 1 ? 2.6 : 1.5;
                        const delay = phase === 0 ? Math.random() * 2 : Math.random() * 0.6;

                        return (
                            <motion.div
                                key={i}
                                className="absolute w-8 h-8 md:w-12 md:h-12"
                                initial={{
                                    x: randomPos.x,
                                    y: randomPos.y,
                                    scale: 0,
                                    opacity: 0,
                                    rotate: Math.random() * 180 - 90,
                                }}
                                animate={{
                                    x: animateX,
                                    y: animateY,
                                    scale: phase >= 1 ? (windowSize.w < 768 ? 0.6 : 0.8) : (Math.random() * 0.5 + 0.7),
                                    opacity: 1,
                                    rotate: phase >= 1 ? 0 : Math.random() * 360,
                                }}
                                transition={{
                                    duration: dur,
                                    ease: [0.25, 0.1, 0.25, 1],
                                    delay,
                                }}
                            >
                                <RoseSVG color={roseColor} />
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {phase === 2 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="z-40 text-center pointer-events-none"
                    >
                        <h1
                            className="text-6xl md:text-8xl italic text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200"
                            style={{ textShadow: '0 0 40px rgba(251, 113, 133, 0.4)' }}
                        >
                            I love you
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
