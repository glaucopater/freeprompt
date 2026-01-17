import * as fs from "fs";
import * as path from "path";

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: unknown) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return "[Circular]";
      seen.add(value);
    }
    if (typeof value === "function") return "[Function]";
    if (key === "dataUri" && typeof value === "string" && value.length > 200) {
      return `${value.substring(0, 100)}...[TRUNCATED]`;
    }
    if (typeof value === "string" && value.length > 1000) {
      return `${value.substring(0, 500)}...[TRUNCATED]`;
    }
    return value;
  };
};

export const logToFile = (logData: object) => {
  try {
    const logDir = path.join(process.cwd(), "netlify", "functions", "logs");
    fs.mkdirSync(logDir, { recursive: true });
    const logFile = path.join(logDir, "reve-generate-images.log");
    console.warn(`Logging to: ${logFile}`);
    const entry =
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          ...logData,
        },
        getCircularReplacer()
      ) + "\n";
    fs.appendFileSync(logFile, entry, { encoding: "utf8" });
  } catch (fileErr: unknown) {
    console.warn("Failed to write debug log file:", String(fileErr));
  }
};
