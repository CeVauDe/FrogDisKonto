from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from gtts import gTTS
from mcp_client import get_mcp_agent
from mcp_use import MCPAgent
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single instance of MCPClient shared across requests
agent: MCPAgent | None = None


class QueryRequest(BaseModel):
    query: str


@app.post("/api/query")
async def process_query(request: QueryRequest):
    global agent
    if agent is None:
        agent = get_mcp_agent()

    result = await agent.run(
        request.query,
    )

    # generate audio file
    audio_dir = Path("static/audio")
    audio_dir.mkdir(parents=True, exist_ok=True)

    text = "Hello, this is a text to speech example using Google's Text to Speech API."
    tts = gTTS(text=text, lang="en", slow=False)

    tts.save(audio_dir / "example.mp3")

    return {"result": result, "audio_url": "/static/audio/example.mp3"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
