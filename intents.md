# Core Intents for Financial Chatbot

This document outlines the core intents derived from the Spendcast MCP data structure. These intents represent the key user queries that would be most valuable for a financial chatbot.

## Account Management Intents

### 1. Account Overview
- **Intent**: To retrieve a summary of all accounts owned by the customer
- **Example queries**: "Show me all my accounts", "What accounts do I have?"
- **Data accessed**: Account types, balances, account numbers, currencies
- **Template parameters**: {customer_id}, {account_type?}

### 2. Account Balance Check
- **Intent**: To check the balance of a specific account
- **Example queries**: "What's my checking account balance?", "How much money do I have in savings?"
- **Data accessed**: Account balances, currency information
- **Template parameters**: {account_id}, {account_type}

### 3. Account Details
- **Intent**: To get detailed information about a specific account
- **Example queries**: "Tell me about my credit card", "Show my account details"
- **Data accessed**: Account numbers, IBANs, account providers, overdraft limits
- **Template parameters**: {account_id}, {detail_type?}

## Transaction Analysis Intents

### 4. Recent Transactions
- **Intent**: To view recent financial activities across accounts
- **Example queries**: "Show my recent transactions", "What were my last 5 purchases?"
- **Data accessed**: Transaction dates, amounts, merchants, descriptions
- **Template parameters**: {time_period?}, {limit?}, {account_id?}

### 5. Merchant Transactions
- **Intent**: To find transactions with specific merchants
- **Example queries**: "Show my transactions at Migros", "How much have I spent at Amazon?"
- **Data accessed**: Merchant names, transaction amounts, dates
- **Template parameters**: {merchant_name}, {time_period?}

### 6. Transaction Search
- **Intent**: To find specific transactions based on multiple criteria
- **Example queries**: "Find transactions over 100 CHF", "Show my grocery purchases last month"
- **Data accessed**: Transaction amounts, categories, dates, descriptions
- **Template parameters**: {amount_min?}, {amount_max?}, {category?}, {date_range?}, {description?}

## Spending Analysis Intents

### 7. Merchant Spending Analysis
- **Intent**: To analyze spending patterns by merchant
- **Example queries**: "Where do I spend the most money?", "Which store costs me the most each month?"
- **Data accessed**: Merchant information, transaction amounts, frequencies
- **Template parameters**: {time_period}, {top_n?}, {min_transactions?}

### 8. Time-based Spending
- **Intent**: To analyze spending over specific time periods
- **Example queries**: "How much did I spend last month?", "Compare my spending between January and February"
- **Data accessed**: Transaction dates, amounts, categories
- **Template parameters**: {time_period1}, {time_period2?}, {category?}, {account_id?}

### 9. Recurring Expenses
- **Intent**: To identify and analyze regular expenses
- **Example queries**: "What are my monthly subscriptions?", "Show my recurring payments"
- **Data accessed**: Transaction patterns, frequencies, merchants, amounts
- **Template parameters**: {frequency}, {min_occurrences?}, {category?}

## Product & Category Analysis Intents

### 10. Category Spending
- **Intent**: To analyze spending by product category
- **Example queries**: "How much do I spend on groceries?", "What's my food budget look like?"
- **Data accessed**: Product categories, transaction amounts, date ranges
- **Template parameters**: {category}, {time_period?}, {account_id?}

### 11. Product Purchase History
- **Intent**: To find purchase history for specific products
- **Example queries**: "When did I last buy coffee?", "How often do I purchase milk?"
- **Data accessed**: Product details, receipts, purchase dates
- **Template parameters**: {product_name}, {time_period?}, {merchant?}

### 12. Category Comparison
- **Intent**: To compare spending across different categories
- **Example queries**: "Do I spend more on food or transportation?", "Compare my grocery and restaurant spending"
- **Data accessed**: Category hierarchies, transaction amounts, time periods
- **Template parameters**: {category1}, {category2}, {time_period?}

## Financial Insights Intents

### 13. Spending Trends
- **Intent**: To identify spending trends over time
- **Example queries**: "How has my spending changed this year?", "Am I spending more or less on entertainment?"
- **Data accessed**: Historical transaction data, categories, time series
- **Template parameters**: {time_period1}, {time_period2}, {category?}

