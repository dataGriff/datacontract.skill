import fs from "fs/promises";
import yaml from "js-yaml";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { execSync } from "child_process";

/**
 * Fetch the ODCS schema from GitHub
 */
async function fetchOdcsSchema(schemaUrl) {
  const defaultUrl =
    "https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/main/schema/odcs-json-schema-latest.json";
  const url = schemaUrl || defaultUrl;

  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch schema: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Failed to fetch ODCS schema from ${url}: Request timeout`);
    }
    throw new Error(`Failed to fetch ODCS schema from ${url}: ${error.message}`);
  }
}

/**
 * Validate a data contract using JSON Schema validation
 */
async function validateWithJsonSchema(contract, schemaUrl) {
  const schema = await fetchOdcsSchema(schemaUrl);

  // Note: We use strict: false and strictSchema: false because ODCS uses
  // JSON Schema draft 2019-09 which includes features that AJV's strict mode
  // may flag as warnings. These settings are necessary for ODCS compatibility.
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
    validateFormats: true,
    strictSchema: false,
  });
  addFormats(ajv);

  // Remove the $schema property if present to avoid validation errors
  const schemaToValidate = { ...schema };
  delete schemaToValidate.$schema;

  const validate = ajv.compile(schemaToValidate);
  const valid = validate(contract);

  if (!valid) {
    const errors = validate.errors.map((err) => {
      const path = err.instancePath || "root";
      return `  • ${path}: ${err.message}`;
    });
    return {
      valid: false,
      errors: errors.join("\n"),
    };
  }

  return {
    valid: true,
    message: "Contract is valid according to ODCS schema",
  };
}

/**
 * Validate using datacontract CLI if available
 */
async function validateWithCli(contractPath) {
  try {
    // Check if datacontract CLI is installed
    try {
      execSync("datacontract --version", { stdio: "pipe" });
    } catch {
      return {
        valid: false,
        cliNotFound: true,
        message:
          "datacontract CLI not found. Install with: pip install datacontract-cli",
      };
    }

    // Run validation
    const output = execSync(`datacontract test ${contractPath}`, {
      encoding: "utf-8",
      stdio: "pipe",
    });

    return {
      valid: true,
      message: "CLI validation passed",
      output: output.trim(),
    };
  } catch (error) {
    return {
      valid: false,
      message: "CLI validation failed",
      output: error.stdout || error.message,
    };
  }
}

/**
 * Main validation function
 */
export async function validateDataContract(args) {
  const { contractPath, useCliValidation = false, schemaUrl } = args;

  try {
    // Read the contract file
    const content = await fs.readFile(contractPath, "utf-8");
    let contract;

    // Parse the contract (try YAML first, then JSON)
    try {
      contract = yaml.load(content);
    } catch (yamlError) {
      try {
        contract = JSON.parse(content);
      } catch (jsonError) {
        throw new Error("Failed to parse contract as YAML or JSON");
      }
    }

    let result = {
      jsonSchemaValidation: null,
      cliValidation: null,
    };

    // Always perform JSON Schema validation
    result.jsonSchemaValidation = await validateWithJsonSchema(
      contract,
      schemaUrl
    );

    // Optionally perform CLI validation
    if (useCliValidation) {
      result.cliValidation = await validateWithCli(contractPath);
    }

    // Prepare output
    let output = `📋 Validation Results for: ${contractPath}\n\n`;

    // JSON Schema validation results
    output += "## JSON Schema Validation\n";
    if (result.jsonSchemaValidation.valid) {
      output += `✅ ${result.jsonSchemaValidation.message}\n`;
    } else {
      output += `❌ Validation failed:\n${result.jsonSchemaValidation.errors}\n`;
    }

    // CLI validation results
    if (result.cliValidation) {
      output += "\n## CLI Validation\n";
      if (result.cliValidation.cliNotFound) {
        output += `⚠️  ${result.cliValidation.message}\n`;
      } else if (result.cliValidation.valid) {
        output += `✅ ${result.cliValidation.message}\n`;
        if (result.cliValidation.output) {
          output += `\nOutput:\n${result.cliValidation.output}\n`;
        }
      } else {
        output += `❌ ${result.cliValidation.message}\n`;
        if (result.cliValidation.output) {
          output += `\nOutput:\n${result.cliValidation.output}\n`;
        }
      }
    }

    // Determine overall validity
    const isValid =
      result.jsonSchemaValidation.valid &&
      (!result.cliValidation || result.cliValidation.valid);

    return {
      content: [
        {
          type: "text",
          text: output,
        },
      ],
      isError: !isValid,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Validation error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
