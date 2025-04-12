import yt_dlp
import sys

songName = sys.argv[1]
ydl_opts = {
    'quiet' : True
}
search_query = f"ytsearch:{songName}"
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(search_query, download=False)
    audioUrl = info['entries'][0]['requested_formats'][1]['url']
    print(audioUrl)
