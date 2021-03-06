import { IResolvers } from 'graphql-tools';
import logger from './utils/logger';
import { IEventType } from './@types/eventStore/event';
const resolvers: IResolvers = {
    Query: {
        async events(_parent, { streamName, pagination }, ctx, _info): Promise<IEventType[] | null> {
            return await ctx.eventStoreProvider.retrieveEvents(streamName, pagination);
        },
    },
    Mutation: {
        async postEvent(_parent, { event }, ctx): Promise<Boolean | null> {
            logger.info(event);
            if (!ctx.eventStoreProvider) {
                return null;
            }
            const { type, source } = event;
            return await ctx.eventStoreProvider.writeEvent(type, type, event);
        }
    }
};

export default resolvers;
