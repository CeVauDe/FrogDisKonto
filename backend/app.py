import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp_client import SERVER_CONFIG, MCPClient
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
mcp_client: MCPClient | None = None


class QueryRequest(BaseModel):
    query: str


@app.post("/api/query")
async def process_query(request: QueryRequest):
    global mcp_client
    if mcp_client is None:
        mcp_client = MCPClient()
        await mcp_client.connect_to_server(SERVER_CONFIG)

    result = await mcp_client.process_query(request.query)
    return {"result": result}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
