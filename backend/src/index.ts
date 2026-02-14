import "dotenv/config";
import { env } from "./config/env.js";
import app from "./app.js";

const MAX_PORT_ATTEMPTS = 10;

function tryListen(port: number, attempt = 0): void {
  const server = app.listen(port, () => {
    console.log(`Torcida Urbana API rodando em http://localhost:${port}`);
    if (port !== env.PORT) {
      console.log(`(Porta ${env.PORT} estava em uso. No frontend, use VITE_API_BASE_URL=http://localhost:${port} se precisar.)`);
    }
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    server.close();
    if (err.code === "EADDRINUSE" && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = env.PORT + attempt + 1;
      console.warn(`Porta ${port} em uso, tentando ${nextPort}...`);
      tryListen(nextPort, attempt + 1);
    } else {
      console.error("Erro ao iniciar o servidor:", err.message);
      process.exit(1);
    }
  });
}

tryListen(env.PORT);
