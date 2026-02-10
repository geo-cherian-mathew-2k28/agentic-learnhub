from typing import List, Dict, Any

class RecommendationAgent:
    def __init__(self):
        pass

    async def recommend(self, ranked_videos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Selects ONE best video based on LQS scores.
        """
        if not ranked_videos:
            return None
            
        # Sort by score descending
        sorted_videos = sorted(ranked_videos, key=lambda x: x["lqs_score"], reverse=True)
        return sorted_videos[0]
