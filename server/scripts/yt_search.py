import yt_dlp
import sys
import json

def search_songs(query, max_results=10, sort_by=None):
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'default_search': 'ytsearch',
        'ignoreerrors': True
    }
    
    search_query = f"ytsearch{max_results}:{query}"
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(search_query, download=False)
            
            if not info or 'entries' not in info:
                return []
            
            results = []
            for entry in info['entries']:
                if entry:        
                    thumbnails = entry.get('thumbnails', [])
                    thumbnail_url = ''
                    if thumbnails:
                        first_thumb = thumbnails[0]
                        if isinstance(first_thumb, dict):
                            thumbnail_url = first_thumb.get('url', '')

                    result = {
                        'id': entry.get('id', ''),
                        'title': entry.get('title', ''),
                        'duration': entry.get('duration', 0),
                        'uploader': entry.get('uploader', ''),
                        'view_count': entry.get('view_count', 0),
                        'upload_date': entry.get('upload_date', ''),
                        'webpage_url': entry.get('webpage_url', ''),
                        'thumbnail': thumbnail_url,
                    }
                    results.append(result)
            
            # Sorting
            if sort_by == 'date':
                results.sort(key=lambda x: x.get('upload_date', ''), reverse=True)
            elif sort_by == 'views':
                results.sort(key=lambda x: x.get('view_count', 0), reverse=True)
            elif sort_by == 'alphabetic':
                results.sort(key=lambda x: x.get('title', '').lower())
            
            return results
    except Exception as e:
        print(f"Error searching: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 yt_search.py <search_query> [max_results] [sort_by]", file=sys.stderr)
        sys.exit(1)
    
    query = sys.argv[1]
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    sort_by = sys.argv[3] if len(sys.argv) > 3 else None
    
    results = search_songs(query, max_results, sort_by)
    print(json.dumps(results)) 