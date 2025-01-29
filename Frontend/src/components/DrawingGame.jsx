import { useState, useEffect } from "react";
import io from "socket.io-client";
// import { useParams, useLocation } from "react-router-dom";
// import Game from "./Game";
import Chat from "./Chat";
import "../styles/drawinggame.css";
import CanvasNew from "./CanvasNew";
import PlayerCard from "./PlayerCard";
import Popup from "./PopUp";

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
  const [roomId, setRoomId] = useState("");
  const [createRoom, setCreateRoom] = useState(false);
  const [isGameRoundStarted, setIsGameRoundStarted] = useState(false);
  const [currentDrawerIndex, setCurrentDrawerIndex] = useState(-1);
  const [currentDrawer, setCurrentDrawer] = useState({});
  const [word, setWord] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setlineWidth] = useState(5);
  const [fillcolor, setfillcolor] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [correctGussers, setCorrectGussers] = useState([]);
  // const thumbSize = 10 + lineWidth * 2;
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
  ];

  // timer function for game
  // useEffect(() => {
  //   // console.log("seconds:", seconds);
  //   if (seconds > 0 && isGameRoundStarted) {
  //     const timerId = setInterval(() => {
  //       setSeconds((prevSeconds) => prevSeconds - 1);
  //     }, 1000);

  //     return () => clearInterval(timerId);
  //   } else if (seconds === 0 && isGameRoundStarted) {
  //     // handleTimerEnd();
  //   }
  // }, [seconds, isGameRoundStarted]);

  const handleColorChange = (selectedColor) => {
    setColor(selectedColor);
  };
  const togglePopup = () => {
    setShowPopUp(!showPopUp);
  };
  // const handleTimerEnd = () => {
  //   if (currentDrawer.socket_id == socket.id) {
  //     // startGame(); //call start game function to pick a new drawer
  //     console.log("picking a drawer using timer...");
  //     socket.emit("pick_drawer", {
  //       room: room,
  //       users: players,
  //       last_drawer_id: currentDrawerIndex,
  //     });
  //     setSeconds(10);
  //   }
  // };
  const handleUsernameChange = (e) => {
    setUserName(e.target.value);
    // console.log("userName:", userName);
  };

  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      socket.emit("exit_room", { room: room, sender: userName });
    });
    // Listen for room created event
    socket.on("room_created", (data) => {
      console.log("Room created:", data);
      // console.log("Room ID:", data.room.id);
      // console.log("userName:", data.sender);
      // console.log("room name", room);
      // setRoomId(data.id);
      // Emit an event to create a user

      socket.emit("create_user", {
        name: data.sender,
        socket_id: socket.id,
        room_id: data.room.id,
        room: data.room.name,
      });
    });
    socket.on("get_room", (data) => {
      // Emit an event to create a user
      console.log(
        "Room ID in get room and userName:",
        data.room.id,
        data.sender
      );
      console.log("room name get_room", room);
      socket.emit("create_user", {
        name: data.sender,
        socket_id: socket.id,
        room_id: data.room.id,
        room: data.room.name,
      });
    });
    // Listen for user created event
    socket.on("user_created", (data) => {
      console.log("User created:", data);

      // Emit an event to get users in the room
      socket.emit("get_users_in_room", {
        room_id: data.user.room_id,
        room: data.room,
      });
    });
    // Listen for users in the room event
    socket.on("users_in_room", (users) => {
      console.log("Users in room:", users);
      // keeping only unique users
      // TODO:reverse users list emited form be so that only recent unique users are stored
      const objects = users.users;
      const seenIds = new Set();
      const uniqueObjects = objects.filter((obj) => {
        if (seenIds.has(obj.socket_id)) {
          return false;
        } else {
          seenIds.add(obj.id);
          return true;
        }
      });
      setPlayers(uniqueObjects);
    });
    socket.on("error", (error) => {
      console.log("Error:", error);
    });

    socket.on("new_drawer", (data) => {
      console.log("new_drawer data", data);
      setIsGameRoundStarted(true);
      setCurrentDrawer(data.new_drawer);
      setWord(data.word);
      // setSeconds(60);
      // setCurrentDrawerIndex(data.new_drawer_index);
    });
    socket.on("show_pop_up", (data) => {
      console.log("show_pop_up data", data);
      setShowPopUp(true);
    });
    socket.on("add_correct_guesser", (data) => {
      console.log("add_correct_guesser data", data);
      setCorrectGussers(data.socket_id);
      // // console.log("players", players);
      // if (players.length > 0) {
      //   let updatedPlayers = players.map((player) => {
      //     // if (player.user.socket_id == data.socket_id) {
      //     //   return { ...player, isGuesser: true };
      //     // } else {
      //     //   return player;
      //     // }
      //     // console.log("player 2", player);
      //   });
      //   // console.log("updatedPlayers", updatedPlayers);
      //   // setPlayers(updatedPlayers);
      // }
    });
    socket.on("timer_update", (data) => {
      // console.log("timer_update data", data);
      setSeconds(data.time);
    });

    return () => {
      console.log("cleanup");
      socket.off("connect");
      socket.off("room_created");
      socket.off("user_created");
      socket.off("users_in_room");
      socket.off("error");
      socket.off("new_drawer");
      socket.off("show_pop_up");
      socket.off("add_correct_guesser");
      socket.off("timer_update");

      //   socket.off("message");
    };
  }, []);

  const joinRoom = () => {
    socket.emit("join_room", { room: room, sender: userName });
    if (createRoom) {
      socket.emit("create_room", { room: room, sender: userName });
    } else {
      socket.emit("get_room_data", { room: room, sender: userName });
    }
    setJoined(true);
  };

  function generateRandomString(length) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const handleCreateRoom = (createRoom) => {
    let element = document.querySelector(".hide-fields");
    element.classList.add("flex-column"); //show the input fields
    let btn = document.querySelector(".input-room-buttons");
    btn.classList.remove("flex-column");
    btn.classList.add("hide-fields"); //hide the buttons
    if (createRoom) {
      const randomString = generateRandomString(6);
      // console.log(randomString);
      setRoom(randomString);
      let roomInput = document.getElementById("room-input");
      roomInput.readonly = true; //make the room input readonly

      console.log(
        "Creating room with username,randomString:",
        userName,
        randomString
      );
      setCreateRoom(true);
    } else {
      console.log("Joining room with username:", userName, "and room:", room);
    }
  };

  const startGame = () => {
    // console.log("picking a drawer...");
    // socket.emit("pick_drawer", {
    //   room: room,
    //   users: players,
    //   last_drawer_id: currentDrawerIndex,
    // });
    // setSeconds(20);
    socket.emit("start_game", { room: room });
    // setIsGameRoundStarted(true);
  };

  return (
    <div>
      {!joined ? (
        <div className="input-section">
          <h1>Skribble</h1>
          <div className="input-fields hide-fields">
            <input
              type="text"
              placeholder="Enter your username"
              value={userName}
              onChange={handleUsernameChange}
              className="username-input "
            />

            <input
              id="room-input"
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
          <div className="input-room-buttons flex-column">
            <button
              onClick={handleCreateRoom.bind(null, true)}
              className="create-room-button"
            >
              Create Room
            </button>
            <button
              onClick={handleCreateRoom.bind(null, false)}
              className="join-room-button"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        <div className="container">
          <Popup
            show={showPopUp}
            close={togglePopup}
            players={players}
            correctGussers={correctGussers}
            word={word}
            currentDrawer={currentDrawer}
            socket={socket}
          />
          <div className="navbar-container">
            <div className="navbar">
              <div className="timer">{seconds}</div>
              <div className="word-container">
                {word && currentDrawer.socket_id == socket.id
                  ? word
                  : "_ ".repeat(word.length)}
              </div>
              <button className="start-button" onClick={startGame}>
                start
              </button>
            </div>
          </div>

          <div className="hero-container">
            <div className="player-container">
              {players.length > 0 &&
                players.map((player) => (
                  <PlayerCard key={player.id} user={player} />
                ))}
            </div>
            <div className="canvas-container">
              <CanvasNew
                socket={socket}
                room={room}
                userName={userName}
                currentDrawer={currentDrawer}
                color={color}
                lineWidth={lineWidth}
                fillcolor={fillcolor}
              />
            </div>
            <div className="chat-container">
              <Chat
                socket={socket}
                room={room}
                userName={userName}
                word={word}
              />
            </div>
          </div>
          <div className="color-container">
            {/* TODO: add fill color */}
            {/* <div className="fillcolor-button">
              <button onClick={() => setfillcolor(!fillcolor)}>fill</button>
            </div> */}
            <div className="color-palette">
              {colors.map((col) => (
                <div
                  className="color"
                  key={col}
                  onClick={() => handleColorChange(col)}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
            <div className="line-width-controller">
              <input
                type="range"
                min={1}
                max={20}
                // list="markers"
                value={lineWidth}
                onChange={(e) => setlineWidth(e.target.value)}
              />
              {/* <datalist id="markers">
                <option value="0"></option>
                <option value="5"></option>
                <option value="10"></option>
                <option value="15"></option>
                <option value="20"></option>
              </datalist> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingGame;
