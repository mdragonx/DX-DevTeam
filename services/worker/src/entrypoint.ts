import { createServer } from "node:http";

const port = Number(process.env.WORKER_HEALTH_PORT ?? 8080);
const server = createServer((request, response) => {
  if (request.url !== "/healthz") { response.writeHead(404).end(); return; }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ status: "ok", uid: process.getuid?.(), gid: process.getgid?.() }));
});

server.listen(port, "0.0.0.0", () => process.stdout.write(`worker ready on ${port}\n`));
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => server.close(() => process.exit(0)));
