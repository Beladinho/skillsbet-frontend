import { BrowserRouter, Routes, Route } from "react-router-dom";
import BattlePass from "./pages/BattlePass";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/battle-pass" element={<BattlePass />} />
      </Routes>
    </BrowserRouter>
  );
}
