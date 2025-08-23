import asyncio
import json
import os
from contextlib import AsyncExitStack
from typing import Optional

from dotenv import load_dotenv
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from openai import OpenAI

load_dotenv()  # load environment variables from .env

MODEL = "gpt-5-nano"
MAX_HOPS = 4

SERVER_CONFIG = {
    "command": "uv",
    "args": [
        "--directory",
        os.getenv("SPENDCAST_MCP_DIR"),
        "run",
        "src/spendcast_mcp/server.py",
    ],
    "env": None,
}


def convert_tool_format(tool):
    converted_tool = {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": {
                "type": "object",
                "properties": tool.inputSchema.get("properties", {}),
                "required": tool.inputSchema.get("required", []),
            },
        },
    }
    return converted_tool


class MCPClient:
    def __init__(self):
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.openai = OpenAI(
            # base_url="https://openrouter.ai/api/v1",
            api_key=os.environ["OPENROUTER_API_KEY"],
        )

    async def connect_to_server(self, server_config):
        server_params = StdioServerParameters(**server_config)
        stdio_transport = await self.exit_stack.enter_async_context(
            stdio_client(server_params)
        )
        self.stdio, self.write = stdio_transport
        self.session = await self.exit_stack.enter_async_context(
            ClientSession(self.stdio, self.write)
        )

        await self.session.initialize()

        # List available tools from the MCP server
        response = await self.session.list_tools()
        print(
            "\nConnected to server with tools:", [tool.name for tool in response.tools]
        )

        self.messages = []

    async def process_query(self, query: str) -> str:
        self.messages.append({"role": "developer","content": "You are a chatbot that answers question about the financial status of an user. The enduser is not technical and only cares about the values inside the db. there is currently only 1 user in the db so answer any question with that user. You have access to an db that has all the finacial information of the user through MCP. Make the final response not too long, you do not need confirmation for the ussage of the MCP server. Do not talk about MCP only use it. Do not make things up, allways look them in the db up. Take the Database as a reference, allways look it up, do not make it up. You get an fixed number of hops that you can make. A hop is when you get feed your previous response so that you can use the MCP multiple times per request. Never add the sql that you ran in the response"})
        self.messages.append({"role": "user", "content": query})

        response = await self.session.list_tools()
        available_tools = [convert_tool_format(tool) for tool in response.tools]

        response = self.openai.chat.completions.create(
            model=MODEL, tools=available_tools, messages=self.messages
        )
        self.messages.append(response.choices[0].message.model_dump())
 

        final_text = []
        content = response.choices[0].message
        for hop in range(MAX_HOPS):
            if content.tool_calls is not None:

                for tool_call in content.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = tool_call.function.arguments
                    tool_args = json.loads(tool_args) if tool_args else {}

                    # Execute tool call
                    try:
                        result = await self.session.call_tool(tool_name, tool_args)
                        print(f"[Calling tool {tool_name} with args {tool_args}]")
                    except Exception as e:
                        print(f"Error calling tool {tool_name}: {e}")
                        result = None

                    self.messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "name": tool_name,
                            "content": result.content,
                            "require_approval": "never"
                        }
                    )

                self.messages.append({
                    "role": "system",
                    "content": f"You have {MAX_HOPS - hop} hops remaining before the conversation will be cut off."
                })

                response = self.openai.chat.completions.create(
                    model=MODEL,
                    messages=self.messages,
                )

                content = response.choices[0].message
            else:
                final_text.append(content.content)
                break

        return "\n".join(final_text)

    async def chat_loop(self):
        """Run an interactive chat loop"""
        print("\nMCP Client Started!")
        print("Type your queries or 'quit' to exit.")

        while True:
            try:
                query = input("\nQuery: ").strip()
                result = await self.process_query(query)
                print("Result:")
                print(result)

            except Exception as e:
                print(f"Error: {e}")

    async def cleanup(self):
        await self.exit_stack.aclose()


async def main():
    client = MCPClient()
    try:
        await client.connect_to_server(SERVER_CONFIG)
        await client.chat_loop()
    finally:
        await client.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
