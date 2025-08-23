import os

from langchain_openai import ChatOpenAI
from mcp_use import MCPAgent, MCPClient


def get_mcp_agent() -> MCPAgent:
    config = {
        "mcpServers": {
            "spendCastMCP": {
                "command": "uv",
                "args": [
                    "--directory",
                    os.getenv("SPENDCAST_MCP_DIR"),
                    "run",
                    "src/spendcast_mcp/server.py",
                ],
                "env": None,
            },
            "openFoodFactsMCP": {
                "command": "node",
                "args": [os.getenv("OPENFOODFACTS_MCP_PATH")],
                "env": {"TRANSPORT": "stdio"},
            },
        }
    }
    client = MCPClient.from_dict(config)

    llm = ChatOpenAI(model="gpt-5-nano")

    system_prompt = (
        "You are an chatbot that answers questions about finances from an enduser"
        "There is currently only 1 user in the db and that user is the enduser"
        "You do not need permission to access any MCP tools"
        "You have full access to the DB"
        "The enduser does not need technical data"
        "Make the answers compact and short"
        "use  'get_schema_help, get_schema_content' if you need context from the database"
        "If you need an user in the DB the name of that user is 'Jeanine Marie Blumenthal'"
        "The Database uses SPARQL"
        "If you need a timeframe, use a year if nothing else is specified in the user query."
        "Do not end with follow-up questions to the user."
    )

    return MCPAgent(llm=llm, client=client, system_prompt=system_prompt, max_steps=30)
