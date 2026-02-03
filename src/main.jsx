import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function Root() {
  const { token } = useContext(AuthContext);
  return token ? <Dashboard /> : <Auth />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);

