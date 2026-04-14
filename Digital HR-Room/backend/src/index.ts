import { config } from './config/env';
import { connectDB } from './config/db';
import app from './app';

async function main() {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`🚀 Digital HR-Room Backend running on http://localhost:${config.port}`);
    console.log(`   AI Service: ${config.aiServiceUrl}`);
    console.log(`   Frontend:   ${config.frontendUrl}`);
  });
}

main().catch(console.error);
