type StructuredLogLevel = "info" | "warn" | "error";

type StructuredLogValue =
  | string
  | number
  | boolean
  | null
  | StructuredLogValue[]
  | {
      [key: string]: StructuredLogValue;
    };

const maxSerializationDepth = 3;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function serializeStructuredValue(
  value: unknown,
  depth = 0
): StructuredLogValue {
  if (value === null) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Error) {
    return serializeError(value, depth + 1);
  }

  if (Array.isArray(value)) {
    if (depth >= maxSerializationDepth) {
      return value.map(() => "[max-depth]");
    }

    return value.map((entry) => serializeStructuredValue(entry, depth + 1));
  }

  if (isPlainObject(value)) {
    if (depth >= maxSerializationDepth) {
      return { summary: "[max-depth]" };
    }

    const serializedEntries = Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [
        key,
        serializeStructuredValue(entryValue, depth + 1)
      ]);

    return Object.fromEntries(serializedEntries);
  }

  return String(value);
}

export function serializeError(
  error: unknown,
  depth = 0
): StructuredLogValue {
  if (!(error instanceof Error)) {
    return serializeStructuredValue(error, depth + 1);
  }

  const record: Record<string, StructuredLogValue> = {
    name: error.name,
    message: error.message
  };

  if (process.env.NODE_ENV !== "production" && error.stack) {
    record.stack = error.stack;
  }

  if ("cause" in error && error.cause !== undefined && depth < maxSerializationDepth) {
    record.cause = serializeStructuredValue(error.cause, depth + 1);
  }

  for (const [key, value] of Object.entries(error)) {
    if (value === undefined || key in record) {
      continue;
    }

    record[key] = serializeStructuredValue(value, depth + 1);
  }

  return record;
}

export function logStructuredEvent(
  level: StructuredLogLevel,
  event: string,
  context: Record<string, unknown> = {}
) {
  const entry = {
    timestamp: new Date().toISOString(),
    scope: "openpolis",
    level,
    event,
    ...Object.fromEntries(
      Object.entries(context)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, serializeStructuredValue(value)])
    )
  };
  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      return;
    case "warn":
      console.warn(line);
      return;
    default:
      console.info(line);
  }
}

export type { StructuredLogLevel, StructuredLogValue };
