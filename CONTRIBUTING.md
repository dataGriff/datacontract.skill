# Contributing to Data Contract Skill

Thank you for your interest in contributing to the Data Contract Skill!

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/dataGriff/datacontract.skill.git
cd datacontract.skill
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Install datacontract CLI for full functionality:
```bash
pip install datacontract-cli
```

## Project Structure

```
datacontract.skill/
├── src/
│   ├── index.js                  # Main MCP server entry point
│   └── tools/
│       ├── create-contract.js    # Contract creation logic
│       ├── update-contract.js    # Contract update logic
│       ├── validate-contract.js  # Contract validation logic
│       └── cli-wrapper.js        # datacontract CLI wrapper
├── examples/                     # Example data contracts
├── package.json
└── README.md
```

## Testing

### Manual Testing

You can test the tools directly using Node.js:

```javascript
import { createDataContract } from './src/tools/create-contract.js';

const result = await createDataContract({
  name: "test-contract",
  status: "draft",
  outputPath: "/tmp/test.yaml"
});
console.log(result);
```

### Testing with MCP Inspector

Use the [MCP Inspector](https://github.com/modelcontextprotocol/inspector) to test the MCP server:

```bash
npx @modelcontextprotocol/inspector node src/index.js
```

## Making Changes

1. Create a new branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the coding style:
   - Use ES6+ features
   - Follow existing code patterns
   - Add JSDoc comments for functions
   - Handle errors gracefully

3. Test your changes:
   - Test each tool function manually
   - Validate contracts against ODCS schema
   - Ensure backward compatibility

4. Commit your changes:
```bash
git add .
git commit -m "Description of your changes"
```

5. Push and create a pull request:
```bash
git push origin feature/your-feature-name
```

## Coding Standards

### JavaScript Style
- Use ES6 modules (`import`/`export`)
- Use `async`/`await` for asynchronous code
- Use descriptive variable and function names
- Keep functions focused and single-purpose

### Error Handling
- Always catch and handle errors
- Provide helpful error messages
- Return structured error responses

### Documentation
- Document all public functions with JSDoc
- Include parameter types and descriptions
- Provide usage examples in README

## Adding New Tools

To add a new tool to the MCP server:

1. Create a new file in `src/tools/`:
```javascript
// src/tools/new-tool.js
export async function newTool(args) {
  // Implementation
  return {
    content: [{
      type: "text",
      text: "Result"
    }]
  };
}
```

2. Register the tool in `src/index.js`:
```javascript
import { newTool } from "./tools/new-tool.js";

// In ListToolsRequestSchema handler:
{
  name: "new_tool",
  description: "Description",
  inputSchema: {
    // Schema definition
  }
}

// In CallToolRequestSchema handler:
case "new_tool":
  return await newTool(args);
```

## Resources

- [Open Data Contract Standard](https://github.com/bitol-io/open-data-contract-standard)
- [ODCS Documentation](https://bitol-io.github.io/open-data-contract-standard/latest/)
- [datacontract CLI](https://cli.datacontract.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Questions?

If you have questions or need help:
- Open an issue on GitHub
- Check existing issues for similar questions
- Review the [README.md](README.md) for usage examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
