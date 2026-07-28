import os
import requests
from dotenv import load_dotenv
from flask import Flask, render_template

load_dotenv()

app = Flask(__name__)

TWITCH_CLIENT_ID = os.getenv('TWITCH_CLIENT_ID')
TWITCH_CLIENT_SECRET = os.getenv('TWITCH_CLIENT_SECRET')
TWITCH_CHANNEL = os.getenv('TWITCH_CHANNEL') or 'thelastlocationcl'


def get_twitch_token():
    # Obtiene token de autorización de Twitch API
    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        return None

    try:
        url = 'https://id.twitch.tv/oauth2/token'
        params = {
            'client_id': TWITCH_CLIENT_ID,
            'client_secret': TWITCH_CLIENT_SECRET,
            'grant_type': 'client_credentials'
        }
        response = requests.post(url, params=params, timeout=8)
        response.raise_for_status()  # Lanza excepción si status >= 400
        data = response.json()
        return data.get('access_token')
    except (requests.exceptions.RequestException, ValueError):
        # Captura errores de conexión, timeout, o JSON inválido
        return None


def is_channel_live():
    # Verifica si el canal está en vivo en Twitch
    token = get_twitch_token()
    if not token:
        return False

    try:
        url = 'https://api.twitch.tv/helix/streams'
        headers = {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': f'Bearer {token}'
        }
        params = {
            'user_login': TWITCH_CHANNEL
        }
        response = requests.get(url, headers=headers, params=params, timeout=8)
        response.raise_for_status()  # Lanza excepción si status >= 400

        data = response.json()
        return len(data.get('data', [])) > 0
    except (requests.exceptions.RequestException, ValueError):
        # Captura errores de conexión, timeout, dominio no permitido, o JSON inválido
        # En PythonAnywhere plan gratis, si Twitch no está en whitelist, fallará aquí
        return False


@app.route('/')
def index():
    # Renderiza la página principal; siempre muestra SoundCloud como fallback
    try:
        en_vivo = is_channel_live()
    except Exception:
        # Si algo sale mal, mostrar el reproductor de SoundCloud por defecto
        en_vivo = False

    return render_template('index.html', en_vivo=en_vivo, twitch_channel=TWITCH_CHANNEL)


if __name__ == '__main__':
    # En desarrollo local: ejecuta con debug=True
    # En PythonAnywhere: WSGI importa solo el objeto 'app', este bloque no se ejecuta
    app.run(debug=True)