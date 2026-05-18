import { useEffect, useState } from "react";

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    console.log("SplashScreen active — will dismiss in ~1.7s");
    const fadeTimer = window.setTimeout(() => setFading(true), 1300);
    const doneTimer = window.setTimeout(() => onDone(), 1700);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`splash-screen${fading ? " splash-screen--out" : ""}`}>
      <div className="splash-logo">
        <span className="splash-logo__skills">SKILLS</span>
        <span className="splash-logo__bet">BET</span>
      </div>
      <div className="splash-tagline">GAMING · COMPÉTENCE · VICTOIRE</div>
    </div>
  );
}
