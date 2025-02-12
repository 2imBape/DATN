import { createClient } from "redis";

const redis = createClient({
  password: "z51o0gHpg5k6GJbEdc5ZtkgYIqnsJUP8",
  socket: {
    host: "redis-14761.c334.asia-southeast2-1.gce.redns.redis-cloud.com",
    port: 14761,
  },
});
redis.on("connect", () => {
  console.log("Connected to Redis");
});
redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();

const value = await redis.get("key");
console.log("Value:", value);

export const connectRedis = async () => {
  await redis.connect();
};

export const setRedis = async (key, value, ttl) => {
  if (ttl !== undefined) {
    await redis.set(key, value, { EX: ttl });
  } else {
    await redis.set(key, value);
  }
};
export const keys = async (key) => {
  return await redis.keys(`${key}:*`);
};
export const keyDelete = async (key) => {
  return await redis.del(key);
};
export const getRedis = async (key) => {
  return await redis.get(key);
};
await redis.quit();
