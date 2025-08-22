# MCP Client Implementation

This document outlines the implementation details for the MCP client that will communicate with the MCP server in the SpendCast application.

## Overview

The MCP (Model Context Protocol) server provides an abstraction layer over the GraphDB, allowing our application to query the financial data using SPARQL. Our backend only needs to interact with the MCP server's API rather than directly with the GraphDB.

## MCP Client Structure

```python
# mcp/client.py

import httpx
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class MCPClientConfig(BaseModel):
    """Configuration for the MCP client."""
    base_url: str = Field(..., description="Base URL of the MCP server")
    timeout: int = Field(30, description="Request timeout in seconds")
    headers: Dict[str, str] = Field(default_factory=dict, description="Default headers")

class MCPClient:
    """Client for interacting with the MCP server."""
    
    def __init__(self, config: MCPClientConfig):
        self.config = config
        self.client = httpx.AsyncClient(
            base_url=config.base_url,
            timeout=config.timeout,
            headers=config.headers
        )
    
    async def execute_sparql(self, query: str) -> Dict[str, Any]:
        """Execute a SPARQL query via the MCP server.
        
        Args:
            query: The SPARQL query string
            
        Returns:
            Dict containing the query results
        """
        try:
            response = await self.client.post(
                "/execute_sparql",
                json={"query": query}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"MCP server returned error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Error communicating with MCP server: {str(e)}")
    
    async def execute_sparql_validated(self, query: str) -> Dict[str, Any]:
        """Execute a SPARQL query with validation via the MCP server.
        
        Args:
            query: The SPARQL query string
            
        Returns:
            Dict containing the query results
        """
        try:
            response = await self.client.post(
                "/execute_sparql_validated",
                json={"query": query}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"MCP server returned error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Error communicating with MCP server: {str(e)}")
    
    async def get_schema_help(self) -> Dict[str, Any]:
        """Get schema documentation and query examples.
        
        Returns:
            Dict containing schema content and examples
        """
        try:
            response = await self.client.post("/get_schema_help", json={})
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"MCP server returned error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Error communicating with MCP server: {str(e)}")
    
    async def get_schema_content(self, resource_name: str = "schema_summary") -> Dict[str, Any]:
        """Get the content of schema resources.
        
        Args:
            resource_name: Which resource to read. Options: "schema_summary", "example_queries", "ontology"
            
        Returns:
            Dict containing the resource content and metadata
        """
        try:
            response = await self.client.post(
                "/get_schema_content", 
                json={"resource_name": resource_name}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise Exception(f"MCP server returned error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Error communicating with MCP server: {str(e)}")
    
    async def close(self):
        """Close the HTTP client session."""
        await self.client.aclose()
```

## Using the MCP Client in AI Tools

```python
# mcp/tools/sparql.py

from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

from ...mcp.client import MCPClient, MCPClientConfig

# Initialize the MCP client
mcp_config = MCPClientConfig(
    base_url="http://localhost:8000",  # Adjust to your MCP server URL
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
)
mcp_client = MCPClient(mcp_config)

async def query_transactions_by_date_range(
    start_date: str, 
    end_date: str, 
    transaction_type: str = "all"
) -> Dict[str, Any]:
    """Get financial transactions within a specific date range."""
    
    # Build transaction type filter
    type_filter = ""
    if transaction_type != "all":
        type_filter = f"""
        FILTER(?transaction_type = "{transaction_type}")
        """
    
    # Construct SPARQL query
    query = f"""
    PREFIX exs: <https://static.rwpz.net/spendcast/schema#>
    PREFIX ex: <https://static.rwpz.net/spendcast/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?transaction ?amount ?date ?merchant ?transaction_type WHERE {{
      # Get transactions in date range
      ?transaction a exs:FinancialTransaction ;
        exs:hasTransactionDate ?date ;
        exs:transactionType ?transaction_type ;
        exs:hasMonetaryAmount ?amount_uri .
        
      ?amount_uri exs:hasAmount ?amount .
      
      # Get merchant information
      OPTIONAL {{
        ?transaction exs:hasParticipant ?payeeRole .
        ?payeeRole a exs:Payee ;
          exs:isPlayedBy ?merchant .
        ?merchant rdfs:label ?merchant_label .
      }}
      
      FILTER(?date >= "{start_date}"^^xsd:date && ?date <= "{end_date}"^^xsd:date)
      {type_filter}
    }}
    ORDER BY DESC(?date)
    """
    
    try:
        # Use the validated version for better error messages
        result = await mcp_client.execute_sparql_validated(query)
        
        # Transform the results into a more usable format
        transactions = []
        for binding in result.get("results", {}).get("bindings", []):
            transactions.append({
                "id": binding.get("transaction", {}).get("value", "").split("/")[-1],
                "amount": float(binding.get("amount", {}).get("value", 0)),
                "date": binding.get("date", {}).get("value", ""),
                "merchant": binding.get("merchant_label", {}).get("value", "Unknown"),
                "type": binding.get("transaction_type", {}).get("value", "")
            })
        
        return {
            "status": "success",
            "data": transactions,
            "period": {
                "start_date": start_date,
                "end_date": end_date
            },
            "count": len(transactions)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
```

