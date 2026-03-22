import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { getDatabase } from "./workspace-bootstrap";
import * as schema from "./schema";

type OpenPolisDrizzleDatabase = BetterSQLite3Database<typeof schema>;

declare global {
  var __openPolisDrizzle: OpenPolisDrizzleDatabase | undefined;
}

export function getDrizzleDb() {
  if (!globalThis.__openPolisDrizzle) {
    globalThis.__openPolisDrizzle = drizzle(getDatabase() as never, { schema });
  }

  return globalThis.__openPolisDrizzle;
}

export type { OpenPolisDrizzleDatabase };
