import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQL_HOST     ?? "127.0.0.1",
      port:     Number(process.env.MYSQL_PORT ?? 3306),
      user:     process.env.MYSQL_USER     ?? "root",
      password: process.env.MYSQL_PASSWORD ?? "",
      database: process.env.MYSQL_DATABASE ?? "escal_concept",
      waitForConnections: true,
      connectionLimit:    10,
      timezone: "+00:00",
    });
  }
  return pool;
}

export async function query<T = unknown>(
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any[],
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, values);
  return rows as T[];
}

export async function execute(
  sql: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values?: any[],
): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, values);
  return result as mysql.ResultSetHeader;
}
