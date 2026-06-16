import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useMotionTemplate, useScroll } from "framer-motion";

import {
  ArrowUpRight, BookOpen, Download, ExternalLink, GraduationCap,
  Home, Mail, Sparkles, User, X, ChevronRight, ZoomIn, ZoomOut,
  FolderKanban,
} from "lucide-react";
import { EDUCATION, NAV, PROJECTS, SKILLS, TECH_MARQUEE_ITEMS, TYPED } from "../config/portfolioData.jsx";
import { S, T } from "../config/theme.js";
import { useDynamicFavicon } from "../hooks/useDynamicFavicon.js";
import { useKonamiCode } from "../hooks/useKonamiCode.js";
import { useMagnetic } from "../hooks/useMagnetic.js";
import { getAudioCtx } from "../lib/audio.js";
import { openExternalUrl } from "../lib/externalLinks.js";
import { getTimeGreeting } from "../lib/time.js";

const RESUME_IMAGE_URL = "/resume.png";

/* ─── SCROLL BAR ─────────────────────────────────────────────────────────────── */
function ScrollProgress() {
  const prog = useMotionValue(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      prog.set((el.scrollTop / (el.scrollHeight - el.clientHeight)) || 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [prog]);
  return (
    <motion.div style={{ scaleX: prog, transformOrigin: "left", position: "fixed", top: 0, left: 0, right: 0, height: 2, background: T.white, zIndex: 9999, willChange: "transform" }} />
  );
}

/* ─── TYPEWRITER ─────────────────────────────────────────────────────────────── */
function TypingText({ strings, speed = 58, pause = 2200 }) {
  const [si, setSi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const cur = strings[si] ?? "";
  const txt = cur.slice(0, ci);

  useEffect(() => {
    let t;
    if (!del && ci < cur.length) t = setTimeout(() => setCi(c => c + 1), speed);
    else if (!del && ci === cur.length) t = setTimeout(() => setDel(true), pause);
    else if (del && ci > 0) t = setTimeout(() => setCi(c => c - 1), speed / 2);
    else t = setTimeout(() => { setDel(false); setSi(s => (s + 1) % strings.length); }, 0);
    return () => clearTimeout(t);
  }, [ci, cur.length, del, strings.length, speed, pause]);
  return (
    <span style={{ color: T.textSub, fontFamily: "monospace" }}>
      {txt}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
        style={{ display: "inline-block", width: 2, height: "0.8em", background: T.white, marginLeft: 3, verticalAlign: "middle" }}
      />
    </span>
  );
}

/* ─── DOCK ICON ──────────────────────────────────────────────────────────────── */
function DockIcon({ mouseX, icon: Icon, action, label, isActive, isMobile }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const distance = useTransform(mouseX, val => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const size = useSpring(useTransform(distance, [-80, 0, 80], [34, 54, 34]), { mass: 0.06, stiffness: 200, damping: 12 });
  const yOff = useSpring(useTransform(distance, [-80, 0, 80], [0, -12, 0]), { mass: 0.06, stiffness: 200, damping: 12 });
  const {
    setRef: setMagneticRef,
    x: magneticX,
    onMove: handleMagneticMove,
    onLeave: handleMagneticLeave,
  } = useMagnetic(0.30);

  const setButtonRef = useCallback((node) => {
    ref.current = node;
    if (!isMobile) setMagneticRef(node);
  }, [isMobile, setMagneticRef]);

  const playSoftTick = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      return;
    }
  }, []);

  return (

    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnimatePresence>
        {hovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              position: "absolute",
              top: -40,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "4px 12px",
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              color: T.white,
              pointerEvents: "none",
              whiteSpace: "nowrap"
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        ref={setButtonRef}
        onClick={action}
        onMouseMove={!isMobile ? handleMagneticMove : undefined}
        onMouseLeave={() => { if (!isMobile) handleMagneticLeave(); setHovered(false); }}
        onMouseEnter={() => { setHovered(true); playSoftTick(); }}
        whileTap={{ scale: 0.88 }}
        whileHover={{ background: "rgba(255,255,255,0.18)" }}
        style={{
          width: isMobile ? 44 : size,
          height: isMobile ? 44 : size,
          y: isMobile ? 0 : yOff,
          x: isMobile ? 0 : magneticX,
          flexShrink: 0,
          borderRadius: "50%",
          border: isActive ? "1px solid rgba(255,255,255,0.5)" : "1px solid rgba(255,255,255,0.22)",
          background: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.10)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: isActive ? "0 0 15px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.30)" : "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: "50% 50% 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)", pointerEvents: "none" }} />
        <Icon style={{ width: "38%", height: "38%", color: isActive ? "#fff" : "rgba(255,255,255,0.9)", position: "relative" }} />
      </motion.button>

      {/* Active Dot */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activeDockDot"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: "absolute",
              bottom: -6,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: T.white,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)"
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── AMBIENT ORBS — motion-value driven, zero React re-renders ─────────────── */
const AMBIENT_ORBS = [
  { top: -100, left: -100, size: 500, op: 0.055, dx: 1.5, dy: 1.0 },
  { top: "25%", right: -120, size: 380, op: 0.04, dx: -1.1, dy: 0.7 },
  { bottom: 0, left: "35%", size: 340, op: 0.035, dx: 0.7, dy: -0.5 },
];

function AmbientOrb({ orb, mouseX, mouseY }) {
  const x = useTransform(mouseX, value => value * orb.dx);
  const y = useTransform(mouseY, value => value * orb.dy);
  const springX = useSpring(x, { stiffness: 38, damping: 22 });
  const springY = useSpring(y, { stiffness: 38, damping: 22 });

  return (
    <motion.div
      style={{ x: springX, y: springY, position: "absolute", top: orb.top, bottom: orb.bottom, left: orb.left, right: orb.right, width: orb.size, height: orb.size, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${orb.op}) 0%, transparent 70%)` }}
    />
  );
}

function AmbientOrbs({ mouseX, mouseY }) {
  return (
    <div style={{ pointerEvents: "none", position: "fixed", inset: 0, overflow: "hidden" }}>
      {AMBIENT_ORBS.map((orb, index) => <AmbientOrb key={index} orb={orb} mouseX={mouseX} mouseY={mouseY} />)}
    </div>
  );
}

/* ─── GLASS CARD w/ 3D Tilt & Flashlight Border ──────────────────────────────── */
function GlassCard({ children, style = {}, onClick, hover = true }) {
  const ref = useRef(null);

  // 3D Tilt coordinates
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 400, damping: 30 });
  const springTiltY = useSpring(tiltY, { stiffness: 400, damping: 30 });

  // Border & Glare coordinates
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    mouseX.set(curX);
    mouseY.set(curY);

    if (hover) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      tiltX.set(((curY - centerY) / centerY) * -4); // Tilt max 4 deg
      tiltY.set(((curX - centerX) / centerX) * 4);
    }
  }

  function handleMouseLeave() {
    mouseX.set(-1000);
    mouseY.set(-1000);
    if (hover) {
      tiltX.set(0);
      tiltY.set(0);
    }
  }

  const borderFade = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.5), transparent 80%)`;
  const glareFade = useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hover ? { scale: 1.015, zIndex: 10 } : {}}
      onClick={onClick}
      style={{
        ...S.card,
        rotateX: springTiltX,
        rotateY: springTiltY,
        transformPerspective: 1200,
        position: "relative",
        border: "1px solid transparent", // Use transparent border so background shines through
        ...style
      }}
    >
      {/* Base Glass Backdrop */}
      <div style={{ position: "absolute", inset: 0, borderRadius: T.radius, background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Glare internal highlight */}
      <motion.div style={{ position: "absolute", inset: 0, borderRadius: T.radius, background: glareFade, pointerEvents: "none", zIndex: 1 }} />

      {/* Flashlight glowing border */}
      <motion.div style={{
        position: "absolute", inset: 0, borderRadius: T.radius, pointerEvents: "none",
        border: "1px solid transparent",
        background: borderFade,
        backgroundOrigin: "border-box",
        backgroundClip: "border-box",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        zIndex: 2
      }} />

      <div style={{ position: "relative", zIndex: 5, pointerEvents: onClick ? "none" : "auto", height: "100%" }}>
        {children}
      </div>
    </motion.div>
  );
}

function Tag({ children }) { return <span style={S.tag}>{children}</span>; }

/* ─── SCROLL REVEAL — GPU-composited, zero re-renders ──────────────────────────
   Uses useScroll on the element's own ref so the animation is driven purely by
   scroll position via motion values, never touching React state.               */
function ScrollReveal({ children, y = 22, delay = 0, style = {}, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.25 1"],   // starts when bottom of element hits bottom of viewport
  });
  // Spring-smooth the raw scroll progress so it eases beautifully
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 22, restDelta: 0.001 });
  const opacity = useTransform(smooth, [0, 1], [0, 1]);
  const translateY = useTransform(smooth, [0, 1], [y, 0]);
  return (
    <motion.div
      ref={ref}
      style={{ opacity, y: translateY, willChange: "transform, opacity", ...style }}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── ANIMATED COUNTER — counts up when scrolled into view ────────────────── */
function AnimatedCounter({ value, suffix = "", duration = 1400 }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const numericValue = parseInt(value, 10);
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (!isNumeric || hasAnimated || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasAnimated(true);
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo for a satisfying deceleration
          const eased = 1 - Math.pow(2, -10 * progress);
          setCount(Math.floor(eased * numericValue));
          if (progress < 1) requestAnimationFrame(step);
          else setCount(numericValue);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNumeric, numericValue, hasAnimated, duration]);

  return <span ref={ref}>{isNumeric ? `${count}${suffix}` : value}</span>;
}

/* ─── TERMINAL OVERLAY — press ` to toggle ────────────────────────────────── */
function TerminalOverlay({ show, onClose, scrollTo }) {
  const [lines, setLines] = useState([
    { type: "system", text: "Welcome to VishalrajTSR/portfolio v1.0.0" },
    { type: "system", text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const COMMANDS = {
    help: () => [
      "Available commands:",
      "  about      — Who is Vishalraj?",
      "  skills     — Technical proficiency",
      "  projects   — Featured work",
      "  education  — Academic background",
      "  contact    — Get in touch",
      "  goto <sec> — Navigate to a section",
      "  whoami     — Current visitor info",
      "  clear      — Clear terminal",
      "  exit       — Close terminal",
    ],
    about: () => [
      "┌─────────────────────────────────────┐",
      "│  Vishalraj TSR                      │",
      "│  Full Stack Developer & Data Analyst│",
      "│  MCA @ SRM IST · Chennai, India     │",
      "│  \"I ship real projects while I study │",
      "│   — waiting to graduate is overrated\"│",
      "└─────────────────────────────────────┘",
    ],
    skills: () => [
      "Frontend:  React · JavaScript · HTML/CSS · Figma",
      "Backend:   Node.js · Java · Python · Firebase",
      "Data:      SQL · MongoDB · Tableau · AWS",
      "Other:     Arduino/IoT · Kali Linux · Swift",
    ],
    projects: () => [
      "[1] Payment System    — Secure payment gateway via APIs",
      "[2] E-Commerce Store  — Decentralized product platform",
      "[3] Image Analyzer    — AI detecting manipulated images",
      "[4] Study Monitor     — IoT study environment tracker",
    ],
    education: () => [
      "🎓 MCA — SRM IST VDP Campus (2024–2026, Current)",
      "🎓 BCA Cloud & Security — Crescent University (2021–2024)",
      "🎓 HSC Computer Science — DAV School (Graduated 2021)",
    ],
    contact: () => [
      "📧 Email:    vkkmmg22@gmail.com",
      "🔗 LinkedIn: linkedin.com/in/tsr-vishalraj-256106401",
      "🐙 GitHub:   github.com/viixhal",
    ],
    whoami: () => [
      `Visitor from ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      `Browser: ${navigator.userAgent.split(') ')[0].split('(')[1] || 'Unknown'}`,
      `Screen: ${window.innerWidth}×${window.innerHeight}`,
      `Local time: ${new Date().toLocaleTimeString()}`,
    ],
  };

  function handleSubmit(e) {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    const newLines = [{ type: "input", text: `$ ${cmd}` }];

    if (cmd === "clear") {
      setLines([{ type: "system", text: 'Terminal cleared. Type "help" for commands.' }]);
      setInput("");
      return;
    }
    if (cmd === "exit") { onClose(); setInput(""); return; }
    if (cmd.startsWith("goto ")) {
      const target = cmd.slice(5).trim();
      const valid = ["home", "skills", "projects", "education", "contact"];
      if (valid.includes(target)) {
        newLines.push({ type: "system", text: `Navigating to ${target}...` });
        setTimeout(() => { scrollTo(target.charAt(0).toUpperCase() + target.slice(1)); onClose(); }, 500);
      } else {
        newLines.push({ type: "error", text: `Section "${target}" not found. Try: ${valid.join(", ")}` });
      }
    } else if (COMMANDS[cmd]) {
      COMMANDS[cmd]().forEach(t => newLines.push({ type: "output", text: t }));
    } else {
      newLines.push({ type: "error", text: `Command not found: ${cmd}. Type "help" for available commands.` });
    }
    setLines(prev => [...prev, ...newLines]);
    setInput("");
  }

  useEffect(() => {
    if (show && inputRef.current) inputRef.current.focus();
  }, [show]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 640, maxHeight: "70vh", borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(15,15,15,0.95)", boxShadow: "0 40px 120px rgba(0,0,0,0.8)", overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        {/* Title bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", cursor: "pointer" }} onClick={onClose} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
          <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>vishalraj@portfolio ~ zsh</span>
        </div>
        {/* Output */}
        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: 16, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12.5, lineHeight: 1.7 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: line.type === "input" ? "#27c93f" : line.type === "error" ? "#ff5f57" : line.type === "system" ? T.textMuted : "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
              {line.text}
            </div>
          ))}
        </div>
        {/* Input */}
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ color: "#27c93f", fontFamily: "monospace", fontSize: 13, fontWeight: 600 }}>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a command..."
            style={{ flex: 1, background: "transparent", border: "none", color: T.textPrimary, fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 13, outline: "none" }}
          />
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── KONAMI CODE CONFETTI ────────────────────────────────────────────────── */
const CONFETTI_COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8cc8", "#a855f7"];
const seededRandom = (seed) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};
const CONFETTI_PARTICLES = Array.from({ length: 60 }, (_, index) => ({
  id: index,
  color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
  delay: seededRandom(index + 1) * 0.3,
  angle: seededRandom(index + 11) * 360,
  distance: 200 + seededRandom(index + 21) * 400,
  size: 4 + seededRandom(index + 31) * 6,
  rotate: seededRandom(index + 41) * 720,
  duration: 1.2 + seededRandom(index + 51) * 0.5,
  borderRadius: seededRandom(index + 61) > 0.5 ? "50%" : "2px",
}));

function ConfettiExplosion({ show }) {
  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none", overflow: "hidden" }}>
      {CONFETTI_PARTICLES.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: "50vw", y: "50vh", scale: 1, opacity: 1 }}
          animate={{
            x: `calc(50vw + ${Math.cos(p.angle * Math.PI / 180) * p.distance}px)`,
            y: `calc(50vh + ${Math.sin(p.angle * Math.PI / 180) * p.distance}px)`,
            scale: 0,
            opacity: 0,
            rotate: p.rotate,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size, height: p.size,
            borderRadius: p.borderRadius,
            background: p.color,
          }}
        />
      ))}
      {/* Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          background: "rgba(15,15,15,0.9)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20,
          padding: "20px 36px", textAlign: "center", pointerEvents: "auto",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 4 }}>You found the secret!</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>Fun fact: This portfolio is now a modular React app.</div>
      </motion.div>
    </div>
  );
}

/* ─── LIVE DEMO TOAST — shown on page load ──────────────────────────────── */
function LiveDemoToast({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="live-demo-toast"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.8 }}
          style={{
            position: "fixed",
            bottom: 96,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9990,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 22px",
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(18,18,18,0.88)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={onClose}
        >
          {/* Pulsing green dot */}
          <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "block", animation: "pulse-dot 1.8s infinite" }} />
            <motion.span
              animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #22c55e" }}
            />
          </span>

          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>
              Live Demos Are Working
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              Click any project → try the live demo
            </span>
          </div>

          <span style={{ marginLeft: 6, fontSize: 11, color: "rgba(255,255,255,0.28)", userSelect: "none" }}>✕</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── LIVE DEMO BANNER — end-of-page section ─────────────────────────────── */
function LiveDemoBanner({ onViewDemo }) {
  return (
    <ScrollReveal y={18} style={{ marginTop: 56 }}>
      <div
        id="live-demo-banner"
        style={{
          borderRadius: "2rem",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
          padding: "36px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow blob */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* Animated status orb */}
          <div style={{ position: "relative", width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 20 }}>🚀</span>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
              style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid rgba(34,197,94,0.35)" }}
            />
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulse-dot 1.8s infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(34,197,94,0.85)" }}>All Systems Operational</span>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(18px, 3vw, 26px)", fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Live Demos Are Working
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 6, lineHeight: 1.6 }}>
              E-Commerce Platform is deployed and fully interactive — no sign-up required.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <motion.button
            id="try-live-demo-btn"
            onClick={onViewDemo}
            whileHover={{ opacity: 0.9, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              borderRadius: 9999,
              background: "#f0f0f0",
              color: "#0a0a0a",
              border: "none",
              padding: "11px 24px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <ArrowUpRight style={{ width: 14, height: 14 }} /> Try Live Demo
          </motion.button>
          <motion.button
            id="view-projects-demo-btn"
            onClick={onViewDemo}
            whileHover={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.28)", scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.17)",
              background: "rgba(255,255,255,0.07)",
              color: "#f0f0f0",
              padding: "11px 24px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              backdropFilter: "blur(10px)",
            }}
          >
            <FolderKanban style={{ width: 13, height: 13 }} /> View Projects
          </motion.button>
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ─── NAV LINKS — single liquid glass bubble tracks raw cursor X ─────────────── */
function NavLinks({ NAV, activeNav, scrollTo }) {
  const containerRef = useRef(null);
  const [inside, setInside] = useState(false);
  const [activeLabel, setActiveLabel] = useState(null);

  // Raw cursor target
  const rawX = useMotionValue(0);
  const rawW = useMotionValue(0);

  // 1. The fast spring immediately leaps to the cursor
  const leadX = useSpring(rawX, { stiffness: 450, damping: 28 });
  const leadW = useSpring(rawW, { stiffness: 450, damping: 28 });

  // 2. The slow spring intentionally lags behind
  const trailX = useSpring(rawX, { stiffness: 120, damping: 20 });
  const trailW = useSpring(rawW, { stiffness: 120, damping: 20 });

  const bubbleOpacity = useSpring(0, { stiffness: 180, damping: 20 });

  // 3. Elastic compute: calculate dynamic bounding box
  const stretchLeft = useTransform([leadX, trailX], ([lx, tx]) => Math.min(lx, tx));
  const stretchRight = useTransform([leadX, leadW, trailX, trailW], ([lx, lw, tx, tw]) => Math.max(lx + lw, tx + tw));
  const computedW = useTransform([stretchLeft, stretchRight], ([left, right]) => Math.max(0, right - left));

  const btnRefs = useRef({});
  const registerButton = useCallback((label, node) => {
    if (node) btnRefs.current[label] = node;
    else delete btnRefs.current[label];
  }, []);

  function handleMouseMove(e) {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const localX = e.clientX - cRect.left;

    let nearLabel = null;
    let nearBtn = null;

    // Check hit areas
    for (const [label, el] of Object.entries(btnRefs.current)) {
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const padding = 20; // Increased magnetic snap radius
      if (e.clientX >= b.left - padding && e.clientX <= b.right + padding) {
        nearLabel = label;
        nearBtn = el;
        break;
      }
    }
    setActiveLabel(nearLabel);

    if (nearBtn) {
      const b = nearBtn.getBoundingClientRect();
      rawW.set(b.width + 12); // Padded bubble width
      rawX.set(b.left - cRect.left - 6);
    } else {
      rawX.set(localX - 25);
      rawW.set(50); // Squeezes into a small generic circle when between items
    }
  }

  function handleMouseEnter() {
    setInside(true);
    bubbleOpacity.set(1);
    if (rawW.get() === 0) rawW.set(50);
  }

  function handleMouseLeave() {
    setInside(false);
    bubbleOpacity.set(0);
    setActiveLabel(null);
  }

  return (
    <div
      ref={containerRef}
      className="mobile-nav-scroll"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex", gap: 6, alignItems: "center", position: "relative", padding: "0 6px" }}
    >
      {/* Liquid Elastic Bubble */}
      <motion.div
        style={{
          position: "absolute",
          top: -2, bottom: -2,
          left: stretchLeft,
          width: computedW,
          opacity: bubbleOpacity,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.1)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Intense Specular Edge */}
        <div style={{ position: "absolute", top: 1, left: "10%", right: "10%", height: "40%", borderRadius: "999px 999px 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)", pointerEvents: "none" }} />
      </motion.div>

      {NAV.map(item => (
        <MagNavBtn
          key={item}
          item={item}
          active={(inside ? activeLabel : activeNav) === item}
          registerButton={registerButton}
          onClick={() => scrollTo(item)}
        />
      ))}
    </div>
  );
}

/* ── MagNavBtn — nav item with magnetic pull ────────────────────────────── */
function MagNavBtn({ item, active, registerButton, onClick }) {
  const { setRef, x, y, onMove, onLeave } = useMagnetic(0.28);
  const setButtonRef = useCallback((node) => {
    registerButton(item, node);
    setRef(node);
  }, [item, registerButton, setRef]);

  return (
    <motion.button
      className="nav-btn"
      ref={setButtonRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        x, y,
        position: "relative", zIndex: 1,
        borderRadius: T.pill, padding: "8px 18px", fontSize: 13, cursor: "pointer",
        border: "1px solid transparent", background: "transparent",
        color: active ? T.textPrimary : T.textSub,
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.02em",
        transition: "color 0.15s",
      }}
    >
      {item}
    </motion.button>
  );
}

/* ── View Projects — minimal interaction ─────────────────────────────────── */
function ViewProjectsBtn({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ opacity: 0.9, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ ...S.btnW, transition: "background 0.2s, border-color 0.2s" }}
    >
      View Projects <ChevronRight style={{ width: 14, height: 14 }} />
    </motion.button>
  );
}

/* ── Contact Me — minimal interaction ────────────────────────────────────── */
function ContactBtn({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.28)", scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ ...S.btnG, transition: "background 0.2s, border-color 0.2s" }}
    >
      <span>Contact Me</span>
      <Mail style={{ width: 13, height: 13 }} />
    </motion.button>
  );
}

/* ── Resume — minimal interaction ────────────────────────────────────────── */
function ResumeBtn({ onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.95 }}
      onClick={onOpen}
      animate={hovered ? { background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.30)" } : {}}
      style={{ ...S.btnG, position: "relative" }}
    >
      <motion.span
        animate={hovered
          ? { y: [0, 4, 0], transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" } }
          : { y: 0 }}
        style={{ display: "flex" }}
      >
        <Download style={{ width: 13, height: 13 }} />
      </motion.span>
      <span>Resume</span>
      {/* Underline progress bar */}
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: "absolute", bottom: 6, left: "20%", right: "20%", height: 1, background: "rgba(255,255,255,0.4)", transformOrigin: "left", borderRadius: 999 }}
      />
    </motion.button>
  );
}

/* ── ResumeModal — full-screen interactive resume image viewer ──────────────── */
function ResumeModal({ onClose }) {
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  const handleZoomIn = () => setScale(prev => Math.min(2.5, prev + 0.25));
  const handleZoomOut = () => setScale(prev => Math.max(1, prev - 0.25));

  return (
    <motion.div
      id="resume-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(5, 5, 5, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Subtle background gradient behind modal */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />

      {/* Sticky Header Control Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10, 10, 10, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Left: Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 14 }}>📄</span>
          </div>
          <div className="hidden sm:block">
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>Vishalraj TSR — Resume</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Interactive Viewer</div>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)" }}>
          <motion.button
            onClick={handleZoomOut}
            disabled={scale === 1}
            whileHover={scale > 1 ? { scale: 1.05, background: "rgba(255,255,255,0.08)" } : {}}
            whileTap={scale > 1 ? { scale: 0.95 } : {}}
            style={{
              background: "transparent",
              border: "none",
              color: scale === 1 ? "rgba(255,255,255,0.2)" : "#f0f0f0",
              cursor: scale === 1 ? "not-allowed" : "pointer",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Zoom Out"
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </motion.button>

          <span style={{ color: "#f0f0f0", fontSize: 11.5, fontFamily: "monospace", minWidth: 42, textAlign: "center", fontWeight: 600 }}>
            {Math.round(scale * 100)}%
          </span>

          <motion.button
            onClick={handleZoomIn}
            disabled={scale === 2.5}
            whileHover={scale < 2.5 ? { scale: 1.05, background: "rgba(255,255,255,0.08)" } : {}}
            whileTap={scale < 2.5 ? { scale: 0.95 } : {}}
            style={{
              background: "transparent",
              border: "none",
              color: scale === 2.5 ? "rgba(255,255,255,0.2)" : "#f0f0f0",
              cursor: scale === 2.5 ? "not-allowed" : "pointer",
              padding: 6,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Zoom In"
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </motion.button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <motion.a
            href={RESUME_IMAGE_URL}
            download="Vishalraj_TSR_Resume.png"
            whileHover={{ background: "#ffffff", color: "#0a0a0a", scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              borderRadius: 9999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#f0f0f0",
              padding: "7px 16px",
              fontSize: 11.5,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              transition: "background 0.2s, color 0.2s"
            }}
          >
            <Download style={{ width: 12, height: 12 }} />
            <span className="hidden xs:inline">Download</span>
          </motion.a>

          <CloseBtn onClick={onClose} />
        </div>
      </div>

      {/* Viewer Body (Scrollable container) */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px 16px 48px",
          display: "flex",
          justifyContent: "center",
          alignItems: scale > 1 ? "flex-start" : "center",
          position: "relative",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{
            width: "100%",
            maxWidth: `${800 * scale}px`,
            transition: "max-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative",
          }}
        >
          {/* Animated loading shimmer */}
          {loading && (
            <div
              className="animate-pulse"
              style={{
                width: "100%",
                height: "min(75vh, 1000px)",
                borderRadius: "16px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite linear",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.4)" }}>
                <Sparkles className="animate-spin" style={{ width: 16, height: 16 }} />
                <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "monospace" }}>LOADING RESUME...</span>
              </div>
            </div>
          )}

          {/* Shimmer animation CSS (injected if not present) */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            .hidden { display: none !important; }
            @media (min-width: 640px) {
              .hidden.sm\\:block { display: block !important; }
            }
            @media (max-width: 480px) {
              .hidden.xs\\:inline { display: none !important; }
            }
          `}</style>

          {/* Resume Image */}
          <img
            src={RESUME_IMAGE_URL}
            alt="Vishalraj TSR Resume"
            decoding="async"
            onLoad={() => setLoading(false)}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 30px 70px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.15)",
              display: loading ? "none" : "block",
              background: "#111",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── CloseBtn — rotate + glow ring on hover, spin on click ─────────────────── */
function CloseBtn({ onClick, style: extraStyle = {} }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const { setRef, x, y, onMove, onLeave } = useMagnetic(0.45);

  function handleClick() {
    setClicked(true);
    setTimeout(() => { setClicked(false); onClick(); }, 320);
  }

  return (
    <motion.button
      ref={setRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); onLeave(); }}
      onClick={handleClick}
      whileTap={{ scale: 0.88 }}
      animate={{
        scale: hovered ? 1.12 : 1,
        background: hovered ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.08)",
        borderColor: hovered ? "rgba(239,68,68,0.50)" : "rgba(255,255,255,0.18)",
      }}
      style={{
        position: "relative",
        width: 36, height: 36, borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: hovered ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.7)",
        flexShrink: 0,
        x, y,
        ...extraStyle,
      }}
    >
      {/* Expanding glow ring on hover */}
      {hovered && (
        <motion.span
          initial={{ scale: 0.7, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid rgba(239,68,68,0.5)", pointerEvents: "none" }}
        />
      )}
      {/* X icon — rotates 135° on hover, full spin on click */}
      <motion.span
        animate={{ rotate: clicked ? 360 : hovered ? 135 : 0 }}
        transition={clicked
          ? { duration: 0.32, ease: "easeInOut" }
          : { type: "spring", stiffness: 260, damping: 18 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <X style={{ width: 15, height: 15 }} />
      </motion.span>
    </motion.button>
  );
}
/* ── MagSendBtn — Send Email with minimal interaction ──────────────────────────── */
function MagSendBtn() {
  return (
    <motion.button
      whileHover={{ opacity: 0.9, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openExternalUrl("https://mail.google.com/mail/?view=cm&to=vkkmmg22@gmail.com")}
      style={{ ...S.btnW }}
    >
      <Mail style={{ width: 13, height: 13 }} /> Send Email
    </motion.button>
  );
}

/* ── MagSocialPill — social link pill with minimal interaction ─────────────────── */
function MagSocialPill({ label, href }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.08)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.11)",
        background: "rgba(255,255,255,0.05)", padding: "6px 15px",
        fontSize: 11, color: T.textSub, cursor: "pointer",
        textDecoration: "none", display: "inline-block",
        transition: "background 0.15s, border-color 0.15s"
      }}
    >
      style={{ ...S.btnW }}
    >
      <Mail style={{ width: 13, height: 13 }} /> Send Email
    </motion.button>
  );
}

/* ── MagSocialPill — social link pill with minimal interaction ─────────────────── */
function MagSocialPill({ label, href }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.08)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.11)",
        background: "rgba(255,255,255,0.05)", padding: "6px 15px",
        fontSize: 11, color: T.textSub, cursor: "pointer",
        textDecoration: "none", display: "inline-block",
        transition: "background 0.15s, border-color 0.15s"
      }}
    >
      {label}
    </motion.a>
  );
}

