# Tool-based AI Integration with OpenRouter

This document provides additional details on implementing the tool-based AI integration approach with OpenRouter for the SpendCast financial assistant.

## Function Definitions

Below are examples of function definitions that would be exposed to the AI models through OpenRouter:

```python
# Example function definitions for AI tools

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "query_transactions_by_date_range",
            "description": "Get financial transactions within a specific date range",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {
                        "type": "string",
                        "description": "Start date in YYYY-MM-DD format"
                    },
                    "end_date": {
                        "type": "string",
                        "description": "End date in YYYY-MM-DD format"
                    },
                    "transaction_type": {
                        "type": "string",
                        "enum": ["expense", "income", "transfer", "all"],
                        "description": "Type of transactions to retrieve"
                    }
                },
                "required": ["start_date", "end_date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_spending_by_category",
            "description": "Get spending aggregated by product category",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {
                        "type": "string",
                        "description": "Start date in YYYY-MM-DD format"
                    },
                    "end_date": {
                        "type": "string",
                        "description": "End date in YYYY-MM-DD format"
                    },
                    "categories": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        },
                        "description": "List of product categories to include (empty for all)"
                    }
                },
                "required": ["start_date", "end_date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "query_product_nutrition_info",
            "description": "Get nutritional information for products purchased",
            "parameters": {
                "type": "object",
                "properties": {
                    "start_date": {
                        "type": "string",
                        "description": "Start date in YYYY-MM-DD format"
                    },
                    "end_date": {
                        "type": "string",
                        "description": "End date in YYYY-MM-DD format"
                    },
                    "nutrition_type": {
                        "type": "string",
                        "enum": ["healthy", "unhealthy", "all"],
                        "description": "Filter by nutrition classification"
                    }
                },
                "required": ["start_date", "end_date", "nutrition_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_chart",
            "description": "Generate a visualization chart based on financial data",
            "parameters": {
                "type": "object",
                "properties": {
                    "chart_type": {
                        "type": "string",
                        "enum": ["bar", "pie", "line", "area", "scatter"],
                        "description": "Type of chart to generate"
                    },
                    "data": {
                        "type": "object",
                        "description": "Data to visualize (format depends on chart type)"
                    },
                    "title": {
                        "type": "string",
                        "description": "Chart title"
                    },
                    "color_scheme": {
                        "type": "string",
                        "enum": ["default", "financial", "categorical"],
                        "description": "Color scheme to use"
                    }
                },
                "required": ["chart_type", "data"]
            }
        }
    }
]
```

## Implementation Example

Here's an example implementation of the backend function that processes an AI function call:

```python
# Example implementation of a function handler

async def query_spending_by_category(start_date: str, end_date: str, categories: List[str] = None):
    """Get spending aggregated by product category."""
    
    # Build SPARQL query
    category_filter = ""
    if categories and len(categories) > 0:
        category_list = ", ".join([f'"{cat}"' for cat in categories])
        category_filter = f"""
        FILTER(?category_label IN ({category_list}))
        """
    
    sparql_query = f"""
    PREFIX exs: <https://static.rwpz.net/spendcast/schema#>
    PREFIX ex: <https://static.rwpz.net/spendcast/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?category_label (SUM(?amount) AS ?total_spent) (COUNT(?transaction) as ?transaction_count) WHERE {{
      ?transaction a exs:FinancialTransaction ;
        exs:hasTransactionDate ?date ;
        exs:hasReceipt ?receipt .
      ?receipt exs:hasLineItem ?line_item .
      ?line_item exs:hasProduct ?product .
      ?product exs:category ?category .
      ?category rdfs:label ?category_label .
      ?transaction exs:hasMonetaryAmount ?amount_uri .
      ?amount_uri exs:hasAmount ?amount .
      
      FILTER(?date >= "{start_date}"^^xsd:date && ?date <= "{end_date}"^^xsd:date)
      {category_filter}
    }}
    GROUP BY ?category_label
    ORDER BY DESC(?total_spent)
    """
    
    # Execute SPARQL query through MCP server
    try:
        # Use the MCP client to send the SPARQL query
        mcp_response = await mcp_client.execute_sparql(sparql_query)
        
        # Process and format results
        formatted_results = []
        for result in mcp_response["results"]["bindings"]:
            formatted_results.append({
                "category": result["category_label"]["value"],
                "total_spent": float(result["total_spent"]["value"]),
                "transaction_count": int(result["transaction_count"]["value"])
            })
            
        return {
            "status": "success",
            "data": formatted_results,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
```

## OpenRouter Integration

Here's an example of how to set up OpenRouter with function calling:

