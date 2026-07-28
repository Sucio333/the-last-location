# Setup para desplegar en PythonAnywhere

## Variables de Entorno a Configurar

En el panel de PythonAnywhere, en la sección **Web**, ve a tu aplicación y configura estas **variables de entorno** manualmente:

```
TWITCH_CLIENT_ID: <tu_client_id>
TWITCH_CLIENT_SECRET: <tu_client_secret>
TWITCH_CHANNEL: thelastlocationcl (o el canal que uses)
```

**IMPORTANTE:** No subas `.env` a git ni a PythonAnywhere. Las variables se configuran en el panel.

---

## Pasos de Instalación en PythonAnywhere

1. **Crea una cuenta** en https://www.pythonanywhere.com (plan gratis)

2. **Crea una Web app** de Flask (versión Python 3.10+)

3. **En Bash console**, descarga el código:
   ```bash
   cd /home/tuusuario
   git clone <tu_repo> the_last_location
   cd the_last_location
   ```

4. **Instala dependencias:**
   ```bash
   python -m pip install -r requirements.txt
   ```

5. **Configura variables de entorno** en el panel Web:
   - Ve a **Web** → Tu app → scroll down a **Web app settings**
   - En **Environment variables**, agrega las 3 líneas de arriba

6. **Configura el archivo WSGI** (`/var/www/tuusuario_pythonanywhere_com_wsgi.py`):
   ```python
   import sys
   path = '/home/tuusuario/the_last_location'
   if path not in sys.path:
       sys.path.append(path)
   from app import app as application
   ```

7. **Recarga la app** en el panel Web (botón verde "Reload")

---

## ⚠️ Nota Importante: Iframe de Twitch

El archivo `templates/index.html` línea 98 tiene:
```html
<iframe src="https://player.twitch.tv/?channel=...&parent=localhost&parent=127.0.0.1">
```

**Una vez que sepas tu subdominio en PythonAnywhere** (ej: `tuusuario.pythonanywhere.com`), tendrás que cambiar esa línea a:
```html
<iframe src="https://player.twitch.tv/?channel=...&parent=localhost&parent=127.0.0.1&parent=tuusuario.pythonanywhere.com">
```

(Nota: Se puede tener múltiples parámetros `parent=` para permitir varios dominios)

---

## Verificación Final

Después de desplegar:
- Abre `https://tuusuario.pythonanywhere.com` en tu navegador
- Si el canal está en vivo, verás el iframe de Twitch
- Si está offline, verás el reproductor de SoundCloud
- La página debería mostrar correctamente en desktop y mobile

---

## Solución de Problemas

**Si ves error 500:**
- Revisa los logs en PythonAnywhere (Web tab → Error log)
- Verifica que las variables de entorno estén configuradas correctamente

**Si Twitch no funciona:**
- En PythonAnywhere plan gratis, pueden rechazar conexiones a Twitch
- La página fallback a SoundCloud automáticamente (por el try/except en app.py)

**Si la página está lenta:**
- El plan gratis de PythonAnywhere tiene limitaciones de CPU
- Considera usar caché o reducir llamadas a la API de Twitch
