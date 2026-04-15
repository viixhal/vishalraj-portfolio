import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import {
  ArrowUpRight, Blocks, BookOpen, Briefcase, Code2, Download,
  ExternalLink, FolderKanban, GraduationCap, Home, Mail, Menu,
  Search, Sparkles, User, X, ChevronRight,
} from "lucide-react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────────────────────── */
const T = {
  bg: "#0a0a0a",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.10)",
  navBg: "rgba(10,10,10,0.80)",
  white: "#ffffff",
  textPrimary: "#f0f0f0",
  textSub: "#9a9a9a",
  textMuted: "#5a5a5a",
  tagBg: "rgba(255,255,255,0.07)",
  tagBorder: "rgba(255,255,255,0.13)",
  dockBg: "rgba(8,8,8,0.88)",
  modalBg: "#111111",
  btnWBg: "#f0f0f0",
  btnWText: "#0a0a0a",
  radius: "1.6rem",
  radiusSm: "0.85rem",
  pill: "9999px",
};

const S = {
  card: {
    borderRadius: T.radius,
    border: `1px solid ${T.cardBorder}`,
    background: T.card,
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.09)",
    position: "relative",
    overflow: "hidden",
  },
  tag: {
    borderRadius: T.pill,
    border: `1px solid ${T.tagBorder}`,
    background: T.tagBg,
    padding: "3px 11px",
    fontSize: 11,
    color: T.textSub,
    display: "inline-block",
  },
  btnW: {
    borderRadius: T.pill,
    background: T.btnWBg,
    color: T.btnWText,
    border: "none",
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
  },
  btnG: {
    borderRadius: T.pill,
    border: "1px solid rgba(255,255,255,0.17)",
    background: "rgba(255,255,255,0.07)",
    color: T.textPrimary,
    padding: "10px 22px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    backdropFilter: "blur(10px)",
  },
};

/* ─── SCROLL BAR ─────────────────────────────────────────────────────────────── */
function ScrollProgress() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      setProg((el.scrollTop / (el.scrollHeight - el.clientHeight)) || 0);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <motion.div style={{ scaleX: prog, transformOrigin: "left", position: "fixed", top: 0, left: 0, right: 0, height: 2, background: T.white, zIndex: 9999 }} />
  );
}

/* ─── TYPEWRITER ─────────────────────────────────────────────────────────────── */
function TypingText({ strings, speed = 58, pause = 2200 }) {
  const [txt, setTxt] = useState("");
  const [si, setSi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const cur = strings[si];
    let t;
    if (!del && ci < cur.length) t = setTimeout(() => setCi(c => c + 1), speed);
    else if (!del && ci === cur.length) t = setTimeout(() => setDel(true), pause);
    else if (del && ci > 0) t = setTimeout(() => setCi(c => c - 1), speed / 2);
    else { setDel(false); setSi(s => (s + 1) % strings.length); }
    setTxt(cur.slice(0, ci));
    return () => clearTimeout(t);
  }, [ci, del, si, strings, speed, pause]);
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

/* ─── useMagnetic hook — cursor pulls the element toward itself ─────────────── */
function useMagnetic(strength = 0.38) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 16, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 160, damping: 16, mass: 0.5 });
  function onMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function onLeave() { x.set(0); y.set(0); }
  return { ref, sx, sy, onMove, onLeave };
}

/* ─── DOCK ICON ──────────────────────────────────────────────────────────────── */
function DockIcon({ mouseX, icon: Icon, action, label }) {
  const ref = useRef(null);
  const distance = useTransform(mouseX, val => {
    const b = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - b.x - b.width / 2;
  });
  const size = useSpring(useTransform(distance, [-80, 0, 80], [34, 54, 34]), { mass: 0.06, stiffness: 200, damping: 12 });
  const yOff = useSpring(useTransform(distance, [-80, 0, 80], [0, -12, 0]), { mass: 0.06, stiffness: 200, damping: 12 });
  const mag = useMagnetic(0.30);
  return (
    <motion.button
      ref={(el) => { ref.current = el; mag.ref.current = el; }}
      onClick={action}
      title={label}
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      whileTap={{ scale: 0.88 }}
      whileHover={{ background: "rgba(255,255,255,0.18)" }}
      style={{
        width: size, height: size, y: yOff, x: mag.sx, flexShrink: 0,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.22)",
        background: "rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Specular sheen */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: "50% 50% 0 0", background: "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)", pointerEvents: "none" }} />
      <Icon style={{ width: "38%", height: "38%", color: "rgba(255,255,255,0.9)", position: "relative" }} />
    </motion.button>
  );
}

