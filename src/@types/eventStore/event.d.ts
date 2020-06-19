import { IActorType } from './actor'

export interface IEventType {
    id: string
    transaction: string
    actors: IActorType[]
    timestamp: string | BigInt
    type: string
    errors?: string[]
    outputs?: string[]
    tags?: string[]
    source?: string
}

export interface IEventCreateInputType {
    transaction: string
    actors: IActorType[]
    type: string
    timestamp?: int
    errors?: string[]
    outputs?: string[]
    tags?: string[]
    source?: string
}

export interface IEventPaginationType {
    page: number
    size: number
}

export interface IEventWhereType {
    transaction?: string
    actors?: string[]
    tags?: string[]
    timestamp_gt?: number
    timestamp_lt?: number
}