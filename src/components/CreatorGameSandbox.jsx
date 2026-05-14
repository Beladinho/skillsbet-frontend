import { useEffect, useMemo, useRef } from "react";

export default function CreatorGameSandbox({ code, width = "100%", height = "500px" }) {
  const iframeRef = useRef(null);

  const htmlContent = useMemo(
    () => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Creator Game</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0a0a0a;
      color: #ffffff;
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 16px;
    }
    #root { width: 100%; }
    button {
      cursor: pointer;
      padding: 8px 16px;
      background: rgba(255,107,0,0.15);
      border: 1px solid rgba(255,107,0,0.4);
      color: #ff6b00;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: background 0.15s;
    }
    button:hover { background: rgba(255,107,0,0.28); }
    input, select {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 6px 10px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    try {
      ${code}
      const GameComponent =
        typeof Game !== 'undefined' ? Game :
        typeof App  !== 'undefined' ? App  : null;
      if (GameComponent) {
        ReactDOM.createRoot(document.getElementById('root')).render(
          React.createElement(GameComponent)
        );
      } else {
        document.getElementById('root').innerHTML =
          '<p style="color:#ef4444;padding:32px;text-align:center;font-size:0.9rem">' +
          'Composant introuvable — nommez votre composant principal <strong>Game</strong> ou <strong>App</strong>.</p>';
      }
    } catch (err) {
      document.getElementById('root').innerHTML =
        '<p style="color:#ef4444;padding:32px;text-align:center;font-size:0.9rem">Erreur : ' +
        err.message + '</p>';
    }
  </script>
</body>
</html>`,
    [code]
  );

  const blobUrl = useMemo(() => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [htmlContent]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl}
      width={width}
      height={height}
      sandbox="allow-scripts"
      style={{
        border: "1px solid rgba(255,107,0,0.3)",
        borderRadius: "8px",
        background: "#0a0a0a",
        display: "block",
        width,
        height,
      }}
      title="Creator Game Sandbox"
    />
  );
}
