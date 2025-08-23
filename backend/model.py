from pydantic import BaseModel, RootModel


class Intent(BaseModel):
    name: str
    description: str
    example_queries: list[str]
    required_parameters: list[str]
    optional_parameters: list[str]
    sparql_template: str
    response_template: str


class Intents(RootModel):
    root: list[Intent]
