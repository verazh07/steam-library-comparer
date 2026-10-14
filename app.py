from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)

load_dotenv()
#reinsert API key here later
API_KEY = os.getenv("STEAM_API_KEY")

def get_games(steamid):
    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    params = {
        "key": API_KEY,
        "steamid": steamid,
        "format": "json",
        "include_appinfo": True
    }
    response = requests.get(url, params=params)
    data = response.json()
    return data["response"]

def clean_games(data):
    games = data.get("games", [])
    simplified_games = []
    for game in games:
        minutes = game["playtime_forever"]
        hours = minutes // 60
        remaining_minutes = minutes % 60
        icon_hash = game.get("img_icon_url", "")
        icon_url = f"http://media.steampowered.com/steamcommunity/public/images/apps/{game['appid']}/{icon_hash}.jpg" if icon_hash else ""
        simplified_games.append({
            "minutes": remaining_minutes,
            "hours": hours,
            "total_minutes": game["playtime_forever"],
            "appid": game["appid"],
            "name": game["name"],
            "img_icon_url": icon_url
        })
    return simplified_games

@app.route("/api/library/<steamid>")
def get_library_json(steamid):
    raw_game_data = get_games(steamid)
    cleaned = clean_games(raw_game_data)
    display = display_format(cleaned)
    return jsonify({
        "Total Games": raw_game_data["game_count"],
        "games": display
    })

def display_format(games):
    return [f"{game['name']} - {game['hours']} hours {game['minutes']} min" for game in games]

@app.route("/api/compare/<steamid1>/<steamid2>")
def compare_libraries(steamid1, steamid2):
    games1 = clean_games(get_games(steamid1))
    games2 = clean_games(get_games(steamid2))
    common_games = []

    appid = {game["appid"] for game in games2}
    games2_by_appid = {game["appid"]: game for game in games2}
    for game1 in games1:
        game2 = games2_by_appid.get(game1["appid"])
        if game2:
            common_games.append({
                "appid": game1["appid"],
                "name": game1["name"],
                "icon": game1["img_icon_url"],
                "player1_minutes": game1["total_minutes"],
                "player2_minutes": game2["total_minutes"]
            })

    return jsonify({"common_games": common_games})

@app.route("/api/raw/<steamid>")
def get_raw(steamid):
    url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
    params = {
        "key": API_KEY,
        "steamid": steamid,
        "format": "json",
        "include_appinfo": True
    }
    response = requests.get(url, params=params)
    return jsonify(response.json())  

if __name__ == "__main__":
    app.run(debug=True, port=5000)