import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { connect, migrate, getPool } from "./database.js";
import { Home } from "./views/home.js";
import { TodoItem } from "./views/components.js";
import type { Todo } from "./views/components.js";

const app = new Hono();

app.use("*", logger());

app.get("/", async (c) => {
  const pool = getPool();
  const result = await pool.query<Todo>(
    "SELECT id, title, completed, created_at FROM todos ORDER BY created_at DESC"
  );
  return c.html(<Home todos={result.rows} />);
});

app.post("/todos", async (c) => {
  const body = await c.req.parseBody();
  const title = body["title"];

  if (!title || typeof title !== "string") {
    return c.text("title is required", 400);
  }

  const pool = getPool();
  const result = await pool.query<Todo>(
    "INSERT INTO todos (title) VALUES ($1) RETURNING id, title, completed, created_at",
    [title]
  );

  return c.html(<TodoItem todo={result.rows[0]} />, 201);
});

app.patch("/todos/:id/toggle", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) {
    return c.text("invalid id", 400);
  }

  const pool = getPool();
  const result = await pool.query<Todo>(
    "UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING id, title, completed, created_at",
    [id]
  );

  if (result.rows.length === 0) {
    return c.text("not found", 404);
  }

  return c.html(<TodoItem todo={result.rows[0]} />);
});

app.delete("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (isNaN(id)) {
    return c.text("invalid id", 400);
  }

  const pool = getPool();
  await pool.query("DELETE FROM todos WHERE id = $1", [id]);

  return c.body(null, 200);
});

app.get("/health", async (c) => {
  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return c.json({ status: "healthy" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return c.json({ status: "unhealthy", error: message }, 503);
  }
});

const pool = connect();

migrate()
  .then(() => {
    const port = parseInt(process.env.PORT || "8080", 10);
    const hostname = process.env.HOST || "0.0.0.0";
    console.log(`Server listening on ${hostname}:${port}`);
    serve({ fetch: app.fetch, port, hostname });
  })
  .catch((err) => {
    console.error("Failed to run migrations:", err);
    process.exit(1);
  });
