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

    return MCPAgent(llm=llm, client=client, max_steps=30)
