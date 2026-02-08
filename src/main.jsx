import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

function Root() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) {
    return <Auth setToken={setToken} />;
  }

  return <Dashboard token={token} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

