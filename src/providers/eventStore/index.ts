import { v4 as uuid} from 'uuid'
import { config } from '../../utils/config'
import logger from '../../utils/logger'
import axios from 'axios'
import { extractError } from '../../utils/extractError'

interface EventStoreOptions {
  url: string
}

interface EventStoreHeaders {
  [key: string]: string
}

export default class EventStoreProvider {
  public static async writeEvent<T>(
    eventType: string,
    data: T,
    message: string = '',
    eventSource: string = '',
    eventSubType: string = ''
  ): Promise<boolean> {
    logger.verbose({
      message: 'EventStore::writeEvent ' + message,
      eventType,
      eventSubType,
      eventSource,
      data,
    })

    try {
      const result = await this.getInstance().postEvent<T>(
        eventType,
        data,
        message,
        eventSource,
        eventSubType
      )
      return [200, 201, 204].includes(result.status)
    } catch (e) {
      logger.error('Failed to set Redis cache entry: ', extractError(e))
    }
    return false
  }

  protected static getInstance(): EventStoreProvider {
    if (this.instance) {
      return this.instance
    }
    this.instance = new this()
    return this.instance
  }

  private static instance: EventStoreProvider

  private options: EventStoreOptions
  private headers: EventStoreHeaders
  protected constructor() {
    var Authorization = `Basic ${new Buffer(
      `${config('EVENT_STORE_USER')}:${config('EVENT_STORE_PASSWORD')}`
    ).toString('base64')}`
    this.options = {
      url: config('EVENT_STORE_URL'),
    }
    this.headers = {
      'Content-Type': 'application/json',
      Authorization,
    }
  }

  private async postEvent<T>(
    eventType: string,
    data: T,
    message: string = '',
    eventSubType: string = '',
    eventSource: string = ''
  ) {
    const uid = uuid()
    return axios({
      method: 'post',
      ...this.options,
      headers: {
        'ES-EventType': eventType,
        'ES-EventId': uid,
        ...this.headers,
      },
      data: {
        data,
        message,
        eventSubType,
        eventSource,
      },
    })
  }
}
