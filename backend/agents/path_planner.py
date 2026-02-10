import os
import google.generativeai as genai
from typing import Dict, Any, List
from dotenv import load_dotenv
import json

load_dotenv()

class PathPlannerAgent:
    def __init__(self, api_key: str = None):
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def create_path(self, topic: str, user_level: str) -> List[Dict[str, Any]]:
        """
        Plans a 3-step learning path for professional mastery.
        """
        if not self.model:
            return self._get_fallback_path(topic)

        prompt = f"""
        Plan a unique 3-step professional learning path for: '{topic}'.
        Current Level: {user_level}
        
        Return a JSON LIST of 3 objects.
        Required keys: "step_title", "focus" (specific search terms for YouTube), "level" (Low/Medium/High), "goal".
        
        Output ONLY valid JSON. No markdown.
        """

        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Planner Error: {e}")
            return self._get_fallback_path(topic)

    def _get_fallback_path(self, topic: str) -> List[Dict[str, Any]]:
        return [
            {"step_title": f"{topic} Foundations", "focus": f"{topic} core fundamentals for professionals", "level": "Low", "goal": "Establish foundational principles."},
            {"step_title": f"{topic} Architecture", "focus": f"{topic} advanced architecture and patterns", "level": "Medium", "goal": "Master complex implementations."},
            {"step_title": f"{topic} Optimization", "focus": f"{topic} expert optimization and industry standards", "level": "High", "goal": "Achieve industry-standard mastery."}
        ]
