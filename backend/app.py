from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp_client import get_mcp_agent
from mcp_use import MCPAgent
from model import Intents
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
intents_path = Path(__file__).parent / "intents.json"
INTENTS = Intents.model_validate_json(intents_path.read_text())

intent_samples = ""
for intent in INTENTS.root:
    intent_samples += f"# {intent.name}\nDescription: {intent.description}\nSamples:\n"
    for example in intent.example_queries:
        intent_samples += f"- {example}\n"
    intent_samples += "\n"

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
    intent_result = agent.llm.predict(f"""You have to identify the intent of the user query. Match it to one of the following intents:
                                   {"\n".join(i.name for i in INTENTS.root)}\n
Use the intent samples to analyze, to which of
these intents the user query belongs: {intent_samples}. Your answer must be
one of the following values: {"\n".join(i.name for i in INTENTS.root)}
Here is the user query: {request.query}""")
    intent_result
    intent = next((i for i in INTENTS.root if i.name == intent_result), None)
    if intent is None:
        raise ValueError(f"Unknown intent: {intent_result}")

    # get result
    print(f"Using intent: {intent.name}")
    result = await agent.run(
        request.query
        + f"\n You can enhance this query template {intent.sparql_template} from the user query.",
    )

    # provide output
    # result = await agent.run(
    #    request.query,
    # )

    return {"result": result}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
