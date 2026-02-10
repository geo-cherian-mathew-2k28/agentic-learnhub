import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

class IntentAnalyzerAgent:
    def __init__(self, api_key: str = None):
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    async def analyze(self, topic: str, level: str, goal: str = None) -> Dict[str, Any]:
        """
        Understands what the user really wants to learn using Gemini.
        """
        if not self.model:
            # Fallback to mock
            return {
                "refined_topic": topic,
                "domain": "General",
                "subtopics": [topic],
                "level": level,
                "goal": goal
            }

        prompt = f"""
        Analyze the learning intent for the following request:
        Topic: {topic}
        Learner Level: {level}
        Goal: {goal if goal else 'General Learning'}

        Return a JSON object with:
        - refined_topic: A more specific topic name if needed.
        - domain: The academic or professional domain (e.g., Computer Science, Biology).
        - subtopics: A list of 3-5 specific subtopics that should be covered.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # In a real app, we'd parse JSON properly. For this demo, let's keep it robust.
            text = response.text
            # Simple extraction for demo purposes
            return {
                "refined_topic": topic,
                "domain": "Education",
                "subtopics": [topic],
                "level": level,
                "goal": goal,
                "raw_analysis": text
            }
        except Exception as e:
            print(f"Gemini Error: {e}")
            return {
                "refined_topic": topic,
                "domain": "General",
                "subtopics": [topic],
                "level": level,
                "goal": goal
            }
