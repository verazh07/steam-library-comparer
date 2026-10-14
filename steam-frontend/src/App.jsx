import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [games, setGames] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commonGames, setCommonGames] = useState([]);
  const [compareIds, setCompareIds] = useState(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("combined");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetch("http://localhost:5000/api/library/76561199024315847")
      .then(res => res.json())
      .then(data => {
        setTotalGames(data["Total Games"]);
        setGames(data["games"]);   
        setLoading(false);
      });
  }, []);

function extractSteamID(url) {
  const match = url.match(/steamcommunity\.com\/profiles\/(\d+)/);
  return match ? match[1] : null;
}

function handleSubmit(event) {
  event.preventDefault();
  setError("");

  const url1 = event.target["user-1"].value;
  const url2 = event.target["user-2"].value;

  const id1 = extractSteamID(url1);
  const id2 = extractSteamID(url2);
  if (!id1 || !id2) {
    setError("Please enter valid Steam profile URLs.");
    return;
  }

  fetch(`http://localhost:5000/api/compare/${id1}/${id2}`)
    .then(res => res.json())
    .then(data => {
      setCommonGames(data["common_games"]);
      setCompareIds([id1, id2]);
    });
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function getPlaytime(game) {
  if (sortBy === "player1") return game.player1_minutes;
  if (sortBy === "player2") return game.player2_minutes;
  return game.player1_minutes + game.player2_minutes;
}

const sortedGames = [...commonGames].sort((a, b) => {
  const difference = getPlaytime(a) - getPlaytime(b);
  return sortOrder === "asc" ? difference : -difference;
});

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className = "header">
        <h1>Steam Library Comparer</h1>
      </div>

      <div className = "container">
        <div className = "panel">
          <p>Welcome to Steam Library Comparer! Please paste the URL link to your Steam profile here. 
            Your profile <strong><em>MUST</em></strong> be set to public for it to work.
          </p>
          <img 
            className = "tutorial-gif"
            src="/copy-profile-link.gif"
            alt="How to copy a Steam profile link"
          />
        </div>

      <form onSubmit={handleSubmit} className = "panel">
        <fieldset>
          <legend>Paste Links Here</legend>
          <label htmlFor="user-1"> Steam User 1: </label> 
          <input type="text" id="user-1" name="URL" placeholder="Paste 1st User URL here" required size="20" /> <br />
          
          <label htmlFor="user-2">Steam User 2: </label>
          <input type="text" id="user-2" name="URL" placeholder="Paste 2nd User URL Here" required size="20" />
        </fieldset>
        <button type="submit">Compare Libraries</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {compareIds && (
        <div className = "panel">
          <h2>Games in Common ({commonGames.length})</h2>

          <div className="sort-options">
            <label htmlFor="sort-by">Sort by:</label>
            <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="combined">Combined Playtime</option>
              <option value="player1">Player 1 Playtime</option>
              <option value="player2">Player 2 Playtime</option>
            </select>

            <select value = {sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <ul>
            {sortedGames.map(game => (
              <li key={game.appid}>
                {game.icon && <img className="game-icon" src={game.icon} alt="" />}
                <span className="game-name">{game.name}</span>
                <span className="game-time">
                  User 1: {formatTime(game.player1_minutes)} · User 2: {formatTime(game.player2_minutes)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* <h2>Total Games: {totalGames}</h2>
      <ul>
        {games.map((game, index) => (
          <li key={index}>{game}</li>
        ))}
      </ul> */}
      </div>
    </div>
  );
}


export default App;