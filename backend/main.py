from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import os

from agents.path_planner import PathPlannerAgent
from agents.discovery_agent import DiscoveryAgent
from agents.enhancement_agent import EnhancementAgent

app = FastAPI(title="LearnLens AI - Professional Learning Paths")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    topic: str
    level: str

class LearningStep(BaseModel):
    id: str
    title: str
    summary: str
    channel: str
    step_name: str
    goal: str
    lqs: float
    questions: List[dict]
    checklist: List[str]
    mental_model: str

class PathResult(BaseModel):
    topic: str
    path: List[LearningStep]

# Init Agents
planner = PathPlannerAgent()
discovery = DiscoveryAgent()
enhancer = EnhancementAgent()

@app.post("/api/create-path", response_model=PathResult)
async def create_path(request: SearchRequest):
    try:
        # 1. Plan the syllabus
        roadmap = await planner.create_path(request.topic, request.level)
        
        final_path = []
        seen_ids = []
        
        # 2. Sequential Discovery & Enhancement
        for step in roadmap:
            video = await discovery.fetch_best_for_step(step, exclude_ids=seen_ids)
            if not video: continue
            
            seen_ids.append(video["id"])
            
            # Generate professional summary and validation
            tools = await enhancer.enhance(video)
            
            final_path.append({
                "id": video["id"],
                "title": video["title"],
                "summary": tools.get("brief_summary", "Detailed overview of the current module."),
                "channel": video["channel_title"],
                "step_name": step["step_title"],
                "goal": step["goal"],
                "lqs": 94.0, 
                "questions": tools.get("test_questions", []),
                "checklist": tools.get("pre_learning_checklist", []),
                "mental_model": tools.get("mental_model", "Foundational concepts for mastery.")
            })
            
        return {
            "topic": request.topic,
            "path": final_path
        }
    except Exception as e:
        print(f"Path Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
