from typing import Dict, Any

class ScoringAgent:
    def __init__(self):
        # Weights as per PRD
        self.weights = {
            "concept_coverage": 0.25,
            "explanation_clarity": 0.20,
            "level_matching": 0.20,
            "teaching_structure": 0.15,
            "engagement_pace": 0.10,
            "noise_reduction": 0.10
        }

    async def calculate_lqs(self, video_data: Dict[str, Any], analysis_data: Dict[str, Any], user_level: str) -> float:
        """
        Scores each video using a Learning Quality Score (LQS).
        """
        # Mock scoring logic
        scores = {
            "concept_coverage": 90,
            "explanation_clarity": analysis_data.get("clarity_rating", 8) * 10,
            "level_matching": 95 if user_level.lower() in video_data["title"].lower() else 70,
            "teaching_structure": 85,
            "engagement_pace": 80,
            "noise_reduction": 90 if analysis_data.get("noise_level") == "Low" else 60
        }
        
        final_score = sum(scores[k] * self.weights[k] for k in self.weights)
        return final_score
