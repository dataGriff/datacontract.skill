# Data Contract Skill

An MCP (Model Context Protocol) server skill for creating, updating, and validating data contracts using the [Open Data Contract Standard (ODCS)](https://github.com/bitol-io/open-data-contract-standard).

## Features

- ✅ **Create** new data contracts following ODCS v3.1.0
- ✅ **Update** existing data contracts with automatic version bumping
- ✅ **Validate** contracts against ODCS JSON schema
- ✅ **CLI Integration** with [datacontract-cli](https://cli.datacontract.com/)
- ✅ Support for both YAML and JSON formats
- ✅ Comprehensive schema definition support
- ✅ Quality checks and SLO configuration

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Python 3.8+ for datacontract CLI features

### Install Dependencies

```bash
npm install
```

### Install datacontract CLI (Optional)

For advanced CLI features like testing, linting, and breaking change detection:

```bash
pip install datacontract-cli
```

## Configuration

Add this server to your MCP settings configuration file:

### For Claude Desktop (MacOS)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datacontract": {
      "command": "node",
      "args": ["/absolute/path/to/datacontract.skill/src/index.js"]
    }
  }
}
```

### For Claude Desktop (Windows)

Edit `%APPDATA%/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "datacontract": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\datacontract.skill\\src\\index.js"]
    }
  }
}
```

### For Cline VSCode Extension

Edit your Cline MCP settings:

```json
{
  "mcpServers": {
    "datacontract": {
      "command": "node",
      "args": ["/absolute/path/to/datacontract.skill/src/index.js"]
    }
  }
}
```

## Available Tools

### 1. create_data_contract

Create a new data contract following the Open Data Contract Standard.

**Parameters:**
- `name` (required): Name of the data contract
- `description`: Description/purpose of the contract
- `domain`: Logical data domain
- `schema`: Array of schema objects defining data structure
- `outputPath`: Output file path (default: `datacontract.yaml`)
- `format`: Output format - "yaml" or "json" (default: "yaml")
- `apiVersion`: ODCS API version (default: "v3.1.0")
- `status`: Contract status (default: "draft")
- `servers`: List of server configurations
- `quality`: Quality requirements and checks
- `slo`: Service Level Objectives

**Example:**
```javascript
{
  "name": "orders",
  "description": "Order transactions data",
  "domain": "sales",
  "schema": [
    {
      "name": "order_id",
      "type": "string",
      "description": "Unique order identifier",
      "required": true,
      "primaryKey": true
    },
    {
      "name": "customer_id",
      "type": "string",
      "description": "Customer identifier",
      "required": true
    },
    {
      "name": "order_date",
      "type": "timestamp",
      "description": "Date order was placed",
      "required": true
    },
    {
      "name": "total_amount",
      "type": "decimal",
      "description": "Total order amount",
      "required": true
    }
  ],
  "quality": {
    "type": "SodaCL",
    "specification": "checks for orders:\n  - row_count > 0"
  },
  "outputPath": "contracts/orders.yaml"
}
```

### 2. update_data_contract

Update an existing data contract while preserving unchanged fields.

**Parameters:**
- `contractPath` (required): Path to existing contract file
- `updates` (required): Object containing fields to update
- `outputPath`: Output path (default: overwrites original)

**Example:**
```javascript
{
  "contractPath": "contracts/orders.yaml",
  "updates": {
    "status": "active",
    "description": {
      "purpose": "Updated order transactions data"
    },
    "schema": [
      // Updated schema array
    ]
  }
}
```

### 3. validate_data_contract

Validate a data contract against ODCS JSON schema.

**Parameters:**
- `contractPath` (required): Path to contract file
- `useCliValidation`: Use datacontract CLI for validation (default: false)
- `schemaUrl`: Custom ODCS schema URL

**Example:**
```javascript
{
  "contractPath": "contracts/orders.yaml",
  "useCliValidation": true
}
```

### 4. execute_datacontract_cli

Execute datacontract CLI commands for advanced operations.

**Parameters:**
- `command` (required): CLI command (e.g., "test", "lint", "export", "breaking")
- `contractPath` (required): Path to contract file
- `args`: Additional command arguments
- `installIfMissing`: Auto-install CLI if not found (default: true)

**Available Commands:**
- `test`: Test data quality and structure
- `lint`: Check contract for best practices
- `export`: Export to various formats (dbt, SQL, etc.)
- `breaking`: Detect breaking changes between versions
- `diff`: Show differences between contracts
- `changelog`: Generate changelog

**Example:**
```javascript
{
  "command": "test",
  "contractPath": "contracts/orders.yaml"
}
```

## Usage Examples

### Creating a Simple Data Contract

Ask your AI assistant:
> "Create a data contract for a users table with fields: user_id (string, primary key), email (string, required), name (string), and created_at (timestamp)"

### Updating a Contract Status

> "Update the data contract at contracts/orders.yaml to change status to 'active' and add a quality check"

### Validating a Contract

> "Validate the data contract at contracts/orders.yaml"

### Testing with CLI

> "Run datacontract CLI test on contracts/orders.yaml"

### Exporting to dbt

> "Export the data contract at contracts/orders.yaml to dbt format"

## Open Data Contract Standard

This skill implements the [Open Data Contract Standard (ODCS)](https://bitol-io.github.io/open-data-contract-standard/latest/), which provides:

- Standardized contract structure
- Schema definitions and validation
- Data quality specifications
- Service Level Objectives (SLOs)
- Server and endpoint definitions
- Privacy and security classifications
- Comprehensive metadata

### Contract Structure

A typical ODCS contract includes:

```yaml
apiVersion: v3.1.0
kind: DataContract
id: orders-123456789
name: orders
version: 1.0.0
status: draft
domain: sales
description:
  purpose: Order transaction data
servers:
  - type: bigquery
    dataset: sales
    project: my-project
schema:
  - name: order_id
    type: string
    description: Unique order identifier
    required: true
    primaryKey: true
quality:
  type: SodaCL
  specification: |
    checks for orders:
      - row_count > 0
      - duplicate_count(order_id) = 0
slo:
  - property: latency
    value: 1000
    unit: ms
```

## Development

### Running Locally

```bash
npm start
```

### Project Structure

```
datacontract.skill/
├── src/
│   ├── index.js              # Main MCP server
│   └── tools/
│       ├── create-contract.js    # Create contracts
│       ├── update-contract.js    # Update contracts
│       ├── validate-contract.js  # Validate contracts
│       └── cli-wrapper.js        # CLI integration
├── package.json
└── README.md
```

## Resources

- [Open Data Contract Standard](https://github.com/bitol-io/open-data-contract-standard)
- [ODCS Documentation](https://bitol-io.github.io/open-data-contract-standard/latest/)
- [ODCS JSON Schema](https://github.com/bitol-io/open-data-contract-standard/blob/main/schema/odcs-json-schema-latest.json)
- [datacontract CLI](https://cli.datacontract.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

MIT
