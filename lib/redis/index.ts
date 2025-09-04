import { createClient, RedisClientType } from "redis";
// import {
//   REDIS_KEY_PREFIX,
//   REDIS_URL,
//   useLogger,
// } from "@xmind/flatwhite-server-pkg-common";
const REDIS_KEY_PREFIX = "your_redis_key_prefix";
const REDIS_URL = "your_redis_url";
const createRedisClient = (url: string) => {
  if (process.env.IS_TEST === "true") {
    const MockRedis = require("ioredis-mock");
    const mockClient = new MockRedis();
    mockClient.setNX = mockClient.setnx;
    return mockClient;
  } else {
    return createClient({
      url,
    });
  }
};

export class RedisClient {
  public client: RedisClientType;
  public subClient: RedisClientType;

  public readonly awaitConnectPromise: Promise<void>;
  private resolveAwaitConnectPromise: (() => void) | null = null;
  constructor() {
    this.awaitConnectPromise = new Promise((resolve) => {
      this.resolveAwaitConnectPromise = () => {
        this.resolveAwaitConnectPromise = null;
        resolve();
      };
    });
    this.connect();
  }
  private async connect() {
    while (true) {
      try {
        this.client = createRedisClient(REDIS_URL);
        this.subClient = this.client.duplicate();
        if (process.env.IS_TEST !== "true") {
          await this.client?.connect();
          await this.subClient?.connect();
        }
        this.resolveAwaitConnectPromise?.();
        break;
      } catch (err) {
        await new Promise((resolve) => setTimeout(resolve, 6000));
      }
    }
  }
  public get isReady() {
    return this.client.isReady;
  }
  public async leftRange(key: string, start: number, end: number) {
    await this.awaitConnectPromise;
    return this.client.lRange(`${REDIS_KEY_PREFIX}#${key}`, start, end);
  }
  public async listLen(key: string) {
    await this.awaitConnectPromise;
    return this.client.lLen(`${REDIS_KEY_PREFIX}#${key}`);
  }
  public async lock(
    key: string,
    options?: {
      isAutoRetry?: boolean;
      ttl?: number;
      maxRetry?: number;
      retryInterval?: number;
    }
  ) {
    await this.awaitConnectPromise;
    const {
      isAutoRetry = false,
      ttl,
      maxRetry = Infinity,
      retryInterval,
    } = options || {};
    let retry = 0;

    while (true) {
      retry++;
      const isLockSucceed = await this.client.setNX(
        `${REDIS_KEY_PREFIX}#${key}*`,
        "1"
      );
      if (isLockSucceed) {
        if (ttl) {
          await this.client.expire(`${REDIS_KEY_PREFIX}#${key}*`, ttl);
        }
        return true;
      }
      if (!isLockSucceed && (!isAutoRetry || retry >= maxRetry)) {
        return false;
      }
      const delay = retryInterval || 2 ** Math.min(retry, 5) * 25;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  public async ensureUnlocked(key: string) {
    await this.awaitConnectPromise;
    while (await this.client.exists(`${REDIS_KEY_PREFIX}#${key}*`)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  public async unlock(key: string) {
    await this.awaitConnectPromise;
    await this.client.del(`${REDIS_KEY_PREFIX}#${key}*`);
  }
  public async rightPush(key: string, value: string) {
    await this.awaitConnectPromise;
    return this.client.rPush(`${REDIS_KEY_PREFIX}#${key}`, value);
  }
  public async set(key: string, value: any) {
    await this.awaitConnectPromise;
    return this.client.set(`${REDIS_KEY_PREFIX}#${key}`, value);
  }

  public async setIfNotExist(key: string, value: any, expire: number) {
    await this.awaitConnectPromise;
    return this.client.set(`${REDIS_KEY_PREFIX}#${key}`, value, {
      NX: true,
      EX: expire,
    });
  }

  public async ttl(key: string) {
    await this.awaitConnectPromise;
    return this.client.ttl(`${REDIS_KEY_PREFIX}#${key}`);
  }

  public async increase(key: string, value: number) {
    await this.awaitConnectPromise;
    return this.client.incrBy(`${REDIS_KEY_PREFIX}#${key}`, value);
  }

  public async get(key: string) {
    await this.awaitConnectPromise;
    return this.client.get(`${REDIS_KEY_PREFIX}#${key}`);
  }
  public async del(key: string) {
    await this.awaitConnectPromise;
    return this.client.DEL(`${REDIS_KEY_PREFIX}#${key}`);
  }
  public async exists(key: string) {
    await this.awaitConnectPromise;
    try {
      return await this.client.EXISTS(`${REDIS_KEY_PREFIX}#${key}`);
    } catch (err) {
      return false;
    }
  }
  public async hset(key: string, field: string, value: any) {
    await this.awaitConnectPromise;
    return this.client.HSET(`${REDIS_KEY_PREFIX}#${key}`, field, value);
  }
  public async hdel(key: string, field: string) {
    await this.awaitConnectPromise;
    return this.client.HDEL(`${REDIS_KEY_PREFIX}#${key}`, field);
  }
  public async hesists(key: string, field: string) {
    await this.awaitConnectPromise;
    return this.client.HEXISTS(`${REDIS_KEY_PREFIX}#${key}`, field);
  }
  public async hget(key: string, field: string) {
    await this.awaitConnectPromise;
    return this.client.HGET(`${REDIS_KEY_PREFIX}#${key}`, field);
  }

  public async sadd(key: string, member: string) {
    await this.awaitConnectPromise;
    return await this.client.SADD(`${REDIS_KEY_PREFIX}#${key}`, member);
  }

  public async srem(key: string, member: string) {
    await this.awaitConnectPromise;
    return await this.client.SREM(`${REDIS_KEY_PREFIX}#${key}`, member);
  }

  public async sismember(key: string, member: string) {
    await this.awaitConnectPromise;
    return await this.client.SISMEMBER(`${REDIS_KEY_PREFIX}#${key}`, member);
  }

  public async smembers(key: string) {
    await this.awaitConnectPromise;
    return await this.client.SMEMBERS(`${REDIS_KEY_PREFIX}#${key}`);
  }

  public async keys(partial: string) {
    await this.awaitConnectPromise;
    const prefixLength = `${REDIS_KEY_PREFIX}#`.length;
    const keys = await this.client.keys(`${REDIS_KEY_PREFIX}#${partial}`);
    return keys.map((key) => key.slice(prefixLength, key.length));
  }
  public async expire(key: string, timeout: number) {
    await this.awaitConnectPromise;
    return this.client.expire(`${REDIS_KEY_PREFIX}#${key}`, timeout);
  }
  public async persist(key: string) {
    await this.awaitConnectPromise;
    return this.client.persist(`${REDIS_KEY_PREFIX}#${key}`);
  }
  public async subscribe(event: string, callback: any) {
    return this.subClient.subscribe(event, callback);
  }
  public async unsubscribe(event: string, callback?: any) {
    return this.subClient.unsubscribe(event, callback);
  }
  public async publish(event: string, payload: any) {
    return this.client.publish(event, payload);
  }

  public async psubscribe(pattern: string, callback: any) {
    await this.awaitConnectPromise;
    this.subClient.pSubscribe(pattern, callback);
  }

  public async punsubscribe(pattern: string, callback?: any) {
    this.subClient.pUnsubscribe(pattern, callback);
  }
}
