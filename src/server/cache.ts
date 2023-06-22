import { getRedisConfig } from '@/utils/env/server'
import Redis, { RedisOptions } from 'ioredis'

export function createRedisInstance() {
  try {
    const config = getRedisConfig()

    const options: RedisOptions = {
      host: config.host,
      password: config.password,
      port: config.port,

      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 0,
      retryStrategy: (times: number) => {
        if (times > 3) {
          throw new Error(`[Redis] Could not connect after ${times} attempts`)
        }

        return Math.min(times * 200, 1000)
      },
    }

    const redis = new Redis(options)

    redis.on('error', (error: unknown) => {
      console.warn('[Redis] Error connecting', error)
    })

    return redis
  } catch (e) {
    console.error(`[Redis] Could not create a Redis instance`)
    return null
  }
}
