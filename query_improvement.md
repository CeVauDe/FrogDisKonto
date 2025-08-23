# Approaches for Guiding the Chatbot to Query GraphDB Effectively

This document outlines various approaches to improve how our chatbot queries the GraphDB to answer user questions effectively.

## 1. Intent-Based Query Templates

**Approach**: Create a set of pre-defined query templates based on common user intents.

### Implementation Steps

1. **Define Core Intents**:
   - Account information (balances, details, history)
   - Transaction analysis (recent, by merchant, by category)
   - Spending patterns (monthly summaries, comparisons)
   - Budget insights (overspending areas, savings opportunities)
   - Receipt details (itemized purchases, product categories)

2. **Create Template Structure**:
   - Template ID: Unique identifier
   - Intent patterns: List of regex/phrase patterns that match this intent
   - Required parameters: Entity values needed to complete the query
   - Optional parameters: Additional filters that can be applied
   - SPARQL template: Parameterized query with placeholders
   - Response template: How to format the results

3. **Parameter Extraction Logic**:
   - Date ranges: Extract and normalize temporal expressions
   - Amounts: Identify and convert monetary values
   - Categories: Map mentioned categories to ontology concepts
   - Merchants: Entity recognition for business names
   - Products: Link product mentions to database entities

4. **Template Registry**:
   - Centralized JSON file containing all templates
   - Versioning system for template updates
   - Testing framework to validate templates

### Example Templates

```json
{
  "template_id": "account_balance",
  "intent_patterns": ["balance", "how much (money|cash) (do I have|is in)", "what('s| is) my .* balance"],
  "required_parameters": ["account_type"],
  "optional_parameters": [],
  "sparql_template": "SELECT ?account ?balance ?currency WHERE { ?person exs:hasName 'Jeanine Marie Blumenthal'. ?person exs:hasAccount ?account. ?account a exs:{{account_type}}. ?account exs:hasInitialBalance ?balance. ?account exs:hasCurrency ?currency. }",
  "response_template": "Your {{account_type_readable}} balance is {{balance}} {{currency}}."
}
```

```json
{
  "template_id": "category_spending",
  "intent_patterns": ["spend on", "how much .* (spent|cost)", "expenses for"],
  "required_parameters": ["category", "time_period"],
  "optional_parameters": ["min_amount", "max_amount"],
  "sparql_template": "SELECT (SUM(?amount) as ?total) WHERE { ?person exs:hasName 'Jeanine Marie Blumenthal'. ?person exs:hasAccount ?account. ?transaction exs:hasParticipant ?payerRole. ?payerRole a exs:Payer. ?payerRole exs:isPlayedBy ?account. ?transaction exs:hasMonetaryAmount ?amount_uri. ?amount_uri exs:hasAmount ?amount. ?transaction exs:hasTransactionDate ?date. ?transaction exs:hasReceipt ?receipt. ?receipt exs:hasLineItem ?lineItem. ?lineItem exs:hasProduct ?product. ?product exs:category ?category. ?category rdfs:label ?category_label. FILTER(?date >= '{{time_period.start}}'^^xsd:date && ?date <= '{{time_period.end}}'^^xsd:date) FILTER(CONTAINS(LCASE(?category_label), '{{category}}')) }",
  "response_template": "You spent {{total}} on {{category}} between {{time_period.start_readable}} and {{time_period.end_readable}}."
}
```

### Implementation Workflow

1. User query enters system
2. NLP preprocessing (tokenization, entity extraction)
3. Intent matching against patterns
4. Parameter extraction from query
5. Template selection based on intent and available parameters
6. Parameter validation and normalization
7. SPARQL template population
8. Query execution against GraphDB
9. Result formatting using response template
10. Response delivery to user

### Open Questions

1. **Parameter Extraction Complexity**: How sophisticated should our NLP be for extracting date ranges, categories, and other parameters?
2. **Template Prioritization**: How to handle cases where multiple templates match a query with different confidence levels?
3. **Missing Parameters**: Should we prompt the user for missing required parameters or make assumptions?
4. **Template Maintenance**: How to efficiently update templates as the database schema evolves?
5. **Fallback Mechanism**: What strategy to use when no templates match the user query?
6. **Template Performance**: How to optimize templates for query performance with large datasets?
7. **Template Discovery**: Should the system learn new templates from successful queries over time?

## 2. Multi-Stage Conversation Flow

**Approach**: Break down complex queries into a conversation flow.

**Implementation**:
- Start with a broad query to establish context
- Ask follow-up questions to refine the query parameters
- Build the SPARQL query progressively
- Use memory/context tracking to maintain state across the conversation

**Example**:
```
User: "How much did I spend last month?"
Bot: [Executes broad spending query]
     "You spent 1,234 CHF last month. Would you like to see the breakdown by category?"
User: "Yes please"
Bot: [Executes category breakdown query using the same date range]
     "Here's your spending by category: Food: 430 CHF, Transport: 120 CHF..."
```

## 3. Knowledge Graph Navigation Prompting

**Approach**: Guide the LLM to "think through" how to navigate the knowledge graph structure.