## Error Handling

```python
# mcp/tools/parser.py

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator

class MCPError(Exception):
    """Exception raised for MCP-related errors."""
    
    def __init__(self, message: str, status_code: int = None, details: Any = None):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

class SPARQLResult(BaseModel):
    """Model for SPARQL query results."""
    
    status: str = Field(..., description="Success or error status")
    data: Optional[List[Dict[str, Any]]] = Field(None, description="Query results if successful")
    message: Optional[str] = Field(None, description="Error message if failed")
    
    @validator("status")
    def status_must_be_valid(cls, v):
        if v not in ["success", "error"]:
            raise ValueError("Status must be 'success' or 'error'")
        return v
    
    @property
    def is_success(self) -> bool:
        return self.status == "success"
    
    @property
    def is_error(self) -> bool:
        return self.status == "error"

def parse_sparql_results(result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Parse raw SPARQL results into a more usable format.
    
    Args:
        result: Raw SPARQL results from the MCP server
        
    Returns:
        List of dictionaries with parsed results
    """
    parsed_results = []
    
    bindings = result.get("results", {}).get("bindings", [])
    for binding in bindings:
        item = {}
        for var, value in binding.items():
            # Extract actual value based on type
            if value["type"] == "uri":
                # For URIs, extract the last part after the last '/'
                uri_parts = value["value"].split("/")
                item[var] = uri_parts[-1]
            elif value["type"] == "literal":
                # Check if there's a datatype
                if "datatype" in value:
                    # Handle different datatypes
                    if value["datatype"].endswith("#decimal"):
                        item[var] = float(value["value"])
                    elif value["datatype"].endswith("#integer"):
                        item[var] = int(value["value"])
                    elif value["datatype"].endswith("#boolean"):
                        item[var] = value["value"].lower() == "true"
                    else:
                        item[var] = value["value"]
                else:
                    item[var] = value["value"]
            else:
                item[var] = value["value"]
        parsed_results.append(item)
    
    return parsed_results
```

## Integration with OpenRouter Tool Functions

The MCP client tools can be easily integrated into the OpenRouter function definitions:

```python
# ai/tools/registry.py

from typing import List, Dict, Any
from ...mcp.tools.sparql import (
    query_transactions_by_date_range,
    query_spending_by_category,
    query_product_nutrition_info
)

# Define the AI tools that will be registered with OpenRouter
FUNCTION_TOOLS = [
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
    # Additional tool definitions...
]

# Map function names to their implementation
FUNCTION_HANDLERS = {
    "query_transactions_by_date_range": query_transactions_by_date_range,
    "query_spending_by_category": query_spending_by_category,
    "query_product_nutrition_info": query_product_nutrition_info,
    # Additional functions...
}

async def execute_function(function_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a function by name with the provided arguments.
    
    Args:
        function_name: Name of the function to execute
        arguments: Arguments to pass to the function
        
    Returns:
        Result of the function execution
    """
    if function_name not in FUNCTION_HANDLERS:
        return {
            "status": "error",
            "message": f"Unknown function: {function_name}"
        }
    
    handler = FUNCTION_HANDLERS[function_name]
    try:
        result = await handler(**arguments)
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error executing function {function_name}: {str(e)}"
        }
```

This MCP client implementation provides a clean interface for interacting with the MCP server, handling queries, parsing results, and managing errors.
