import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const { db, closeDb, dataDir } = await import('../src/lib/db');
db();
closeDb();
console.log(`Base de datos migrada en ${dataDir}. Los datos existentes se conservan.`);
