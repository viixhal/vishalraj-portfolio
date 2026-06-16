import { useEffect } from "react";

const SECTION_FAVICONS = { Home: "🏠", Skills: "⚡", Projects: "💼", Education: "🎓", Contact: "✉️" };

export function useDynamicFavicon(activeSection) {
  useEffect(() => {
    const emoji = SECTION_FAVICONS[activeSection] || SECTION_FAVICONS.Home;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");
    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 16, 18);

    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = canvas.toDataURL();
  }, [activeSection]);
}
