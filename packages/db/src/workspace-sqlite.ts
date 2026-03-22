import { createRequire } from "node:module";

export type SqliteStatement = {
  all(...parameters: unknown[]): unknown[];
  get(...parameters: unknown[]): unknown;
  run(...parameters: unknown[]): unknown;
};

export type SqliteForeignKeyRow = {
  table: string;
  from: string;
  to: string;
};

export type SqliteDatabase = {
  close(): void;
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
};

export type SqliteDatabaseConstructor = new (path: string) => SqliteDatabase;

const require = createRequire(import.meta.url);

export const BetterSqlite3 = require("better-sqlite3") as SqliteDatabaseConstructor;

export function isSafeIdentifier(value: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

export function isSupportedColumnType(value: string | undefined) {
  return value === "TEXT" || value === "INTEGER" || value === "REAL";
}

export function escapeIdentifier(value: string) {
  if (!isSafeIdentifier(value)) {
    throw new Error(`Unsafe SQL identifier: ${value}`);
  }

  return `"${value}"`;
}
