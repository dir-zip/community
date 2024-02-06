import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";

export const redisOptions: ConnectionOptions = {
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT) || 6379,          // Redis port
  host: process.env.REDIS_HOST || '127.0.0.1',   // Redis host
  family: 4,           // 4 (IPv4) or 6 (IPv6)
  db: 0
  // other ioredis options
};

export const createJob = <T>(name: string, func: (params: Job<T, any, string>) => Promise<unknown>) => {
  const queue = new Queue(name, {
    connection: redisOptions
  })

  const worker = new Worker<T>(name, async (job) => {
    await func(job)
  }, {
    connection: redisOptions
  });

  worker.on('completed', (job) => {
    job.remove().then(() => console.log(`Removed completed job ${job.id}`));
  });
  
  worker.on('failed', (job) => {
    job?.remove().then(() => console.log(`Removed failed job ${job.id}`));
  });

  return {worker, queue}
}