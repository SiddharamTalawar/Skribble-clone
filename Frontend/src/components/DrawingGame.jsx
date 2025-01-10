import { useState, useEffect } from "react";
import io from "socket.io-client";
// import { useParams, useLocation } from "react-router-dom";
// import Game from "./Game";
import Chat from "./Chat";
// import Canvas from "./Canvas
import NewCanvas from "./Newcanvas";
import "../styles/drawinggame.css";
import CanvasNew from "./CanvasNew";
const socket = io("http://127.0.0.1:8000", {
  path: "/ws/socket.io",
});

const DrawingGame = () => {
  // const location = useLocation();
  // const { roomName } = useParams();
  // console.log("roomName", roomName);
  // const room = location.state.room;
  // const userName = location.state.username;
  // console.log("DrawingGame with username:", userName, "and room:", room);
  const [room, setRoom] = useState("");
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState({});
  useEffect(() => {
    socket.emit("players_list", { players: players, room: room });
    console.log("players_list", players);
  }, [players]);
  function addPlayers(sid, name) {
    console.log(sid, name);
    setPlayers((preplayers) => {
      if (!Object.hasOwn(preplayers, sid)) {
        return { ...preplayers, [sid]: name };
      }
      return preplayers;
    });
  }

  const handleUsernameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    // setUserName(location.state.username);
    // console.log(
    //   "Joining room in DrawingGame with username :",
    //   userName,
    //   "and room:",
    //   room
    // );
    // joinRoom();
    return () => {
      console.log("cleanup");
      socket.off("connect");
      //   socket.off("message");
    };
  }, []);

  const joinRoom = () => {
    socket.emit("join_room", { room: room, sender: userName });
    setJoined(true);
  };
  // if (!joined) {
  //   // setUserName(location.state.username);
  //   console.log(
  //     "Joining room in DrawingGame 2222 with username :",
  //     userName,
  //     "and room:",
  //     room
  //   );
  //   joinRoom();
  //   setJoined(true);
  // }
  return (
    <div>
      {!joined ? (
        <div className="input-section">
          <h1>Skribble</h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={userName}
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
          <button onClick={joinRoom} className="join-room-button">
            Join Room
          </button>
        </div>
      ) : (
        <div className="hero-container">
          <div className="player-container">
            <p>player 1</p>
            <p>player 1</p>
          </div>
          <div className="canvas-container">
            <CanvasNew socket={socket} room={room} userName={userName} />
          </div>
          <div className="chat-container">
            <Chat
              socket={socket}
              room={room}
              userName={userName}
              addPlayers={addPlayers}
            />
          </div>
        </div>
      )}

      {/* <NewCanvas socket={socket} room={room} userName={userName} /> */}
      {/* <CanvasNew socket={socket} room={room} userName={userName} />
      <Chat socket={socket} room={room} userName={userName} /> */}
    </div>
  );
};

export default DrawingGame;
