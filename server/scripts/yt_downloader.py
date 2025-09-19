import yt_dlp
import sys
import os

songName = sys.argv[1]
script_dir = os.path.dirname(os.path.abspath(__file__))
cookie_path = os.path.join(script_dir, 'cookies.txt')

ydl_opts = {
    'quiet' : True,
    'cookiefile' : cookie_path if os.path.exists(cookie_path) else None
}

# TODO: add handling error
search_query = f"ytsearch:{songName}"
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(search_query, download=False)
    audioUrl = info['entries'][0]['requested_formats'][1]['url']
    print(audioUrl)