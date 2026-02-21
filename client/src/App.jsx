import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Identity from "./pages/Identity";
import Room from "./pages/Room";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game"; // ✅ ADD THIS
import GameComplete from "./pages/GameComplete";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/identity" element={<Identity />} />
        <Route path="/room" element={<Room />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} /> {/* ✅ ADD THIS */}
        <Route path="/complete" element={<GameComplete />} />
      </Routes>
    </Layout>
  );
}

export default App;
