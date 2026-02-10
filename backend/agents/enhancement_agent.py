import os
import google.generativeai as genai
from typing import Dict, Any, List
from dotenv import load_dotenv
import json

load_dotenv()

class EnhancementAgent:
    def __init__(self, api_key: str = None):
        api_key = api_key or os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    async def enhance(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates high-precision validation and crisp professional summaries.
        """
        if not self.model:
            return self._fallback_data(video_data.get('title', 'Topic'))

        prompt = f"""
        Act as a professional educational technical editor.
        Video: {video_data.get('title')}
        Context: {video_data.get('description')[:1000]}

        Generate a JSON object with:
        1. "brief_summary": A crisp, non-fluffy 2-sentence summary of the skill taught.
        2. "pre_learning_checklist": 3 precise prerequisite tasks.
        3. "test_questions": 2 high-quality MCQs. 
           EACH question must have: "question", "options" (list of 4), and "correct_index" (integer 0-3).
        4. "mental_model": A powerful 1-sentence engineering analogy.

        Ensure the JSON is perfectly formatted. No markdown.
        """

        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace('```json', '').replace('```', '').replace('json', '').strip()
            data = json.loads(clean_text)
            
            # Clean text fields
            if "brief_summary" in data:
                data["brief_summary"] = data["brief_summary"].replace('**', '').replace('__', '').strip()
            if "mental_model" in data:
                data["mental_model"] = data["mental_model"].replace('**', '').replace('__', '').strip()
            
            # Robust mapping for correct_index
            for q in data.get("test_questions", []):
                if "correct_index" not in q:
                    if "answer" in q:
                        try:
                            # If answer is one of the options text
                            q["correct_index"] = q["options"].index(q["answer"])
                        except:
                            q["correct_index"] = 0
                    else:
                        q["correct_index"] = 0
            
            return data
        except Exception as e:
            print(f"Enhancement Error: {e}")
            return self._fallback_data(video_data.get('title'))

    def _fallback_data(self, title: str) -> Dict[str, Any]:
        return {
            "brief_summary": f"This module provides a critical deep dive into the technical frameworks and operational standards of {title}.",
            "pre_learning_checklist": [
                "Verify local development environment settings.",
                "Review the architectural overview presented in Module 01.",
                "Dedicate 20 minutes for high-retention learning."
            ],
            "test_questions": [
                {
                    "question": f"Which core principle of {title} is most emphasized for professional scalability?",
                    "options": ["Decoupled architecture", "Monolithic integration", "Manual state management", "Client-side only rendering"],
                    "correct_index": 0
                }
            ],
            "mental_model": "Think of it as the central nervous system of a complex technical ecosystem."
        }
