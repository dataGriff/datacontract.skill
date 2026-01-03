import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";

/**
 * Update an existing data contract
 */
export async function updateDataContract(args) {
  const { contractPath, updates, outputPath } = args;

  // Read the existing contract
  let existingContract;
  let isYaml = false;

  try {
    const content = await fs.readFile(contractPath, "utf-8");
    
    // Try to parse as YAML first (YAML parser can also handle JSON)
    try {
      existingContract = yaml.load(content);
      isYaml = contractPath.endsWith(".yaml") || contractPath.endsWith(".yml");
    } catch (yamlError) {
      // If YAML parsing fails, try JSON
      existingContract = JSON.parse(content);
      isYaml = false;
    }
  } catch (error) {
    throw new Error(`Failed to read contract at ${contractPath}: ${error.message}`);
  }

  // Merge updates with existing contract
  const updatedContract = {
    ...existingContract,
    ...updates,
  };

  // Handle schema updates specially - merge if both exist
  if (updates.schema && existingContract.schema) {
    // Replace schema entirely with the updated one
    updatedContract.schema = updates.schema;
  }

  // Handle nested object updates
  if (updates.description && typeof updates.description === "object") {
    updatedContract.description = {
      ...(existingContract.description || {}),
      ...updates.description,
    };
  }

  // Handle slaProperties updates
  if (updates.slaProperties && Array.isArray(updates.slaProperties)) {
    updatedContract.slaProperties = updates.slaProperties;
  }

  // Handle slo (convert to slaProperties for backwards compatibility)
  if (updates.slo && typeof updates.slo === "object") {
    const slaProps = Object.entries(updates.slo).map(([key, value]) => ({
      property: key,
      value: value.value || value,
      ...(value.unit && { unit: value.unit }),
    }));
    updatedContract.slaProperties = [
      ...(existingContract.slaProperties || []),
      ...slaProps,
    ];
    delete updatedContract.slo; // Remove slo as it's not a valid ODCS field
  }

  // Update version if not explicitly set
  if (!updates.version && existingContract.version) {
    const versionParts = existingContract.version.split(".");
    if (versionParts.length >= 2) {
      const minor = parseInt(versionParts[1]) + 1;
      updatedContract.version = `${versionParts[0]}.${minor}.0`;
    }
  }

  // Determine output format and path
  const finalPath = outputPath || contractPath;
  let content;

  if (isYaml) {
    content = yaml.dump(updatedContract, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
    });
  } else {
    content = JSON.stringify(updatedContract, null, 2);
  }

  // Ensure directory exists
  const dir = path.dirname(finalPath);
  await fs.mkdir(dir, { recursive: true });

  // Write the updated contract
  await fs.writeFile(finalPath, content, "utf-8");

  return {
    content: [
      {
        type: "text",
        text: `✅ Data contract updated successfully at: ${finalPath}\n\nUpdated fields: ${Object.keys(updates).join(", ")}\n\n${content}`,
      },
    ],
  };
}
