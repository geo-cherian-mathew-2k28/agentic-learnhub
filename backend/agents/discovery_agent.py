import os
from googleapiclient.discovery import build
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class DiscoveryAgent:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")
        if self.api_key:
            self.youtube = build("youtube", "v3", developerKey=self.api_key)
        else:
            self.youtube = None

    async def fetch_best_for_step(self, step: Dict[str, Any], exclude_ids: List[str] = []) -> Dict[str, Any]:
        """
        Fetches the absolute best unique video for a specific step.
        """
        if not self.youtube:
            return None

        # Enhance query with focus and module goal
        query = f"{step['focus']} {step['step_title']} tutorial"
        try:
            search_response = self.youtube.search().list(
                q=query,
                part="id,snippet",
                maxResults=10, # Fetch more to allow for filtering
                type="video",
                videoEmbeddable="true",
                relevanceLanguage="en"
            ).execute()

            items = search_response.get("items", [])
            if not items: return None
            
            # Find the first video not in exclude_ids
            best_video = None
            for item in items:
                v_id = item["id"]["videoId"]
                if v_id not in exclude_ids:
                    best_video = item
                    break
            
            if not best_video:
                best_video = items[0] # Fallback to first if all are duplicates
                
            video_id = best_video["id"]["videoId"]

            # Get full stats
            video_details = self.youtube.videos().list(
                id=video_id,
                part="snippet,statistics,contentDetails"
            ).execute()["items"][0]

            return {
                "id": video_id,
                "title": video_details["snippet"]["title"],
                "description": video_details["snippet"]["description"],
                "thumbnail": video_details["snippet"]["thumbnails"]["high"]["url"],
                "channel_title": video_details["snippet"]["channelTitle"],
                "lqs_score": 95.0,
                "step_title": step["step_title"],
                "mastery_goal": step["goal"]
            }
        except Exception as e:
            print(f"YT Fetch Error: {e}")
            return None
