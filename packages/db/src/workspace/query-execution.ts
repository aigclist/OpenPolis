import { getDatabase } from "../workspace-bootstrap";

export function count(sql: string) {
  const database = getDatabase();
  const result = database.prepare(sql).get() as { count: number };
  return result.count;
}

export function countWithParameters(sql: string, parameters: unknown[]) {
  const database = getDatabase();
  const result = database.prepare(sql).get(...parameters) as { count: number };
  return result.count;
}

export function all<T>(sql: string) {
  const database = getDatabase();
  return database.prepare(sql).all() as T[];
}

export function allWithParameters<T>(sql: string, parameters: unknown[]) {
  const database = getDatabase();
  return database.prepare(sql).all(...parameters) as T[];
}
