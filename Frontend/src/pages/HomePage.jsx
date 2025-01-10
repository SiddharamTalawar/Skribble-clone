import { useState } from "react";
import "../styles/homepage.css";
import { Navigate } from "react-router-dom";
const HomePage = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };

  const handleCreateRoom = () => {
    // Add logic to create a room
    console.log("Creating room with username:", username);
  };

  const handleJoinRoom = () => {
    setRedirect(true);
    console.log("Joining room with username:", username, "and room:", room);
  };

  if (redirect) {
    return (
      <Navigate
        to={`/room/${room}`}
        state={{ username: username, room: room }}
      ></Navigate>
    );
  }

  return (
    <div className="homepage">
      <header className="header">
        <h1 className="title">Skribble</h1>
      </header>
      <main className="main-content">
        <div className="input-section">
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            className="username-input"
          />
          {/* <button onClick={handleCreateRoom} className="create-room-button">
            Create Room
          </button> */}
          <input
            type="text"
            placeholder="Enter room name"
            value={room}
            onChange={handleRoomChange}
            className="room-input"
          />
          <button onClick={handleJoinRoom} className="join-room-button">
            Join Room
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
