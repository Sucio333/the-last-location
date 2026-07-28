import os
import requests
from dotenv import load_dotenv

load_dotenv()

TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
TWITCH_CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')

print("Client ID cargado:", TWITCH_CLIENT_ID)
print("Client Secret cargado:", TWITCH_CLIENT_SECRET[:5] + "..." if TWITCH_CLIENT_SECRET else None)

url = 'https://id.twitch.tv/oauth2/token'
params = {
    'client_id': TWITCH_CLIENT_ID,
    'client_secret': TWITCH_CLIENT_SECRET,
    'grant_type': 'client_credentials'
}

response = requests.post(url, params=params)
print("Status code:", response.status_code)
print("Respuesta:", response.json())