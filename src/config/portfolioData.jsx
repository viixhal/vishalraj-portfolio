import { Briefcase, Code2, FolderKanban } from "lucide-react";

export const TYPED = [
  "Building digital experiences.",
  "Full Stack · Data Analyst.",
  "Turning coffee into clean code.",
  "Open to opportunities — let's build together.",
];

export const SKILLS = [
  { title: "Frontend", icon: Code2, items: ["React", "JavaScript", "HTML/CSS", "Figma", "Responsive UI"], desc: "Clean, pixel-perfect interfaces with polished motion design." },
  { title: "Backend & APIs", icon: Briefcase, items: ["Node.js", "Java", "Python", "Express", "Firebase"], desc: "Structured logic, service integration, and full-stack development." },
  { title: "Data & Tools", icon: FolderKanban, items: ["SQL", "MongoDB", "Tableau", "AWS", "Arduino / IoT"], desc: "Data visualisation, cloud basics, and hardware prototyping." },
];

export const PROJECTS = [
  { id: 1, type: "Web / Full Stack", icon: "🔗", title: "Payment System", summary: "Payment gateway — no bank, no middleman. Transactions go directly via secure APIs.", stack: ["Node.js", "React", "Stripe", "Express"], details: "Built with secure API integration. Logic handles all payment flow — trustless, transparent, and immutable." },
  { id: 2, type: "Web / E-Commerce", icon: "🛒", title: "E-Commerce Platform", summary: "An online store where all logic lives on the server — no platform fees, no single point of failure.", stack: ["Node.js", "React", "Express", "MongoDB"], details: "Product listings and payments recorded on database. Transparent, verifiable, and tamper-proof by design.", demoLink: "https://aveon.vercel.app/" },
  { id: 3, type: "AI / Computer Vision", icon: "🖼️", title: "Image Analyzer", summary: "AI model detecting digitally manipulated or AI-generated images — fighting synthetic misinformation.", stack: ["Python", "Machine Learning", "OpenCV", "Flask"], details: "Identifies statistical anomalies, edge inconsistencies, and compression artifacts typical of GAN-generated or Photoshopped content." },
  { id: 4, type: "IoT / Hardware", icon: "📡", title: "Smart Study Monitor", summary: "Arduino-powered IoT system tracking study environment and focus patterns in real time.", stack: ["Arduino", "Python", "IoT Sensors", "C++"], details: "Ambient light, motion, and proximity sensors detect attention lapses. LED/buzzer alerts and a Python dashboard for session data." },
];

export const EDUCATION = [
  { degree: "Master of Computer Applications (MCA)", school: "SRM Institute of Science & Technology — VDP Campus", meta: "Advanced software engineering, system design, and full-stack project-based learning", year: "2024-2026 · Current" },
  { degree: "BCA · Cloud Technology & Information Security", school: "B.S. Abdur Rahman Crescent University", meta: "Cloud computing, cybersecurity foundations, and application development", year: "2021-2024" },
  { degree: "Higher Secondary · Computer Science", school: "DAV Matriculation Higher Secondary School, Mogappair", meta: "Where it all started — the first program, the first bug, the first breakthrough moment.", year: "Graduated 2021" },
];

export const NAV = ["Home", "Skills", "Projects", "Education", "Contact"];

export const TECH_MARQUEE_ITEMS = [
  "REACT", "NODE.JS", "MONGODB", "FIGMA", "TYPESCRIPT", "PYTHON", "AWS",
  "WEB3.JS", "ARDUINO", "TABLEAU", "POWER BI", "FIREBASE", "KALI LINUX",
  "CLOUD FIRESTORE", "SQL", "PL/SQL", "REACT NATIVE", "SWIFT",
];
