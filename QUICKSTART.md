# Quick Start Guide

This guide will help you get started with the Data Contract Skill in just a few minutes.

## Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Requires Node.js 18 or higher

2. **Clone and setup**
   ```bash
   git clone https://github.com/dataGriff/datacontract.skill.git
   cd datacontract.skill
   npm install
   ```

3. **Configure your AI assistant** (Claude, Cline, etc.)
   
   Add to your MCP settings:
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

## Basic Usage

### Create Your First Data Contract

Ask your AI assistant:

> "Create a data contract for a users table with these fields: user_id (string, primary key), email (string, required), name (string), created_at (timestamp)"

The AI will use the `create_data_contract` tool to generate a valid ODCS contract.

### Validate a Contract

> "Validate the data contract at contracts/users.yaml"

### Update a Contract

> "Update the contract at contracts/users.yaml to change status to 'active'"

### Add Quality Checks

Quality checks in ODCS are defined at the schema field level. Example:

> "Create a data contract with quality checks for null values and duplicates"

## Common Tasks

### Task 1: Create a Complete Contract

```
Create a data contract named "customer_orders" in the sales domain with:
- Schema: order_id (string, primary), customer_id (string), amount (decimal), order_date (timestamp)
- Server: BigQuery, project "my-project", dataset "sales"
- SLA: latency 1000ms, uptime 99.9%
- Output: contracts/orders.yaml
```

### Task 2: Export to Different Format

```
Create the same contract but output as JSON instead of YAML
```

### Task 3: Validate with CLI

First ensure datacontract CLI is installed:
```bash
pip install datacontract-cli
```

Then ask:
```
Validate the contract at contracts/orders.yaml using both JSON schema and CLI validation
```

### Task 4: Test Data Quality

```
Execute datacontract CLI test command on contracts/orders.yaml
```

### Task 5: Detect Breaking Changes

```
Execute datacontract CLI breaking command comparing contracts/orders-v1.yaml and contracts/orders-v2.yaml
```

## Example Contracts

Check the `examples/` directory for complete examples:
- `orders.yaml` - E-commerce orders with BigQuery
- `customers.yaml` - Customer data with PostgreSQL
- `products.json` - Product catalog with MongoDB (JSON format)

## Tips

1. **Start Simple**: Begin with just required fields (name and status), then add more details
2. **Validate Often**: Use validation after creating or updating contracts
3. **Use Examples**: Copy and modify the example contracts for your needs
4. **Server Types**: Common types include bigquery, postgresql, snowflake, s3, kafka
5. **Schema Types**: Use standard types like string, integer, decimal, boolean, timestamp, date

## Available CLI Commands

When using `execute_datacontract_cli`:

- `test` - Test data contract against actual data
- `lint` - Check contract for best practices
- `export` - Export to various formats (dbt, SQL, etc.)
- `breaking` - Detect breaking changes between versions
- `diff` - Show differences between contracts
- `changelog` - Generate changelog

## Troubleshooting

### "datacontract CLI not found"
Install with: `pip install datacontract-cli`

### "Server validation failed"
Check that required fields for your server type are provided. For example:
- PostgreSQL requires: server, host, port, database, schema
- BigQuery requires: server, type, project, dataset

### "Schema validation failed"
Ensure your contract matches ODCS structure. Required root fields are:
- apiVersion
- kind
- id
- version
- status

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- Check out the [Open Data Contract Standard](https://bitol-io.github.io/open-data-contract-standard/latest/)
- Try the [datacontract CLI](https://cli.datacontract.com/)

## Support

- GitHub Issues: [Report a bug or request a feature](https://github.com/dataGriff/datacontract.skill/issues)
- ODCS Community: [Join discussions](https://github.com/bitol-io/open-data-contract-standard/discussions)
