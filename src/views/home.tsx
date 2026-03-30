import type { FC } from "hono/jsx";
import { Layout } from "./layout.js";
import { CreateForm, TodoItem } from "./components.js";
import type { Todo } from "./components.js";

export const Home: FC<{ todos: Todo[] }> = ({ todos }) => {
  return (
    <Layout title="HTMX + Node + Hono + JSX + PostgreSQL">
      <h1 class="text-3xl font-bold mb-2">Todo App</h1>
      <p class="text-gray-400 mb-8">HTMX + Node + Hono + JSX + PostgreSQL</p>
      <CreateForm />
      <div id="todo-list">
        {todos.map((todo) => (
          <TodoItem todo={todo} />
        ))}
      </div>
      {todos.length === 0 && (
        <p id="empty-state" class="text-gray-500 text-center py-8">
          No todos yet. Add one above.
        </p>
      )}
    </Layout>
  );
};
