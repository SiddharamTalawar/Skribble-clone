import { useRef, useEffect, useState } from "react";

const Canvas = ({ socket, room }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    console.log("Canvas   initialized:", canvas);
    console.log("  Context initialized:", context);
    // Listen for drawing events from the server
    socket.on("drawing", (data) => {
      console.log(" recing on drawing...", data);
      if (!context) {
        console.error("Context is not defined 1");
        return;
      }
      const { x0, y0, x1, y1 } = data;
      console.log("Drawing commands execution:", { x0, y0, x1, y1 });
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.stroke();
    });
    // Listen for finish drawing event from the server
    socket.on("finish_drawing", () => {
      console.log("Finish drawing event received");
      if (!context) {
        console.error("Context is not defined 2");
        return;
      }
      context.beginPath();
    });
    // Clean up the event listener when the component is unmounted
    return () => {
      socket.off("drawing");
      socket.off("finish_drawing");
      console.log("cleanup");
    };
  }, [socket]);

  const startDrawing = (event) => {
    setIsDrawing(true);
    console.log("start drawing");
    draw(event);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    // console.log("finish drawing before");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    console.log("Finishing drawing context:", context);
    context.beginPath();
    // Emit finish drawing event to the server
    socket.emit("finish_drawing", { room: room });
    console.log("finish drawing after");
  };

  const draw = (event) => {
    if (!isDrawing) return;
    console.log("draw event...");
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Context is not defined 3");
      return;
    }
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    console.log("Drawing on canvas:", { x, y });
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    console.log("Emitting drawing event:", { x0: x, y0: y, x1: x, y1: y });
    socket.emit("drawing", { x0: x, y0: y, x1: x, y1: y, room: room });
  };

  return (
    <canvas
      ref={canvasRef}
      width="400"
      height="400"
      style={{ border: "1px solid black" }}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
    />
  );
};

export default Canvas;