/* ─── AMBIENT ORBS ───────────────────────────────────────────────────────────── */
function AmbientOrbs({ mouse }) {
  const orbs = [
    { top: -100, left: -100, size: 500, op: 0.055, dx: 1.5, dy: 1.0 },
    { top: "25%", right: -120, size: 380, op: 0.04, dx: -1.1, dy: 0.7 },
    { bottom: 0, left: "35%", size: 340, op: 0.035, dx: 0.7, dy: -0.5 },
  ];
  return (
    <div style={{ pointerEvents: "none", position: "fixed", inset: 0, overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <motion.div key={i}
          animate={{ x: mouse.x * o.dx, y: mouse.y * o.dy }}
          transition={{ type: "spring", stiffness: 38, damping: 22 }}
          style={{ position: "absolute", top: o.top, bottom: o.bottom, left: o.left, right: o.right, width: o.size, height: o.size, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${o.op}) 0%, transparent 70%)` }}
        />
      ))}
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

/* ─── DATA ───────────────────────────────────────────────────────────────────── */
const TYPED = [
  "Building digital experiences.",
  "Full Stack · Data Analyst.",
  "Turning coffee into clean code.",
  "Open to opportunities — let's build together.",
];

const SKILLS = [
  { title: "Frontend", icon: Code2, items: ["React", "JavaScript", "HTML/CSS", "Figma", "Responsive UI"], desc: "Clean, pixel-perfect interfaces with polished motion design." },
  { title: "Backend & APIs", icon: Briefcase, items: ["Node.js", "Java", "Python", "Express", "Firebase"], desc: "Structured logic, service integration, and full-stack development." },
  { title: "Data & Tools", icon: FolderKanban, items: ["SQL", "MongoDB", "Tableau", "AWS", "Arduino / IoT"], desc: "Data visualisation, cloud basics, and hardware prototyping." },
];

const PROJECTS = [
  { id: 1, type: "Web / Full Stack", icon: "🔗", title: "Payment System", summary: "Payment gateway — no bank, no middleman. Transactions go directly via secure APIs.", stack: ["Node.js", "React", "Stripe", "Express"], details: "Built with secure API integration. Logic handles all payment flow — trustless, transparent, and immutable." },
  { id: 2, type: "Web / E-Commerce", icon: "🛒", title: "E-Commerce Platform", summary: "An online store where all logic lives on the server — no platform fees, no single point of failure.", stack: ["Node.js", "React", "Express", "MongoDB"], details: "Product listings and payments recorded on database. Transparent, verifiable, and tamper-proof by design.", demoLink: "https://aveon.netlify.app" },
  { id: 3, type: "AI / Computer Vision", icon: "🖼️", title: "Image Analyzer", summary: "AI model detecting digitally manipulated or AI-generated images — fighting synthetic misinformation.", stack: ["Python", "Machine Learning", "OpenCV", "Flask"], details: "Identifies statistical anomalies, edge inconsistencies, and compression artifacts typical of GAN-generated or Photoshopped content." },
  { id: 4, type: "IoT / Hardware", icon: "📡", title: "Smart Study Monitor", summary: "Arduino-powered IoT system tracking study environment and focus patterns in real time.", stack: ["Arduino", "Python", "IoT Sensors", "C++"], details: "Ambient light, motion, and proximity sensors detect attention lapses. LED/buzzer alerts and a Python dashboard for session data." },
];

const EDUCATION = [
  { degree: "Master of Computer Applications (MCA)", school: "SRM Institute of Science & Technology — VDP Campus", meta: "Advanced software engineering, system design, and full-stack project-based learning", year: "2024 – 2026 · Current" },
  { degree: "BCA · Cloud Technology & Information Security", school: "B.S. Abdur Rahman Crescent University", meta: "Cloud computing, cybersecurity foundations, and application development", year: "2021 – 2024" },
  { degree: "Higher Secondary · Computer Science", school: "DAV Matriculation Higher Secondary School, Mogappair", meta: "Where it all started — the first program, the first bug, the first breakthrough moment.", year: "Graduated 2021" },
];

const NAV = ["Home", "Skills", "Projects", "Education", "Contact"];

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
          btnRefs={btnRefs}
          onClick={() => scrollTo(item)}
        />
      ))}
    </div>
  );
}

/* ── MagNavBtn — nav item with magnetic pull ────────────────────────────── */
function MagNavBtn({ item, active, btnRefs, onClick }) {
  const mag = useMagnetic(0.28);
  return (
    <motion.button
      className="nav-btn"
      ref={el => { btnRefs.current[item] = el; mag.ref.current = el; }}
      onClick={onClick}
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      style={{
        x: mag.sx, y: mag.sy,
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

/* ── View Projects — shimmer sweep + arrow slides right ──────────────────── */
function ViewProjectsBtn({ onClick }) {
  const [hovered, setHovered] = useState(false);
  const mag = useMagnetic(0.42);
  return (
    <motion.button
      ref={mag.ref}
      onClick={onClick}
      onMouseMove={mag.onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mag.onLeave(); }}
      whileTap={{ scale: 0.95 }}
      style={{ ...S.btnW, position: "relative", overflow: "hidden", x: mag.sx, y: mag.sy }}
    >
      {/* Shimmer sweep */}
      <motion.div
        animate={hovered ? { x: ["−100%", "200%"] } : { x: "-100%" }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
        style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", pointerEvents: "none", transform: "skewX(-15deg)" }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>View Projects</span>
      <motion.span animate={{ x: hovered ? 5 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} style={{ position: "relative", zIndex: 1, display: "flex" }}>
        <ChevronRight style={{ width: 14, height: 14 }} />
      </motion.span>
    </motion.button>
  );
}

/* ── Contact Me — ripple ring fires on click ─────────────────────────────── */
function ContactBtn({ onClick }) {
  const [ripples, setRipples] = useState([]);
  const mag = useMagnetic(0.42);
  function fire() {
    const id = Date.now();
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 700);
    onClick();
  }
  return (
    <motion.button
      ref={mag.ref}
      onClick={fire}
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      whileHover={{ background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.28)" }}
      whileTap={{ scale: 0.95 }}
      style={{ ...S.btnG, position: "relative", overflow: "visible", x: mag.sx, y: mag.sy }}
    >
      {/* Ripple rings */}
      {ripples.map(id => (
        <motion.span key={id}
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, borderRadius: T.pill, border: "1.5px solid rgba(255,255,255,0.55)", pointerEvents: "none" }}
        />
      ))}
      {/* Pulsing dot */}
      <motion.span
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.7)", flexShrink: 0 }}
      />
      <span>Contact Me</span>
      <Mail style={{ width: 13, height: 13 }} />
    </motion.button>
  );
}

/* ── Resume — download arrow bounces down on hover ───────────────────────── */
function ResumeBtn() {
  const [hovered, setHovered] = useState(false);
  const mag = useMagnetic(0.42);
  return (
    <motion.button
      ref={mag.ref}
      onMouseMove={mag.onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mag.onLeave(); }}
      whileTap={{ scale: 0.95 }}
      animate={hovered ? { background: "rgba(255,255,255,0.13)", borderColor: "rgba(255,255,255,0.30)" } : {}}
      style={{ ...S.btnG, position: "relative", x: mag.sx, y: mag.sy }}
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

/* ── CloseBtn — rotate + glow ring on hover, spin on click ─────────────────── */
function CloseBtn({ onClick, style: extraStyle = {} }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const mag = useMagnetic(0.45);

  function handleClick() {
    setClicked(true);
    setTimeout(() => { setClicked(false); onClick(); }, 320);
  }

  return (
    <motion.button
      ref={mag.ref}
      onMouseMove={mag.onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); mag.onLeave(); }}
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
        x: mag.sx, y: mag.sy,
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

/* ── MagSendBtn — Send Email with magnetic pull ──────────────────────────── */
function MagSendBtn() {
  const mag = useMagnetic(0.42);
  return (
    <motion.button
      ref={mag.ref}
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      whileHover={{ opacity: 0.9, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => window.open("https://mail.google.com/mail/?view=cm&to=vkkmmg22@gmail.com", "_blank")}
      style={{ ...S.btnW, x: mag.sx, y: mag.sy }}
    >
      <Mail style={{ width: 13, height: 13 }} /> Send Email
    </motion.button>
  );
}

/* ── MagSocialPill — social link pill with magnetic pull ─────────────────── */
function MagSocialPill({ label, href }) {
  const mag = useMagnetic(0.40);
  return (
    <motion.a
      ref={mag.ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={mag.onMove}
      onMouseLeave={mag.onLeave}
      whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.28)" }}
      whileTap={{ scale: 0.94 }}
      style={{
        borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.11)",
        background: "rgba(255,255,255,0.05)", padding: "6px 15px",
        fontSize: 11, color: T.textSub, cursor: "pointer",
        textDecoration: "none", display: "inline-block",
        x: mag.sx, y: mag.sy,
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

const TECH_MARQUEE_ITEMS = ["REACT", "NODE.JS", "MONGODB", "FIGMA", "TYPESCRIPT", "PYTHON", "AWS", "MACHINE LEARNING", "WEB3.JS", "ARDUINO", "TABLEAU", "POWER BI", "FIREBASE", "KEYLOGGER", "KALI LINUX", "CLOUD FIRESTORE", "SQL", "PL/SQL", "REACT NATIVE", "SWIFT"];

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
function SectionHeader({ sub, title }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} style={{ textAlign: "center", marginBottom: 36 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>{sub}</div>
      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
      <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.3)", margin: "14px auto 0" }} />
    </motion.div>
  );
}

/* ─── PORTFOLIO ──────────────────────────────────────────────────────────────── */
export default function VishalrajPortfolio() {
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Home");
  const [selProject, setSelProject] = useState(null);
  const [showTools, setShowTools] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState(new Date());
  const dockMouseX = useMotionValue(Infinity);

  // Global subtle click sound (Apple/Premium tick)
  useEffect(() => {
    const playTick = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
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
      } catch (e) {
        // Ignore failures, like before the user interacts
      }
    };
    window.addEventListener("mousedown", playTick);
    return () => window.removeEventListener("mousedown", playTick);
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return PROJECTS;
    const q = query.toLowerCase();
    return PROJECTS.filter(p => `${p.title} ${p.summary} ${p.stack.join(" ")}`.toLowerCase().includes(q));
  }, [query]);

  function scrollTo(id) {
    setActiveNav(id); setShowMenu(false);
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
      onMouseMove={e => setMouse({ x: (e.clientX / window.innerWidth) * 80, y: (e.clientY / window.innerHeight) * 60 })}
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
      <AmbientOrbs mouse={mouse} />

      {/* Subtle grid */}
      <div style={{
        pointerEvents: "none", position: "fixed", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px)",
        backgroundSize: "64px 64px"
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "20px 24px" }}>

        {/* ══════════ NAV ══════════ */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ position: "sticky", top: 16, zIndex: 100, marginBottom: 28, borderRadius: T.radius, border: `1px solid rgba(255,255,255,0.10)`, background: T.navBg, backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", padding: "12px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <div className="mobile-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            {/* Logo */}
            <button className="mobile-nav-logo" onClick={() => scrollTo("Home")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <motion.div whileHover={{ scale: 1.07 }}
                style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.22)", overflow: "hidden", flexShrink: 0, boxShadow: "0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.20)" }}>
                <img src="/profile.jpg" alt="Vishalraj" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(15%) contrast(1.05)" }} />
              </motion.div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, letterSpacing: "-0.01em" }}>Vishalraj TSR</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Full Stack · Data Analyst</div>
              </div>
            </button>

            {/* Desktop links — liquid glass cursor-tracking pill */}
            <NavLinks NAV={NAV} activeNav={activeNav} scrollTo={scrollTo} />

          </div>
        </motion.nav>

        {/* ══════════ HERO ══════════ */}
        <section id="home" className="responsive-grid" style={{ display: "grid", gap: 14, gridTemplateColumns: "minmax(0,1.5fr) minmax(0,0.85fr)", marginBottom: 6 }}>
          {/* Main hero card */}
          <GlassCard hover={false} className="mobile-hero-card" style={{ padding: "36px 40px" }}>
            {/* Available badge */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: T.pill, border: "1px solid rgba(255,255,255,0.13)", background: "rgba(255,255,255,0.06)", padding: "5px 14px", fontSize: 11, color: T.textSub, marginBottom: 28 }}>
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
                  <img src="/profile.jpg" alt="Vishalraj TSR" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", filter: "grayscale(10%) contrast(1.05)" }} />
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
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: T.textPrimary }}>
                  VISHALRAJ <span style={{ color: "rgba(255,255,255,0.32)" }}>TSR</span>
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
                  <ResumeBtn />

                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div className="mobile-stats" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[{ v: "4+", l: "Projects" }, { v: "Full-Stack", l: "Focus" }, { v: "12+", l: "Technologies" }, { v: "Open", l: "Status" }].map(s => (
                <div key={s.l} style={{ borderRadius: T.radiusSm, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{s.v}</div>
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
        <section id="skills" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Technical Proficiency" title="Core Competencies" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
            {SKILLS.map((sk, i) => {
              const Icon = sk.icon;
              return (
                <motion.div key={sk.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: i * 0.08 }}>
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
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ══════════ PROJECTS ══════════ */}
        <section id="projects" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Applied Knowledge" title="Academic / Featured Projects" />
          {query && (
            <p style={{ textAlign: "center", fontSize: 12, color: T.textMuted, marginBottom: 20 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: i * 0.07 }}>
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
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════ EDUCATION ══════════ */}
        <section id="education" style={{ paddingTop: 72 }}>
          <SectionHeader sub="Academic Foundation" title="Education" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EDUCATION.map((e, i) => (
              <motion.div key={e.degree} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ delay: i * 0.08 }}>
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
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════ CONTACT ══════════ */}
        <section id="contact" style={{ paddingTop: 72, paddingBottom: 130 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}>
            <GlassCard hover={false} className="mobile-hero-card" style={{ padding: "44px 48px" }}>
              <div className="responsive-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,0.8fr)", gap: 32 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>Contact</div>
                  <h2 style={{ fontSize: "clamp(22px, 3.5vw, 38px)", fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.02em", margin: "0 0 14px", lineHeight: 1.2 }}>
                    Let's build something<br />together
                  </h2>
                  <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, maxWidth: 400, margin: "0 0 24px" }}>
                    Actively looking for full-time roles, internships, and freelance work — full-stack, data analysis, or anything exciting. If you're hiring or just want to connect, reach out.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
                    <MagSendBtn />
                    <ResumeBtn />
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
                        onClick={() => row.href && (window.location.href = row.href)}
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
          </motion.div>
        </section>
      </div>

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
                  <button style={S.btnW} onClick={() => selProject.demoLink && window.open(selProject.demoLink, '_blank')}><ArrowUpRight style={{ width: 13, height: 13 }} /> Live Demo</button>
                  <button style={S.btnG}><ExternalLink style={{ width: 13, height: 13 }} /> Source Code</button>
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
        style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 150 }}
        onMouseMove={e => dockMouseX.set(e.clientX)}
        onMouseLeave={() => dockMouseX.set(Infinity)}
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
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
            <DockIcon key={item.label} mouseX={dockMouseX} icon={item.icon} action={item.action} label={item.label} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
