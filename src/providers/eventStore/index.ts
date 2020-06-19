import { v4 as uuid} from 'uuid'
import { config } from '../../utils/config'
import logger from '../../utils/logger'
import axios from 'axios'
import { get, entries } from 'lodash'
import { extractError } from '../../utils/extractError'
import { IEventCreateInputType, IEventPaginationType, IEventType } from '../../@types/eventStore/event'
import { IEventStoreProvider, EventStoreOptions, EventStoreHeaders } from '../../@types/eventStore/provider'

export default class EventStoreProvider implements IEventStoreProvider {
  public static get client(): EventStoreProvider {
    return this.getInstance();
  }

  public async retrieveEvents(
    eventStreamName: string,
    pagination?: IEventPaginationType,
  ): Promise<IEventType[]> {
    logger.verbose({
      eventStreamName,
      pagination,
    });

    const { size, page } = pagination ? pagination : { size: 0, page: 10 }

    try {
      const { status, data } = await this.getEvents(
        eventStreamName,
        size,
        page
      )
      logger.info(data, status);
      console.log(JSON.stringify(data, null, 2))
      return (
        [200, 201, 204].includes(status)  
        ? (get(data, 'entries',[]).map((entry: any) => {
          const { data } = entry;
          if (data) {
            try {
              return JSON.parse(data);
            } catch (error) {
              logger.error('Could not parse data from Event entry: ', extractError(error), entry)
            }
          }
        }))
        : []
      )
    } catch (e) {
      logger.error('Failed to retrive Events: ', extractError(e))
    }
    return []
  }

  public async writeEvent(
    eventStreamName: string,
    eventType: string,
    data: IEventCreateInputType,
    eventSource: string = '',
    eventSubType: string = ''
  ): Promise<boolean> {
    logger.verbose({
      eventStreamName,
      eventType,
      eventSubType,
      eventSource,
      data,
    })

    try {
      const result = await this.postEvent(
        eventStreamName,
        eventType,
        data,
        eventSource,
        eventSubType
      )
      return [200, 201, 204].includes(result.status)
    } catch (e) {
      logger.error('Failed post Event: ', extractError(e))
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
    eventStreamName: string,
    data: IEventCreateInputType,
    eventSource: string = '',
    eventSubType: string = ''
  ) {
    const id = uuid()
    return axios({
      method: 'post',
      ...this.options,
      headers: {
        'ES-EventType': eventType,
        'ES-EventId': id,
        ...this.headers,
      },
      data: { // Axios data
        data: { id, ...data }, // Event Data
        eventSubType,
        eventSource,
        timestamp: new Date().getTime() / 1000,
      },
      url: `${this.options.url}/streams/${eventStreamName}`,
    })
  }

  private getEvents(
    eventStreamName: string,
    size: number = 10,
    page: number = 0,
  ) {
    return axios({
      method: 'get',
      ...this.options,
      headers: {
        ...this.headers,
      },
      url: `${this.options.url}/streams/${eventStreamName}/${page*size}/forward/${size}?embed=body`,
    })
  }
}
