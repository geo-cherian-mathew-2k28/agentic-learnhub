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
        Act as an expert technical curriculum designer. Plan a 3-step video learning path for '{topic}' tailored to a '{user_level}' learner.

        STRICT RULES FOR CURRICULUM DESIGN:
        1. IF LEVEL = 'Low' (Beginner):
           - Step 1: Core Fundamentals & "How it works"
           - Step 2: Practical Implementation (Code/Examples)
           - Step 3: Best Practices & Common Pitfalls
        
        2. IF LEVEL = 'Medium' (Intermediate):
           - Step 1: Deep Dive into Internals/Architecture (Skip basics)
           - Step 2: Advanced Patterns or Real-world Case Studies
           - Step 3: Performance Tuning or Production Readiness
        
        3. IF LEVEL = 'High' (Expert):
           - Step 1: Advanced architectural trade-offs & System Design
           - Step 2: Extreme Optimization, niche edge-cases, or source-code analysis
           - Step 3: Future trends, Research papers, or Novel approaches

        OUTPUT FORMAT:
        Return a valid JSON LIST of 3 objects. Do not include markdown formatting.
        [
          {{
            "step_title": "Concise Title",
            "focus": "Exact YouTube Search Query (include 'advanced', 'deep dive', 'tutorial' etc based on level)",
            "level": "{user_level}",
            "goal": "Specific learning outcome"
          }},
          ...
        ]
        """

        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            print(f"Planner Error: {e}")
            return self._get_fallback_path(topic, user_level)

    def _get_fallback_path(self, topic: str, level: str) -> List[Dict[str, Any]]:
        # Default to a progressive path if level matches standard progression or is unknown
        if level == "Low":
            return [
                {"step_title": f"{topic} Basics", "focus": f"{topic} for beginners tutorial", "level": "Low", "goal": "Understand core concepts."},
                {"step_title": f"{topic} First Project", "focus": f"{topic} simple project walkthrough", "level": "Low", "goal": "Apply basics practical."},
                {"step_title": f"{topic} Common Mistakes", "focus": f"{topic} best practices for beginners", "level": "Low", "goal": "Avoid early pitfalls."}
            ]
        elif level == "Medium":
            return [
                {"step_title": f"{topic} Intermediate Concepts", "focus": f"{topic} intermediate tutorial", "level": "Medium", "goal": "Deepen technical understanding."},
                {"step_title": f"{topic} Advanced Patterns", "focus": f"{topic} advanced patterns", "level": "Medium", "goal": "Learn professional standards."},
                {"step_title": f"{topic} Performance", "focus": f"{topic} performance optimization", "level": "Medium", "goal": "Optimize for scale."}
            ]
        elif level == "High":
            return [
                {"step_title": f"{topic} Expert Internals", "focus": f"{topic} deep dive internal architecture", "level": "High", "goal": "Master system internals."},
                {"step_title": f"{topic} Scaling Strategies", "focus": f"{topic} scaling at large scale conference", "level": "High", "goal": "Handle enterprise loads."},
                {"step_title": f"{topic} Future Trends", "focus": f"{topic} future features roadmap", "level": "High", "goal": "Stay ahead of the curve."}
            ]
        
        # Fallback to mixed if something goes wrong
        return [
            {"step_title": f"{topic} Foundations", "focus": f"{topic} core fundamentals", "level": "Low", "goal": "Establish foundational principles."},
            {"step_title": f"{topic} Architecture", "focus": f"{topic} architecture", "level": "Medium", "goal": "Master complex implementations."},
            {"step_title": f"{topic} Optimization", "focus": f"{topic} optimization", "level": "High", "goal": "Achieve industry-standard mastery."}
        ]
