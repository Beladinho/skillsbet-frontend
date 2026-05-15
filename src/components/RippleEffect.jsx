import { useEffect } from "react";

export default function RippleEffect() {
  useEffect(() => {
    function handleClick(e) {
      const btn = e.target.closest("button");
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(wave);
      setTimeout(() => wave.remove(), 700);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  return null;
}