/* ─── NEW POLISH COMPONENTS ──────────────────────────────────────────────────── */
function NoiseFilter() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, opacity: 0.035, mixBlendMode: "overlay",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
    }} />
  );
}

function TechMarquee({ onClick }) {
  return (
    <motion.div onClick={onClick} whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.99 }} style={{ cursor: "pointer", position: "relative", zIndex: 10 }}>
      <div style={{ overflow: "hidden", whiteSpace: "nowrap", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.012)", padding: "16px 0", marginTop: 50, marginBottom: 10 }}>
        <div style={{ display: "inline-flex", width: "max-content", animation: "marquee 45s linear infinite" }}>
          {[...TECH_MARQUEE_ITEMS, ...TECH_MARQUEE_ITEMS].map((tech, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: T.textSub, letterSpacing: "0.08em" }}>{tech}</span>
              <span style={{ color: "rgba(255,255,255,0.08)", marginLeft: 48 }}>✦</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── SECTION HEADER ─────────────────────────────────────────────────────────── */
function SectionHeader({ sub, title, headingId }) {
  return (
    <ScrollReveal y={14} style={{ textAlign: "center", marginBottom: 36 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>{sub}</div>
      <h2 id={headingId} style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
      <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.3)", margin: "14px auto 0" }} />
    </ScrollReveal>
  );
}

/* ─── PORTFOLIO ──────────────────────────────────────────────────────────────── */
export default function VishalrajPortfolio() {
  const [activeNav, setActiveNav] = useState("Home");
  const [selProject, setSelProject] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [now, setNow] = useState(new Date());
  const dockMouseX = useMotionValue(Infinity);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const rafScrollRef = useRef(null);
  const rafNavRef = useRef(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLiveDemoToast, setShowLiveDemoToast] = useState(false);
  const [greeting] = useState(getTimeGreeting);

  // Dynamic favicon based on active section
  useDynamicFavicon(activeNav);

  // Konami code → confetti
  useKonamiCode(useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []));

  // Show Live Demo toast on page load, auto-dismiss after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowLiveDemoToast(true), 1200);
    const d = setTimeout(() => setShowLiveDemoToast(false), 7500);
    return () => { clearTimeout(t); clearTimeout(d); };
  }, []);

  // Terminal toggle on Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
      if (e.key === 'Escape' && showTerminal) setShowTerminal(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showTerminal]);

  // Global subtle click sound — uses shared AudioContext singleton
  useEffect(() => {
    const playTick = () => {
      try {
        const ctx = getAudioCtx();
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch {
        return;
      }
    };
    window.addEventListener("mousedown", playTick);
    return () => window.removeEventListener("mousedown", playTick);
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      // RAF-throttle: only process once per animation frame
      if (rafScrollRef.current) return;
      rafScrollRef.current = requestAnimationFrame(() => {
        rafScrollRef.current = null;
        const currentScrollY = window.scrollY;
        setIsScrollingDown(currentScrollY > lastScrollY.current && currentScrollY > 50);
        lastScrollY.current = currentScrollY;
      });

      // Scroll Spy — throttled separately
      if (rafNavRef.current) return;
      rafNavRef.current = requestAnimationFrame(() => {
        rafNavRef.current = null;
        const sections = ["home", "skills", "projects", "education", "contact"];
        let current = "Home";
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight * 0.2) {
              current = section.charAt(0).toUpperCase() + section.slice(1);
            }
          }
        }
        setActiveNav(current);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      if (rafScrollRef.current) cancelAnimationFrame(rafScrollRef.current);
      if (rafNavRef.current) cancelAnimationFrame(rafNavRef.current);
    };
  }, []);

  function scrollTo(id) {
    setActiveNav(id);
    const el = document.getElementById(id.toLowerCase());
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const dockItems = [
    { icon: Home, label: "Home", action: () => scrollTo("Home") },
    { icon: Sparkles, label: "Projects", action: () => scrollTo("Projects") },
    { icon: BookOpen, label: "Education", action: () => scrollTo("Education") },
    { icon: Mail, label: "Contact", action: () => scrollTo("Contact") },
  ];

  return (
    <div
      onMouseMove={e => {
        mouseX.set((e.clientX / window.innerWidth) * 80);
        mouseY.set((e.clientY / window.innerHeight) * 60);
      }}
      style={{ minHeight: "100vh", background: T.bg, color: T.textPrimary, overflowX: "hidden", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;700;800;900&display=swap');
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-50%); } }
        * { box-sizing: border-box; }
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; background: #0a0a0a; }
        ::placeholder { color: rgba(255,255,255,0.22); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }
        button:focus { outline: none; }
        input:focus { outline: none; }
        @media (max-width: 900px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
          .mobile-hero-card { padding: 24px !important; }
          .mobile-nav { flex-direction: column !important; gap: 16px !important; padding: 12px 12px 0 12px !important; }
          .mobile-nav-logo { justify-content: center !important; width: 100% !important; margin-bottom: 6px; }
          .mobile-stats { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
        .mobile-nav-scroll {
          overflow-x: auto;
          max-width: 100vw;
          padding-bottom: 12px !important;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .mobile-nav-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 420px) {
          .nav-btn { font-size: 11.5px !important; padding: 6px 14px !important; }
        }
      `}</style>

      <NoiseFilter />
      <ScrollProgress />
      <AmbientOrbs mouseX={mouseX} mouseY={mouseY} />

      {/* Subtle grid */}
      <div style={{
        pointerEvents: "none", position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      }} />

      {/* ══════════ HEADER NAVBAR ══════════ */}
      <header
        role="banner"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(10, 10, 10, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          width: "100%",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div 
            onClick={() => scrollTo("Home")}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: T.textPrimary,
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            VISHALRAJ <span style={{ color: "rgba(255, 255, 255, 0.35)", fontWeight: 900 }}>TSR</span>
          </div>

          {/* Navigation Links - Desktop Only */}
          {!isMobile && (
            <nav aria-label="Main navigation" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <NavLinks NAV={NAV} activeNav={activeNav} scrollTo={scrollTo} />
            </nav>
          )}

          {/* Resume Button */}
          <div>
            <motion.button
              onClick={() => setShowResume(true)}
              whileHover={{ scale: 1.04, background: "#ffffff", color: "#0a0a0a", borderColor: "#ffffff" }}
              whileTap={{ scale: 0.96 }}
              style={{
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.06)",
                color: T.textPrimary,
                padding: "7px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                transition: "background 0.2s, color 0.2s, border-color 0.2s"
              }}
            >
              <Sparkles style={{ width: 12, height: 12 }} />
              <span>Resume</span>
            </motion.button>
          </div>
        </div>
      </header>

      <main role="main" style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>



        {/* ══════════ HERO ══════════ */}
        <section id="home" className="responsive-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.85fr)", marginBottom: 6 }}>
          {/* Main hero card */}
          <GlassCard hover={false} className="mobile-hero-card" style={{ padding: "36px 40px" }}>
            {/* Time-aware greeting */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              style={{ fontSize: 12, color: T.textMuted, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{greeting.emoji}</span> {greeting.text} — thanks for visiting.
            </motion.div>

            {/* Available badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.10)" }}
              whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.06)", padding: "5px 14px", fontSize: 11, color: T.textSub, marginBottom: 28, cursor: "default", transition: "background 0.2s, border-color 0.2s" }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.white, animation: "pulse-dot 2s infinite" }} />
              Available for collaboration
            </motion.div>

            {/* Profile row */}
            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Profile photo — click to enlarge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                whileHover={{ scale: 1.06 }}
                onClick={() => setShowPhoto(true)}
                style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}
                title="Click to enlarge"
              >
                {/* Spinning ring */}
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                  style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "1.5px dashed rgba(255,255,255,0.14)" }} />
                <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.22)", boxShadow: "0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.20)", position: "relative" }}>
                  <img src="/profile.jpg" alt="Vishalraj TSR" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(10%) contrast(1.05)" }} />
                  {/* Glass sheen overlay */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.10) 100%)", pointerEvents: "none" }} />
                  {/* Hover hint overlay */}
                  <motion.div whileHover={{ opacity: 1 }} initial={{ opacity: 0 }}
                    style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: 600, letterSpacing: "0.05em" }}>
                    VIEW
                  </motion.div>
                </div>
                <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)" }} />
              </motion.div>

              {/* Name + bio */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} style={{ flex: 1, minWidth: 200 }}>
                <h1 
                  onClick={() => setShowTerminal(true)}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: T.textPrimary, cursor: "pointer" }}
                  title="Open Terminal (Ctrl+K)"
                >
                  VISHALRAJ <span style={{ color: "rgba(255,255,255,0.32)" }}>TSR</span>
                  <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", borderWidth: 0 }}>
                    — Full Stack Developer &amp; Data Analyst
                  </span>
                </h1>
                <div style={{ marginTop: 10, fontSize: 13, minHeight: 20 }}>
                  <TypingText strings={TYPED} />
                </div>
                <p style={{ marginTop: 10, fontSize: 13, color: T.textMuted, lineHeight: 1.7, maxWidth: 420, margin: "10px 0 0" }}>
                  MCA student at SRM IST building full-stack apps and data analysis tools. I ship real projects while I study — because waiting to graduate is overrated.
                </p>
                <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 10 }}>

                  {/* ── View Projects: shimmer sweep + arrow flies right on hover ── */}
                  <ViewProjectsBtn onClick={() => scrollTo("Projects")} />

                  {/* ── Contact Me: ripple pulse ring on click ── */}
                  <ContactBtn onClick={() => scrollTo("Contact")} />

                  {/* ── Resume: download arrow bounces down on hover ── */}
                  <ResumeBtn onOpen={() => setShowResume(true)} />

                </div>
              </motion.div>
            </div>

            {/* Stats — animated counters */}
            <motion.div className="mobile-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[{ v: 4, suffix: "+", l: "Projects" }, { v: "Full-Stack", l: "Focus" }, { v: 12, suffix: "+", l: "Technologies" }, { v: "Open", l: "Status" }].map(s => (
                <div key={s.l} style={{ borderRadius: T.radiusSm, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>
                    {typeof s.v === 'number' ? <AnimatedCounter value={s.v} suffix={s.suffix || ""} /> : s.v}
                  </div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </GlassCard>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Snapshot */}
            <GlassCard style={{ padding: 20, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary }}>Profile Snapshot</span>
                <User style={{ width: 13, height: 13, color: T.textMuted }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Full-stack web apps — React, Node, Firebase", "Data analysis and visualization tools", "IoT, hardware, and python automation", "UI/UX design with Figma and motion design"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7, borderRadius: T.radiusSm, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", padding: "8px 11px", fontSize: 11, color: T.textSub, lineHeight: 1.5 }}>
                    <ChevronRight style={{ width: 11, height: 11, color: T.textMuted, flexShrink: 0, marginTop: 1 }} />
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Live status */}
            <GlassCard style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>Live Status</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace", marginTop: 2 }}>
                    {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </div>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: T.white, display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              </div>
              <div style={{ borderRadius: T.radiusSm, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>Chennai, Tamil Nadu 📍</div>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                  Open to roles, internships & freelance — full-stack, data, or anything that ships fast.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

        <TechMarquee onClick={() => setShowTools(true)} />

        {/* ══════════ SKILLS ══════════ */}
        <section id="skills" aria-labelledby="skills-heading" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Technical Proficiency" title="Core Competencies" headingId="skills-heading" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
            {SKILLS.map((sk, i) => {
              const Icon = sk.icon;
              return (
                <ScrollReveal key={sk.title} y={16} delay={i * 0.06}>
                  <GlassCard style={{ padding: 24, textAlign: "center", height: "100%" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 16, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <Icon style={{ width: 20, height: 20, color: T.textPrimary }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, margin: "0 0 7px" }}>{sk.title}</h3>
                    <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, margin: "0 0 14px" }}>{sk.desc}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5 }}>
                      {sk.items.map(item => <Tag key={item}>{item}</Tag>)}
                    </div>
                  </GlassCard>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* ══════════ PROJECTS ══════════ */}
        <section id="projects" aria-labelledby="projects-heading" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Applied Knowledge" title="Academic / Featured Projects" headingId="projects-heading" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {PROJECTS.map((p, i) => (
              <ScrollReveal key={p.id} y={16} delay={i * 0.05}>
                <GlassCard onClick={() => setSelProject(p)} style={{ padding: 24, cursor: "pointer", height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "inline-flex", borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", fontSize: 10, color: T.textSub }}>
                      {p.type}
                    </div>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{p.title}</h3>
                  <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.65, margin: "0 0 14px" }}>{p.summary}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                    {p.stack.slice(0, 3).map(item => <Tag key={item}>{item}</Tag>)}
                    {p.stack.length > 3 && <Tag>+{p.stack.length - 3}</Tag>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textMuted }}>
                    View Impact <ChevronRight style={{ width: 11, height: 11 }} />
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ══════════ EDUCATION ══════════ */}
        <section id="education" aria-labelledby="education-heading" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Academic Foundation" title="Education" headingId="education-heading" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EDUCATION.map((e, i) => (
              <ScrollReveal key={e.degree} y={12} delay={i * 0.07}>
                <GlassCard style={{ padding: 20 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1, minWidth: 220 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, border: "1px solid rgba(255,255,255,0.11)", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <GraduationCap style={{ width: 18, height: 18, color: T.textPrimary }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{e.degree}</div>
                        <div style={{ fontSize: 12, color: T.textSub, marginTop: 3 }}>{e.school}</div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 5, lineHeight: 1.5 }}>{e.meta}</div>
                      </div>
                    </div>
                    <div style={{ borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.05)", padding: "5px 14px", fontSize: 11, color: T.textSub, flexShrink: 0 }}>
                      {e.year}
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ══════════ CONTACT ══════════ */}
        <section id="contact" aria-labelledby="contact-heading" style={{ paddingTop: 72, paddingBottom: 130 }}>
          <ScrollReveal y={16}>
            <GlassCard hover={false} className="mobile-hero-card" style={{ padding: "44px 48px" }}>
              <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr)", gap: 32 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Contact</div>
                  <h2 id="contact-heading" style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.2 }}>
                    Let's build something<br />together
                  </h2>
                  <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, maxWidth: 400, margin: "0 0 24px" }}>
                    Actively looking for full-time roles, internships, and freelance work — full-stack, data analysis, or anything exciting. If you're hiring or just want to connect, reach out.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    <MagSendBtn />
                    <ResumeBtn onOpen={() => setShowResume(true)} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { label: "LinkedIn", href: "https://www.linkedin.com/in/tsr-vishalraj-256106401" },
                      { label: "GitHub", href: "https://github.com/viixhal" },
                      { label: "Email", href: "https://mail.google.com/mail/?view=cm&to=vkkmmg22@gmail.com" },
                    ].map(pl => (
                      <MagSocialPill key={pl.label} label={pl.label} href={pl.href} />
                    ))}
                  </div>
                </div>

                <div style={{ borderRadius: T.radius, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 22 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 14 }}>Quick contact card</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[
                      { l: "Email", v: "vkkmmg22@gmail.com", href: "https://mail.google.com/mail/?view=cm&to=vkkmmg22@gmail.com" },
                      { l: "Location", v: "Chennai, TN", href: null },
                      { l: "Role", v: "Full Stack · Data Analyst", href: null },
                      { l: "Availability", v: "Immediate", href: null },
                    ].map(row => (
                      <div key={row.l}
                        onClick={() => openExternalUrl(row.href)}
                        style={{ borderRadius: T.radiusSm, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", padding: "9px 12px", cursor: row.href ? "pointer" : "default", transition: "background 0.15s" }}
                        onMouseEnter={e => { if (row.href) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                        onMouseLeave={e => { if (row.href) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                      >
                        <div style={{ fontSize: 10, color: T.textMuted }}>{row.l}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: row.href ? T.textPrimary : T.textPrimary, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                          {row.v}
                          {row.href && <Mail style={{ width: 10, height: 10, color: T.textMuted }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </section>

        {/* ══════════ LIVE DEMO BANNER ══════════ */}
        <LiveDemoBanner onViewDemo={() => {
          const p = PROJECTS.find(pr => pr.demoLink);
          if (p) setSelProject(p);
        }} />

      {/* ══════════ FOOTER ══════════ */}
        <footer role="contentinfo" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", textAlign: "center" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
              <a href="https://www.linkedin.com/in/tsr-vishalraj-256106401" target="_blank" rel="noopener noreferrer" style={{ color: T.textMuted, fontSize: 12, textDecoration: "none" }}>LinkedIn</a>
              <a href="https://github.com/viixhal" target="_blank" rel="noopener noreferrer" style={{ color: T.textMuted, fontSize: 12, textDecoration: "none" }}>GitHub</a>
              <a href="mailto:vkkmmg22@gmail.com" style={{ color: T.textMuted, fontSize: 12, textDecoration: "none" }}>Email</a>
            </div>
            <p style={{ color: T.textMuted, fontSize: 11, margin: 0, lineHeight: 1.6 }}>
              © {new Date().getFullYear()} Vishalraj TSR. Full Stack Developer & Data Analyst based in Chennai, India.
            </p>
          </div>
        </footer>
      </main>

      {/* ══════════ PROJECT MODAL ══════════ */}
      <AnimatePresence>
        {selProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.70)", padding: 16, backdropFilter: "blur(16px)" }}
            onClick={() => setSelProject(null)}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 580, borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.13)", background: T.modalBg, boxShadow: "0 30px 100px rgba(0,0,0,0.85)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", padding: "32px 36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 34, marginBottom: 10 }}>{selProject.icon}</div>
                    <div style={{ display: "inline-flex", borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.07)", padding: "4px 12px", fontSize: 10, color: T.textSub }}>
                      {selProject.type}
                    </div>
                  </div>
                  <CloseBtn onClick={() => setSelProject(null)} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, margin: "0 0 10px", letterSpacing: "-0.02em" }}>{selProject.title}</h3>
                <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.65, margin: "0 0 8px" }}>{selProject.summary}</p>
                <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.65, margin: "0 0 16px" }}>{selProject.details}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                  {selProject.stack.map(item => <Tag key={item}>{item}</Tag>)}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={{ ...S.btnW, opacity: selProject.demoLink ? 1 : 0.45, cursor: selProject.demoLink ? "pointer" : "not-allowed" }} onClick={() => openExternalUrl(selProject.demoLink)} disabled={!selProject.demoLink}><ArrowUpRight style={{ width: 13, height: 13 }} /> Live Demo</button>
                  <button style={{ ...S.btnG, opacity: selProject.sourceLink ? 1 : 0.45, cursor: selProject.sourceLink ? "pointer" : "not-allowed" }} onClick={() => openExternalUrl(selProject.sourceLink)} disabled={!selProject.sourceLink}><ExternalLink style={{ width: 13, height: 13 }} /> Source Code</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ TOOLS MODAL ══════════ */}
      <AnimatePresence>
        {showTools && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.70)", padding: 16, backdropFilter: "blur(16px)" }}
            onClick={() => setShowTools(false)}>
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
              style={{ width: "100%", maxWidth: 680, borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.13)", background: T.modalBg, boxShadow: "0 30px 100px rgba(0,0,0,0.85)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", padding: "32px 36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ display: "inline-flex", borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.07)", padding: "4px 12px", fontSize: 10, color: T.textSub, marginBottom: 8 }}>
                      Tech Stack & Ecosystem
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 700, color: T.textPrimary, margin: "0 0 10px", letterSpacing: "-0.01em" }}>APPLICATIONS / TOOLS</h3>
                  </div>
                  <CloseBtn onClick={() => setShowTools(false)} />
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
                  {TECH_MARQUEE_ITEMS.map(item => (
                    <span key={item} style={{ padding: "8px 16px", borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, letterSpacing: "0.05em" }}>{item}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ PHOTO LIGHTBOX ══════════ */}
      <AnimatePresence>
        {showPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPhoto(false)}
            style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.80)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
            >
              {/* Close button */}
              <CloseBtn onClick={() => setShowPhoto(false)} style={{ position: "absolute", top: -16, right: -16, zIndex: 10 }} />

              {/* Enlarged photo */}
              <div style={{ position: "relative", borderRadius: "2rem", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.18)", boxShadow: "0 40px 120px rgba(0,0,0,0.90), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                <img
                  src="/profile.jpg"
                  alt="Vishalraj TSR"
                  loading="lazy"
                  decoding="async"
                  style={{ display: "block", width: "min(80vw, 460px)", height: "min(80vw, 520px)", objectFit: "cover", objectPosition: "center top" }}
                />
                {/* Glass sheen */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 45%)", pointerEvents: "none" }} />
              </div>

              {/* Name card below photo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ textAlign: "center", borderRadius: T.radius, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", padding: "14px 32px" }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, letterSpacing: "0.02em" }}>Vishalraj TSR</div>
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Full Stack · Data Analyst</div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ DOCK ══════════ */}
      <div
        style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 150, willChange: "transform" }}
        onMouseMove={e => dockMouseX.set(e.clientX)}
        onMouseLeave={() => dockMouseX.set(Infinity)}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isScrollingDown ? 150 : 0, opacity: isScrollingDown ? 0 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
            borderRadius: T.pill,
            padding: "10px 16px",
            position: "relative",
            /* Liquid glass layers */
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(48px) saturate(180%)",
            WebkitBackdropFilter: "blur(48px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: [
              "0 8px 32px rgba(0,0,0,0.40)",
              "0 2px 8px rgba(0,0,0,0.25)",
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -1px 0 rgba(255,255,255,0.08)",
            ].join(", "),
          }}
        >
          {/* Top specular highlight */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: "50%",
            borderRadius: "9999px 9999px 0 0",
            background: "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />
          {/* Subtle inner glow at bottom */}
          <div style={{
            position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1,
            background: "rgba(255,255,255,0.10)",
            pointerEvents: "none",
          }} />
          {dockItems.map(item => (
            <DockIcon key={item.label} mouseX={dockMouseX} icon={item.icon} action={item.action} label={item.label} isActive={activeNav === item.label} isMobile={isMobile} />
          ))}
        </motion.div>
      </div>

      {/* ══════════ OVERLAYS ══════════ */}
      <AnimatePresence>
        {showTerminal && <TerminalOverlay show={true} onClose={() => setShowTerminal(false)} scrollTo={scrollTo} />}
        {showResume && <ResumeModal onClose={() => setShowResume(false)} />}
      </AnimatePresence>
      <ConfettiExplosion show={showConfetti} />

      {/* ══════════ LIVE DEMO TOAST ══════════ */}
      <LiveDemoToast show={showLiveDemoToast} onClose={() => setShowLiveDemoToast(false)} />
    </div>
  );
}