### 14. Largest Expenses
- **Intent**: To identify the largest individual expenses
- **Example queries**: "What was my biggest purchase last month?", "Show my largest transactions"
- **Data accessed**: Transaction amounts, dates, merchants
- **Template parameters**: {time_period?}, {top_n?}, {category?}

### 15. Spending Anomalies
- **Intent**: To identify unusual spending patterns
- **Example queries**: "Any unusual transactions recently?", "Have I spent more than normal on food?"
- **Data accessed**: Transaction amounts, historical patterns, standard deviations
- **Template parameters**: {time_period?}, {threshold?}, {category?}

## Payment Method Analysis Intents

### 16. Card Usage
- **Intent**: To analyze payment card usage patterns
- **Example queries**: "How often do I use my Visa card?", "Which card do I use most for shopping?"
- **Data accessed**: Payment card details, transaction frequencies, merchants
- **Template parameters**: {card_id?}, {merchant_type?}, {time_period?}

### 17. International Transactions
- **Intent**: To analyze foreign currency transactions
- **Example queries**: "Show my spending abroad", "What exchange rates did I get in my foreign purchases?"
- **Data accessed**: Currency conversions, exchange rates, transaction locations
- **Template parameters**: {currency?}, {time_period?}, {country?}

## Budget & Planning Intents

### 18. Monthly Summary
- **Intent**: To provide a comprehensive monthly financial summary
- **Example queries**: "Summarize my finances for March", "Give me a monthly overview"
- **Data accessed**: All transactions, categories, balances for a period
- **Template parameters**: {month}, {year?}, {include_balance?}

### 19. Average Spending
- **Intent**: To calculate average spending in various categories
- **Example queries**: "What's my average grocery bill?", "How much do I typically spend on restaurants?"
- **Data accessed**: Transaction amounts, categories, statistical averages
- **Template parameters**: {category}, {time_period?}, {frequency?}

### 20. Balance Projection
- **Intent**: To project account balances based on recurring transactions
- **Example queries**: "How much will I have at the end of the month?", "Project my balance for next week"
- **Data accessed**: Current balances, scheduled transactions, recurring patterns
- **Template parameters**: {account_id}, {projection_date}, {include_pending?}

## Implementation Example

Each of these core intents can be implemented as a template with:

1. An intent identifier (e.g., `account_overview`, `transaction_search`)
2. Recognition patterns to match user queries
3. Required and optional parameters to extract
4. SPARQL query templates with parameter placeholders
5. Response formatting instructions

For example, the SPARQL template for the "Recent Transactions" intent might look like:

```sparql
PREFIX exs: <https://static.rwpz.net/spendcast/schema#>
PREFIX ex: <https://static.rwpz.net/spendcast/>

SELECT ?transaction ?date ?amount ?merchant ?description
WHERE {
  # Find the customer
  ?customer exs:hasName "{{customer_name}}" .

  # Get their accounts
  ?customer exs:hasAccount ?account .
  {{#if account_type}}
  ?account a exs:{{account_type}} .
  {{/if}}

  # Find transactions
  ?transaction a exs:FinancialTransaction .
  ?transaction exs:hasParticipant ?payerRole .
  ?payerRole a exs:Payer .
  ?payerRole exs:isPlayedBy ?account .

  # Get transaction details
  ?transaction exs:hasMonetaryAmount ?amount_uri .
  ?amount_uri exs:amount ?amount .
  ?transaction exs:hasTransactionDate ?date .

  # Optional transaction description
  OPTIONAL { ?transaction rdfs:label ?description }

  # Get merchant information
  ?transaction exs:hasParticipant ?payeeRole .
  ?payeeRole a exs:Payee .
  ?payeeRole exs:isPlayedBy ?merchant .
  ?merchant rdfs:label ?merchant_name .

  {{#if time_period}}
  FILTER(?date >= "{{time_period.start}}"^^xsd:date && ?date <= "{{time_period.end}}"^^xsd:date)
  {{/if}}
}
ORDER BY DESC(?date)
LIMIT {{limit|default:10}}
```

These core intents provide a comprehensive framework for implementing an intent-based query system for the financial chatbot, leveraging the rich data structure available in the Spendcast MCP.
