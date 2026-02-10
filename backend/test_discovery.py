import asyncio
from agents.discovery_agent import DiscoveryAgent
import os
from dotenv import load_dotenv

load_dotenv()

async def test():
    agent = DiscoveryAgent()
    intent = {"refined_topic": "Quantum Computing", "domain": "Science", "level": "Low"}
    videos = await agent.discover(intent)
    print(f"Found {len(videos)} videos")
    for v in videos:
        print(f"Title: {v['title']}, ID: {v['id']}")

if __name__ == "__main__":
    asyncio.run(test())
