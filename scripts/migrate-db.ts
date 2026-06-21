import "dotenv/config";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "@/lib/db";

async function run() {
    try {
        console.log("Starting migration...");
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

run();