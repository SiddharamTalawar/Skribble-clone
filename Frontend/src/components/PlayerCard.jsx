import "../styles/playercard.css";

function PlayerCard(user) {
  return (
    <div className="player-card">
      {/* {console.log("user in player card", user.user.name)} */}
      <p>{user.user.name}</p>
    </div>
  );
}

export default PlayerCard;
