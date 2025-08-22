# Python Backend API Architecture for SpendCast

## Overview

This document outlines a proposed architecture for the SpendCast backend API that will process natural language questio## LLM Integration

For natural language processing and answer generation, we'll implement a tool-based AI integration approach using OpenRouter:

- **OpenRouter Integration**: Route queries to various AI models (GPT-4, Claude, Mistral, etc.) through a single API
- **Function Calling**: Define custom functions that allow the AI to query the MCP server and GraphDB
- **Tool-based Architecture**: The AI decides which SPARQL queries to generate based on user questions
- **Model Flexibility**: Easily switch between different AI models based on performance needst financial data and generate answers based on a GraphDB with an MCP server.

## Core Components

### 1. API Layer

```
/api
  ├── main.py           # FastAPI app entry point
  ├── routes/
  │   ├── query.py      # Endpoints for natural language queries
  │   ├── auth.py       # Authentication endpoints
  │   └── health.py     # Health check and status endpoints
  └── middleware/
      ├── logging.py    # Request/response logging
      ├── error.py      # Error handling
      └── auth.py       # Authentication middleware
```

### 2. AI Integration Layer

```
/ai
  ├── router.py         # OpenRouter client setup
  ├── tools/
  │   ├── registry.py   # Function definitions for AI tools
  │   ├── sparql.py     # SPARQL query generation tools
  │   └── analysis.py   # Financial analysis tools
  └── prompt/
      ├── templates.py  # System prompts and templates
      └── context.py    # Context building for AI queries
```

### 3. MCP Client

```
/mcp
  ├── client.py         # MCP client for communicating with the MCP server
  ├── tools/
  │   ├── sparql.py     # Functions for executing SPARQL queries via MCP
  │   └── parser.py     # Parse and process MCP response data
  └── schemas/
      ├── financial.py  # Pydantic schemas for financial data structures
      └── response.py   # Schemas for MCP responses
```

### 4. Response Generation

```
/generation
  ├── formatter.py      # Format answers for different outputs
  ├── multimodal/
  │   ├── text.py       # Text generation
  │   ├── audio.py      # Audio/speech generation 
  │   ├── visual.py     # Charts and visualization generation
  │   └── video.py      # Video generation
  └── enrichment/
      ├── wikidata.py   # Enrich responses with Wikidata information
      └── openfood.py   # Enrich with Open Food Facts data
```

### 5. Utilities and Shared Code

```
/utils
  ├── config.py         # Configuration management
  ├── logging.py        # Logging utilities
  ├── metrics.py        # Performance metrics
  └── cache.py          # Caching mechanism
```

## High-Level Architecture Diagram

```
┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│   Client    │─────────►    API      │────────►  OpenRouter │
│ Application │◄─────────  (FastAPI)  │◄────────     AI      │
└─────────────┘         └─────────────┘        └─────┬───────┘
                              ▲                      │
                              │                      │
                              ▼                      ▼
┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│ Multimodal  │◄────────► AI Function │◄───────►    MCP      │
│ Generator   │         │    Tools    │        │   Client    │
└─────────────┘         └─────────────┘        └─────┬───────┘
                                                     │
                                                     ▼
                                               ┌─────────────┐
                                               │    MCP      │
                                               │   Server    │
                                               └─────────────┘
```

## API Endpoints

### Natural Language Query API

#### Query Endpoint
```
POST /api/v1/query
```

**Request Body:**
```json
{
  "question": "How much did I spend on unhealthy food last month?",
  "format": "text", // Options: text, audio, visual, video
  "userId": "user123"
}
```

**Response:**
```json
{
  "answer": {
    "text": "Last month, you spent CHF 253.45 on foods categorized as unhealthy...",
    "data": {
      "amount": 253.45,
      "currency": "CHF",
      "period": "2025-07",
      "categories": ["snacks", "alcohol"]
    },
    "visualUrl": "https://api.spendcast.ch/visuals/user123/2025-08-22-12-34-56.png",
    "audioUrl": "https://api.spendcast.ch/audio/user123/2025-08-22-12-34-56.mp3"
  },
  "metadata": {
    "processingTime": 1.23,
    "confidence": 0.95,
    "sources": ["financial_transactions", "receipts", "product_categories"]
  }
}
```

### Authentication API

```
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

## Data Flow

1. **Query Reception**: 
   - API receives natural language question
   - Validates request and authenticates user

2. **AI Function Calling**:
   - Backend sends the question to OpenRouter
   - OpenRouter routes to appropriate AI model
   - AI model analyzes the question and determines needed data
   - AI calls custom functions to retrieve necessary information

3. **SPARQL Tool Execution**:
   - Backend implements function definitions that translate to SPARQL queries
   - When the AI calls a function, the backend:
     - Generates the appropriate SPARQL query
     - Sends the query to the MCP server
     - Processes the response data and returns it to the AI

4. **External Data Enrichment**:
   - AI may call additional functions to access external sources
   - Functions for Open Food Facts, Wikidata, etc.
   - Results from multiple function calls are combined

5. **Response Generation**:
   - AI generates the final text response based on all data gathered
   - Backend processes this response for multimodal output
   - Creates visualizations, audio, or video as requested

6. **Response Delivery**:
   - Formats final response according to requested format
   - Returns data to client

## Implementation Considerations

### 1. LLM Integration

For natural language processing and answer generation, consider:

- **Local Models**: Serve models like Llama 3 locally for privacy
- **API-based Models**: OpenAI API or Anthropic Claude for more complex reasoning
- **Hybrid Approach**: Use local models for intent/entity extraction and external APIs for answer generation

### 2. GraphDB Query Optimization

- Pre-compute common aggregations
- Cache frequent query results
- Use parameterized SPARQL templates

### 3. Security Considerations

- Implement proper authentication and authorization
- Sanitize user inputs before processing
- Limit query complexity and execution time
- Encrypt sensitive data

### 4. Performance Optimization

- Implement request caching
- Use asynchronous processing for heavy computations
- Scale horizontally for handling multiple concurrent requests

### 5. Data Privacy

- Store only necessary user data
- Implement data retention policies
- Provide transparency about data usage

## Technology Stack

### Core Backend
- **Python 3.11+**: Modern language features
- **FastAPI**: High-performance API framework
- **Pydantic**: Data validation and settings management

### AI Integration
- **OpenRouter**: API for accessing multiple AI models
- **Function Calling**: Implementing tools for AI to use
- **LangChain**: Optional framework for AI agent orchestration
- **Instructor**: Library for structured outputs from LLMs

### Database & Query
- **MCP Client Library**: For communicating with the MCP server
- **SPARQL**: Knowledge of SPARQL query language for building queries
- **Pydantic**: For data validation and schema definition

### Visualization & Media
- **Matplotlib/Seaborn**: For chart generation
- **Pillow**: Image processing
- **MoviePy**: Video generation
- **gTTS or pyttsx3**: Text-to-speech conversion

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration (for larger deployments)
- **Redis**: Caching layer
- **Prometheus/Grafana**: Monitoring

## Next Steps

1. Develop a proof-of-concept implementation focused on:
   - Basic NLP processing of financial questions
   - SPARQL query generation
   - Simple text response generation

2. Iterate with user feedback to improve:
   - Question understanding
   - Answer quality and relevance
   - Visualization effectiveness

3. Expand capabilities:
   - Add more multimodal output formats
   - Integrate additional external data sources
   - Implement more complex reasoning about financial data
