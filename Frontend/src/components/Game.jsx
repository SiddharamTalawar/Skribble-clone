import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://127.0.0.1:8000", {
  path: "/ws/socket.io",
});

const Game = () => {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState([]);

  const [room, setRoom] = useState("");

  useEffect(() => {
    // Define the handler function
    const handleNewMessage = (data) => {
      console.log("Received message:", data);
      setReceivedMessage((prevMessages) => [...prevMessages, data.msg]);
    };

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", handleNewMessage);

    return () => {
      console.log("cleanup");
      socket.off("connect");
      socket.off("message", handleNewMessage);
    };
  }, []);
  //   function add_message(message) {
  //     console.log(message);
  //     setReceivedMessage(...message);
  //   }
  const sendMessage = () => {
    socket.emit("send_message", { room: room, message: message });
  };

  const joinRoom = () => {
    socket.emit("join_room", { room: room });
  };
  return (
    <div>
      <h1>Drawing Game</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <p>Received: </p>
      <ul>
        {" "}
        {receivedMessage.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}{" "}
      </ul>

      <p>Room: {room}</p>
    </div>
  );
};

export default Game;
