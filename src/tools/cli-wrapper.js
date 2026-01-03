import { execSync, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(execSync);

/**
 * Check if datacontract CLI is installed
 */
async function isCliInstalled() {
  try {
    execSync("datacontract --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Install datacontract CLI
 */
async function installCli() {
  try {
    console.error("Installing datacontract CLI...");
    execSync("pip install datacontract-cli", {
      stdio: "inherit",
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to install datacontract CLI: ${error.message}`);
  }
}

/**
 * Execute a datacontract CLI command
 */
export async function executeDataContractCli(args) {
  const {
    command,
    contractPath,
    args: cmdArgs = [],
    installIfMissing = true,
  } = args;

  try {
    // Check if CLI is installed
    const installed = await isCliInstalled();

    if (!installed) {
      if (installIfMissing) {
        await installCli();
      } else {
        return {
          content: [
            {
              type: "text",
              text: "❌ datacontract CLI is not installed. Install with: pip install datacontract-cli",
            },
          ],
          isError: true,
        };
      }
    }

    // Build the command
    const fullCommand = ["datacontract", command, contractPath, ...cmdArgs]
      .filter(Boolean)
      .join(" ");

    console.error(`Executing: ${fullCommand}`);

    // Execute the command
    let output;
    let exitCode = 0;

    try {
      output = execSync(fullCommand, {
        encoding: "utf-8",
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
    } catch (error) {
      output = error.stdout || error.stderr || error.message;
      exitCode = error.status || 1;
    }

    const success = exitCode === 0;

    return {
      content: [
        {
          type: "text",
          text: `${success ? "✅" : "❌"} Command: ${fullCommand}\n\n${output}`,
        },
      ],
      isError: !success,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `❌ Error executing datacontract CLI: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
