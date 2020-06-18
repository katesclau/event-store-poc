import { v4 as uuid} from 'uuid'
import { config } from '../../utils/config'
import logger from '../../utils/logger'
import axios from 'axios'
import { extractError } from '../../utils/extractError'
import { IEventCreateInputType } from '../../@types/eventStore/event'
import { IEventStoreProvider, EventStoreOptions, EventStoreHeaders } from '../../@types/eventStore/provider'

export default class EventStoreProvider implements IEventStoreProvider {
  public static get client(): EventStoreProvider {
    return this.getInstance();
  }

  public async writeEvent(
    eventType: string,
    data: IEventCreateInputType,
    eventSource: string = '',
    eventSubType: string = ''
  ): Promise<boolean> {
    logger.verbose({
      eventType,
      eventSubType,
      eventSource,
      data,
    })

    try {
      const result = await this.postEvent(
        eventType,
        data,
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

  private postEvent(
    eventType: string,
    data: IEventCreateInputType,
    eventSource: string = '',
    eventSubType: string = ''
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
        eventSubType,
        eventSource,
      },
    })
  }
}
