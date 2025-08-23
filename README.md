# FrogDisKonto
Challenge Repository for BärnHäckt 2025

## Project Structure

This project consists of the following components:

- **Backend**: Python-based FastAPI service that processes queries through an MCP (Model Context Protocol) server.
  - For detailed setup and usage instructions, see the [Backend README](/backend/README.md).

## Development

### Pre-commit Hooks

This project uses pre-commit hooks to maintain code quality. To set up pre-commit hooks:

1. Install pre-commit:
   ```bash
   pip install pre-commit
   # Or with uv
   uv add pre-commit
   ```

2. Install the git hooks:
   ```bash
   pre-commit install
   ```

3. (Optional) Run hooks against all files:
   ```bash
   pre-commit run --all-files
   ```

The pre-commit configuration includes:
- Code formatting (Black)
- Linting (Ruff)
- Type checking (mypy)
- Basic file checks (trailing whitespace, YAML validation, etc.)
