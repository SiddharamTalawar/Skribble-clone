import { useState, useEffect } from "react";

const Game = ({ socket, room, userName, addPlayers }) => {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState([]);

  useEffect(() => {
    // const handleNewMessage = (data) => {
    //   console.log("Received message:", data);
    //   setReceivedMessage((prevMessages) => [...prevMessages, data.msg]);
    // };

    socket.on("message", (data) => {
      console.log("Received message:", data.message);
      let newMessage = `${data.sender ? data.sender + " :" : ""}  ${
        data.message
      }`;
      setReceivedMessage((prevMessages) => [...prevMessages, newMessage]);
      if (data.sender) {
        addPlayers(socket.id, data.sender);
      }
    });

    return () => {
      socket.off("message");
    };
  }, [socket]);

  const sendMessage = () => {
    socket.emit("send_message", {
      room: room,
      message: message,
      sender: userName,
    });
    setMessage("");
  };

  return (
    <div>
      <div className="chat-list-section">
        {receivedMessage.map((msg, index) => (
          <p className="chat-list-item" key={index}>
            {msg}
          </p>
        ))}
      </div>
      <div className="input-chat-section">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter Message"
        />
        <button onClick={sendMessage}>S</button>
      </div>
    </div>
  );
};

export default Game;
