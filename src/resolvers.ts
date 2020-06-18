import { IResolvers } from 'graphql-tools';
import EventStoreProvider from './providers/eventStore';
const resolvers: IResolvers = {
    Query: {
        helloWorld(_: void, args: void): string {
    return `👋 Hello world! 👋`;
        },
    },
    Mutation: {
        async postEvent(_parent, { event }, ctx): Promise<Boolean | null> {
            console.log(event, ctx);
            const eventStoreProvider: EventStoreProvider = EventStoreProvider.client;
            if (!eventStoreProvider) {
                return null;
            }
            const { type, source } = event;
            return await eventStoreProvider.writeEvent(type, event, source);
        }
    }
};

export default resolvers;
