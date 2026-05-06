import { resolve } from "node:path";

const root = resolve(".liam/dist");
const port = 4174;

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const name = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const path = resolve(root, name);

    if (!path.startsWith(root)) {
      return new Response("Not found", { status: 404 });
    }

    const file = Bun.file(path);

    if (await file.exists()) {
      return new Response(file);
    }

    return new Response(Bun.file(resolve(root, "index.html")));
  },
});

console.log(`Liam ERD is running at http://localhost:${port}`);
