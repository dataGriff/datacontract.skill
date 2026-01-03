import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { convertSloToSlaProperties } from "./utils.js";

/**
 * Create a new data contract following ODCS
 */
export async function createDataContract(args) {
  const {
    name,
    description = "",
    domain = "",
    schema = [],
    outputPath = "datacontract.yaml",
    format = "yaml",
    apiVersion = "v3.1.0",
    status = "draft",
    servers = [],
    quality = {},
    slo = {},
    slaProperties = [],
  } = args;

  // Build the data contract object following ODCS structure
  const contract = {
    apiVersion,
    kind: "DataContract",
    id: `${name}-${Date.now()}`, // Generate a unique ID
    version: "1.0.0",
    status,
  };

  // Add optional fields if provided
  if (name) {
    contract.name = name;
  }

  if (domain) {
    contract.domain = domain;
  }

  if (description) {
    contract.description = {
      purpose: description,
    };
  }

  if (servers && servers.length > 0) {
    contract.servers = servers.map((srv) => ({
      server: srv.server || srv.name || "default",
      type: srv.type || "bigquery",
      ...(srv.description && { description: srv.description }),
      ...(srv.environment && { environment: srv.environment }),
      ...(srv.project && { project: srv.project }),
      ...(srv.dataset && { dataset: srv.dataset }),
      ...(srv.host && { host: srv.host }),
      ...(srv.port && { port: srv.port }),
      ...(srv.database && { database: srv.database }),
    }));
  }

  if (schema && schema.length > 0) {
    contract.schema = schema.map((field) => {
      const schemaField = {
        name: field.name,
        type: field.type || "string",
        description: field.description || "",
        required: field.required !== false,
        ...(field.primaryKey && { primaryKey: true }),
        ...(field.unique && { unique: true }),
        ...(field.enum && { enum: field.enum }),
        ...(field.pattern && { pattern: field.pattern }),
        ...(field.minLength && { minLength: field.minLength }),
        ...(field.maxLength && { maxLength: field.maxLength }),
      };

      // Add quality checks at schema field level if provided
      if (field.quality && Array.isArray(field.quality)) {
        schemaField.quality = field.quality;
      }

      return schemaField;
    });
  }

  // Add slaProperties if provided (this is the correct ODCS field, not slo)
  if (slaProperties && slaProperties.length > 0) {
    contract.slaProperties = slaProperties;
  } else if (slo && Object.keys(slo).length > 0) {
    // Convert simple slo object to slaProperties array
    contract.slaProperties = convertSloToSlaProperties(slo);
  }

  // Convert to requested format
  let content;
  let finalPath = outputPath;

  if (format === "json") {
    content = JSON.stringify(contract, null, 2);
    if (!finalPath.endsWith(".json")) {
      finalPath = finalPath.replace(/\.(yaml|yml)$/, ".json");
    }
  } else {
    content = yaml.dump(contract, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
    if (!finalPath.endsWith(".yaml") && !finalPath.endsWith(".yml")) {
      finalPath = finalPath.replace(/\.json$/, ".yaml");
    }
  }

  // Ensure directory exists
  const dir = path.dirname(finalPath);
  await fs.mkdir(dir, { recursive: true });

  // Write the file
  await fs.writeFile(finalPath, content, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ Data contract created successfully at: ${finalPath}\n\n${content}`,
      },
    ],
  };
}
