import { useRef, useEffect, useState } from "react";
// import { useParams, useLocation } from "react-router-dom";
// import Chat from "./Chat";
// import io from "socket.io-client";
import "../styles/newcanvas.css";

const Canvas = (socket, room, userName) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    console.log("Canvas initialized:", canvas);
    console.log("Context initialized:", context);

    // Listen for drawing data from the server
    socket.on("drawing", (data) => {
      if (!context) {
        console.error("Context is not defined");
        return;
      }
      let dataURL = data.dataURL;
      const base64String = dataURL.split(",")[1];
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
      img.src = imageUrl;
    });

    // Clean up the event listener when the component is unmounted
    return () => {
      socket.off("drawing");
      console.log("cleanup");
    };
  }, [socket]);

  const startDrawing = (event) => {
    setIsDrawing(true);
    draw(event);
  };

  const finishDrawing = async () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Send the entire canvas data to the server as an image
      const dataURL = await canvas.toDataURL("image/png");
      socket.emit("drawing", { dataURL: dataURL, room: room });
    }

    context.beginPath();
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Context is not defined");
      return;
    }

    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  return (
    <>
      <div className="navbar"></div>
      <div className="hero-section">
        {/* <div className="player-container"></div> */}
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width="800"
            height="600"
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
          />
        </div>
      </div>
    </>
  );
};

export default Canvas;
