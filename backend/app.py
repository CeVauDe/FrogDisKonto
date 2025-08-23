import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp_client import get_mcp_agent
from mcp_use import MCPAgent
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

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
    return {"result": result}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
