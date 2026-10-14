
import requests
from flask import Flask, jsonify

API_KEY = "C71EBCBBEFD8712D393EEBBDD30443B6"
STEAM_ID = "76561199024315847"

url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"
params = {
    "key": API_KEY,
    "steamid": STEAM_ID,
    "format": "json",
    "include_appinfo": True
}

response = requests.get(url, params=params)
data = response.json()

print(data)

games = data["response"]["games"]
print(f"Found {len(games)} games:")
for game in games:
    minutes = game["playtime_forever"]
    hours = minutes // 60
    remaining_minutes = minutes % 60
    print(f" -{game['name']}: {hours} hours and {remaining_minutes} minutes played")