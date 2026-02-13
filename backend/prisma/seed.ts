import { runSeed } from "../src/shared/seed.js";

runSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
