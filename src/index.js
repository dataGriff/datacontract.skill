#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createDataContract } from "./tools/create-contract.js";
import { updateDataContract } from "./tools/update-contract.js";
import { validateDataContract } from "./tools/validate-contract.js";
import { executeDataContractCli } from "./tools/cli-wrapper.js";

const server = new Server(
  {
    name: "datacontract-skill",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_data_contract",
        description:
          "Create a new data contract following the Open Data Contract Standard (ODCS). Generates a YAML or JSON data contract file with the specified properties including metadata, schema definitions, quality checks, and SLOs.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Name of the data contract",
            },
            description: {
              type: "string",
              description: "Description of the data contract",
            },
            domain: {
              type: "string",
              description: "Logical data domain",
            },
            schema: {
              type: "array",
              description: "Array of schema objects defining the data structure",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Column/field name",
                  },
                  type: {
                    type: "string",
                    description: "Data type (e.g., string, integer, boolean)",
                  },
                  description: {
                    type: "string",
                    description: "Description of the field",
                  },
                  required: {
                    type: "boolean",
                    description: "Whether the field is required",
                  },
                },
              },
            },
            outputPath: {
              type: "string",
              description: "Output file path (default: datacontract.yaml)",
            },
            format: {
              type: "string",
              enum: ["yaml", "json"],
              description: "Output format (default: yaml)",
            },
            apiVersion: {
              type: "string",
              description: "ODCS API version (default: v3.1.0)",
            },
            status: {
              type: "string",
              description: "Status of the contract (e.g., draft, active)",
            },
            servers: {
              type: "array",
              description: "List of server configurations",
              items: {
                type: "object",
              },
            },
            slaProperties: {
              type: "array",
              description: "Service Level Agreement properties",
              items: {
                type: "object",
              },
            },
          },
          required: ["name"],
        },
      },
      {
        name: "update_data_contract",
        description:
          "Update an existing data contract. Can modify specific fields, add/remove schema elements, update quality checks, or modify any other contract properties. Preserves existing fields not specified in the update.",
        inputSchema: {
          type: "object",
          properties: {
            contractPath: {
              type: "string",
              description: "Path to the existing data contract file",
            },
            updates: {
              type: "object",
              description:
                "Object containing the fields to update with their new values",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                domain: { type: "string" },
                status: { type: "string" },
                schema: { type: "array" },
                slaProperties: { type: "array" },
                servers: { type: "array" },
              },
            },
            outputPath: {
              type: "string",
              description:
                "Output file path (default: overwrites the original file)",
            },
          },
          required: ["contractPath", "updates"],
        },
      },
      {
        name: "validate_data_contract",
        description:
          "Validate a data contract against the Open Data Contract Standard (ODCS) JSON schema. Checks for schema compliance, required fields, and proper structure. Can also use the datacontract CLI for additional validation if available.",
        inputSchema: {
          type: "object",
          properties: {
            contractPath: {
              type: "string",
              description: "Path to the data contract file to validate",
            },
            useCliValidation: {
              type: "boolean",
              description:
                "Use datacontract CLI for validation if available (default: false)",
            },
            schemaUrl: {
              type: "string",
              description:
                "Custom ODCS schema URL (default: uses latest from GitHub)",
            },
          },
          required: ["contractPath"],
        },
      },
      {
        name: "execute_datacontract_cli",
        description:
          "Execute datacontract CLI commands for advanced operations like testing, linting, exporting, and breaking change detection. Requires the datacontract CLI to be installed (pip install datacontract-cli). See https://cli.datacontract.com/ for available commands.",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description:
                "CLI command to execute (e.g., 'test', 'lint', 'export', 'breaking')",
            },
            contractPath: {
              type: "string",
              description: "Path to the data contract file",
            },
            args: {
              type: "array",
              description: "Additional command arguments",
              items: {
                type: "string",
              },
            },
            installIfMissing: {
              type: "boolean",
              description:
                "Automatically install datacontract CLI if not found (default: true)",
            },
          },
          required: ["command", "contractPath"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "create_data_contract":
        return await createDataContract(args);

      case "update_data_contract":
        return await updateDataContract(args);

      case "validate_data_contract":
        return await validateDataContract(args);

      case "execute_datacontract_cli":
        return await executeDataContractCli(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Data Contract MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
