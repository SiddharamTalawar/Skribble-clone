import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Game from "./components/Game";
import DrawingGame from "./components/DrawingGame";
import HomePage from "./pages/HomePage";

function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<HomePage />} />
    //     <Route path="room/:roomName" element={<DrawingGame />} />
    //   </Routes>
    // </BrowserRouter>
    <DrawingGame />
  );
}

export default App;
