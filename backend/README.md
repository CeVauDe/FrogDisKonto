# FrogDisKonto Backend

This is the backend service for the FrogDisKonto project, which provides an API for processing queries through an MCP (Model Context Protocol) server.

## Prerequisites

- Python 3.12 or higher
- [uv](https://github.com/astral-sh/uv) - Python package installer and environment manager
- A local running instance of the MCP server ([SpendCastAI Repos](https://github.com/spendcastai/))

## Environment Setup

1. Create a `.env` file in the backend directory with the following variables:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
SPENDCAST_MCP_DIR=/path/to/spendcast-mcp
```

## Installation

1. Install the dependencies using uv:

```bash
uv venv
source .venv/bin/activate
uv pip install -e .
```

## Running the Backend

### Starting the API Server

Run the FastAPI application:

```bash
python app.py
```

This will start the server on `http://0.0.0.0:5000`.

### Alternative: Interactive MCP Client

You can also run the MCP client directly for interactive queries:

```bash
python mcp_client.py
```