```python
import httpx
from typing import Dict, List, Any

async def process_query_with_openrouter(
    question: str,
    tools: List[Dict[str, Any]],
    model: str = "openai/gpt-4-turbo"
) -> Dict[str, Any]:
    """Process a natural language query using OpenRouter with tool definitions."""
    
    api_key = os.environ.get("OPENROUTER_API_KEY")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spendcast.example.com"  # Your site URL
    }
    
    payload = {
        "model": model,
        "messages": [
            {
                "role": "system", 
                "content": "You are SpendCast, a financial assistant that helps users understand their spending patterns."
            },
            {"role": "user", "content": question}
        ],
        "tools": tools,
        "tool_choice": "auto"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            return {
                "status": "error",
                "message": f"Error from OpenRouter: {response.text}"
            }
            
        result = response.json()
        return result

async def handle_tool_calls(tool_calls: List[Dict[str, Any]]):
    """Process tool calls requested by the AI model."""
    
    results = []
    
    for tool_call in tool_calls:
        function_name = tool_call["function"]["name"]
        arguments = json.loads(tool_call["function"]["arguments"])
        
        # Map function names to handlers
        function_handlers = {
            "query_transactions_by_date_range": query_transactions_by_date_range,
            "query_spending_by_category": query_spending_by_category,
            "query_product_nutrition_info": query_product_nutrition_info,
            "generate_chart": generate_chart
        }
        
        if function_name in function_handlers:
            handler = function_handlers[function_name]
            result = await handler(**arguments)
            results.append({
                "tool_call_id": tool_call["id"],
                "result": result
            })
        else:
            results.append({
                "tool_call_id": tool_call["id"],
                "result": {"status": "error", "message": f"Unknown function: {function_name}"}
            })
            
    return results
```

## API Endpoint Implementation

Here's how you might implement the main query endpoint:

```python
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

app = FastAPI()

class QueryRequest(BaseModel):
    question: str
    format: str = "text"  # text, audio, visual, video
    userId: Optional[str] = None
    model: Optional[str] = None  # Specific model to use via OpenRouter

class QueryResponse(BaseModel):
    answer: Dict[str, Any]
    metadata: Dict[str, Any]

@app.post("/api/v1/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    try:
        # 1. Process the query with OpenRouter
        ai_response = await process_query_with_openrouter(
            question=request.question,
            tools=TOOLS,
            model=request.model or "openai/gpt-4-turbo"
        )
        
        # 2. Check if the AI model wants to call functions
        tool_calls = ai_response.get("choices", [{}])[0].get("message", {}).get("tool_calls", [])
        
        # 3. If there are tool calls, process them
        if tool_calls:
            tool_results = await handle_tool_calls(tool_calls)
            
            # 4. Send results back to OpenRouter to get final response
            final_messages = [
                {"role": "system", "content": "You are SpendCast, a financial assistant that helps users understand their spending patterns."},
                {"role": "user", "content": request.question},
                {"role": "assistant", "content": None, "tool_calls": tool_calls}
            ]
            
            # Add tool results
            for result in tool_results:
                final_messages.append({
                    "role": "tool",
                    "tool_call_id": result["tool_call_id"],
                    "content": json.dumps(result["result"])
                })
            
            # Get final response
            final_response = await process_query_with_openrouter(
                question="",  # Not used when messages are provided
                tools=TOOLS,
                model=request.model or "openai/gpt-4-turbo",
                messages=final_messages
            )
            
            content = final_response.get("choices", [{}])[0].get("message", {}).get("content", "")
        else:
            # No tool calls, use the direct response
            content = ai_response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        # 5. Generate multimodal outputs if requested
        multimodal_outputs = {}
        if request.format != "text":
            multimodal_outputs = await generate_multimodal_outputs(
                content=content,
                format=request.format,
                data=tool_results if tool_calls else None
            )
        
        # 6. Prepare the final response
        return QueryResponse(
            answer={
                "text": content,
                **multimodal_outputs
            },
            metadata={
                "processingTime": 0.0,  # Calculate actual time
                "model": ai_response.get("model", ""),
                "tokenUsage": ai_response.get("usage", {})
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Benefits of This Approach

1. **Flexible AI Model Selection**: Use OpenRouter to select from various models.
2. **Dynamic Query Processing**: The AI decides which data to request based on question analysis.
3. **Controlled Data Access**: The AI can only access data through well-defined functions.
4. **Extendable Tool Set**: Easy to add new tools as requirements evolve.
5. **Simplified Backend Logic**: No need for complex NLP pipelines in the backend.

## Potential Challenges

1. **Function Definition Complexity**: Ensuring functions cover all possible query types.
2. **Error Handling**: Gracefully handling when the AI misuses tools or makes incorrect function calls.
3. **Cost Management**: Monitoring and optimizing API usage costs.
4. **Model Selection**: Finding the right balance between performance and cost for different queries.
