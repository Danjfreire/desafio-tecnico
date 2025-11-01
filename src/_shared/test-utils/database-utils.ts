import { PostgreSqlContainer, } from "@testcontainers/postgresql"
import { Client } from "pg";


export const POSTGRES_TEST_ENV = {
    POSTGRES_VERSION: "postgres:17.6-alpine",
    POSTGRES_DB: 'orders_db',
    POSTGRES_USER: 'postgres',
    POSTGRES_PASSWORD: 'postgres',
}

export async function initPostgresTestContainer() {
    const container = await new PostgreSqlContainer(POSTGRES_TEST_ENV.POSTGRES_VERSION).withEnvironment(POSTGRES_TEST_ENV).start();
    const client = new Client({ connectionString: container.getConnectionUri() });
    await client.connect();

    return { container, client };
}

export async function clearDatabase(client: Client) {
    const result = await client.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname='public'`
    );

    const tables = result.rows
        .map(({ tablename }) => `"public"."${tablename}"`)
        .join(', ');

    if (tables) {
        try {
            await client.query(`TRUNCATE TABLE ${tables} CASCADE;`);
        } catch (error) {
            console.error('Error clearing database:', error);
        }
    }
}