**Implementation**:
- Embed the schema knowledge in the system prompt
- Include explicit reasoning steps in the prompt
- Teach the LLM to first identify entities, then relationships, then constraints
- Have the LLM verbalize its query strategy before execution

**Example System Prompt Enhancement**:
```
"When answering financial questions, remember to:
1. Identify the primary entity (person, account, transaction)
2. Determine the relationships to explore (has account, has transaction)
3. Apply any filters (date ranges, merchants, categories)
4. For complex questions, break them down into multiple SPARQL queries"
```

## 4. Query Decomposition and Composition

**Approach**: Break complex questions into simpler subqueries, then compose the results.

**Implementation**:
- Decompose user questions into atomic subquestions
- Generate separate SPARQL queries for each subquestion
- Execute queries in sequence or parallel
- Compose the results into a cohesive answer

**Example**:
```
User: "How does my spending on groceries this month compare to last month?"

Subquery 1: Get grocery spending this month
Subquery 2: Get grocery spending last month
Result composition: Calculate difference and present comparison
```

## 5. Step-by-Step Query Building with Explanations

**Approach**: Have the chatbot explain its query-building process to the user.

**Implementation**:
- Design the chatbot to show its "thinking" in plain language
- Provide step-by-step explanations of how it's searching for information
- Increase transparency in how it interprets the user's request

**Example**:
```
User: "What did I spend at Migros last week?"

Bot: "I'll help you find your Migros purchases from last week.
1. First, I'm looking up your accounts
2. Now I'm searching for transactions where the merchant is Migros
3. I'm filtering for just last week (Aug 16-22, 2025)
4. I found 3 transactions totaling 87.30 CHF"
```

## 6. Guided Schema Exploration

**Approach**: Use the schema structure to guide the chatbot in exploring relevant data paths.

**Implementation**:
- Load schema details into the context
- Use schema relationships to determine appropriate query paths
- Start with high-level entities and traverse to related entities based on the question

**Example**:
```
User: "Show me my food expenses"

Bot's reasoning (internal):
1. User wants expenses (transactions) related to food
2. From schema I know: Person -> hasAccount -> Account -> (as Payer in) Transaction -> hasReceipt -> Receipt -> hasLineItem -> hasProduct -> hasCategory
3. I need to filter categories related to food (e.g., fruits, meat, dairy)
```

## 7. Few-Shot Examples in System Prompt

**Approach**: Include examples of user questions and corresponding SPARQL queries in the system prompt.

**Implementation**:
- Add diverse examples covering different types of financial questions
- Show the mapping between natural language and SPARQL
- Include both simple and complex query examples

**Example**:
```
User question: "What's my checking account balance?"
SPARQL: "SELECT ?balance WHERE { ?person exs:hasName 'Jeanine Marie Blumenthal'. ?person exs:hasAccount ?account. ?account a exs:CheckingAccount. ?account exs:hasInitialBalance ?balance }"

User question: "How much did I spend on groceries last month?"
SPARQL: "SELECT (SUM(?amount) as ?total) WHERE { ... }"
```

## 8. Progressive Knowledge Accumulation

**Approach**: Build up domain knowledge through conversation by remembering previous queries and results.

**Implementation**:
- Store previous queries and their results in conversation memory
- Reference previous findings in subsequent queries
- Use accumulated knowledge to enhance future responses

**Example**:
```
User: "What's my savings account number?"
Bot: [Queries and finds savings account details]
     "Your savings account number is CH93 0076 2011 6238 5295 7."

User: "How much interest did I earn on it last year?"
Bot: [Uses previously identified account to query interest transactions]
     "Your savings account CH93 0076 earned 351.21 CHF in interest last year."
```

## 9. Interactive Query Refinement

**Approach**: Allow users to refine queries through conversation.

**Implementation**:
- Present initial results with options for refinement
- Offer specific parameters the user can adjust
- Maintain query context across conversation turns

**Example**:
```
User: "Show me my transactions"
Bot: "I found 120 transactions. Would you like to filter by:
     1. Time period (e.g., last week)
     2. Merchant (e.g., Migros)
     3. Category (e.g., groceries)
     4. Amount (e.g., over 100 CHF)"

User: "Show me just groceries"
Bot: [Refines previous query to filter by grocery categories]
```

## 10. Hybrid Template and Generation Approach

**Approach**: Combine template-based and generative approaches.

**Implementation**:
- Start with templates for common queries
- Use the LLM to modify templates for unique user questions
- Fall back to full SPARQL generation for novel queries
- Validate generated queries before execution

**Example**:
```
User: "How much did I spend on transportation in June?"
Bot: [Identifies this as a "category_spending" template with parameters:
     - category = transportation
     - timeframe = June 2025
     Then fills in the template and executes the query]
```

## Implementation Considerations

1. **Validation Logic**: Implement validation of generated SPARQL to prevent errors
2. **Error Handling**: Have fallback strategies when queries don't return expected results
3. **Context Management**: Track conversation context to build on previous queries
4. **Query Efficiency**: Optimize queries to avoid performance issues with large datasets
5. **User Feedback Loop**: Incorporate user feedback to improve query accuracy over time
