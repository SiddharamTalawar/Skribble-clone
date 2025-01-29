import { useState, useEffect } from "react";

const Game = ({ socket, room, userName, word }) => {
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState([]);

  useEffect(() => {
    // const handleNewMessage = (data) => {
    //   console.log("Received message:", data);
    //   setReceivedMessage((prevMessages) => [...prevMessages, data.msg]);
    // };

    socket.on("message", (data) => {
      // console.log("Received message:", data.message);
      // let newMessage = `${data.sender ? data.sender + " :" : ""}  ${
      //   data.message
      // }`;

      setReceivedMessage((prevMessages) => [...prevMessages, data]);
      if (data.sender) {
        // addPlayers(socket.id, data.sender);
      }
    }); //on room created

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("send_message", {
      room: room,
      message: message,
      sender: userName,
      word: word,
    });
    setMessage("");
  };

  return (
    <div>
      <div className="chat-list-section">
        {receivedMessage.map((msg, index) =>
          msg.color === "green" ? (
            <div className="chat-list-item success-message" key={index}>
              {msg.message}
            </div>
          ) : (
            <div className="chat-list-item" key={index}>
              {msg.sender ? `${msg.sender} : ` : ""} {msg.message}
            </div>
          )
        )}
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
