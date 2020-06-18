import { IResolvers } from 'graphql-tools';
import { IEventType } from './@types/eventStore/event';
const resolvers: IResolvers = {
    Query: {
        helloWorld(_: void, args: void): string {
    return `👋 Hello world! 👋`;
        },
    },
    Mutation: {
        postEvent(_parent, { event }, ctx, info) : IEventType | null {
            console.log(event, ctx, info);
            const eventResponse = ctx.EventStoreProvider.getInstance().postEvent(event);
            return null;
        }
    }
};
export default resolvers;
