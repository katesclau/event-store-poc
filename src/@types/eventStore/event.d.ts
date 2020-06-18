import { IActorType } from './actor'

export interface IEventType {
    id: string
    transaction: string
    actors: IActorType[]
    timestamp: int
    type: string
    errors?: string[]
    outputs?: string[]
    tags?: string[]
    source?: string
}

export interface IEventCreateInputType {
    transaction: string
    actors: IActorType[]
    timestamp: int
    type: string
    errors?: string[]
    outputs?: string[]
    tags?: string[]
    source?: string
}