import "../styles/popup.css"; // Assuming you'll style your popup here

const Popup = ({
  show,
  close,
  players,
  correctGussers,
  word,
  currentDrawer,
  socket,
}) => {
  return show ? (
    <div className="popup">
      <div className="popup-inner">
        <div className="title-container">
          <h2>The word was : {word}</h2>
          <p onClick={close}>X</p>
        </div>

        {console.log("players in popup", players, correctGussers)}
        {players
          .filter((player) => player.socket_id !== currentDrawer.socket_id)
          .map((player) => {
            if (correctGussers.includes(player.socket_id)) {
              return (
                <p className="correct-guess" key={player.id}>
                  {" "}
                  {player.name}
                </p>
              );
            } else {
              return (
                <p className="wrong-guess" key={player.id}>
                  {player.name}
                </p>
              );
            }
          })}
      </div>
    </div>
  ) : null;
};

export default Popup;
