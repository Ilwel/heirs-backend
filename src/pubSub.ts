import { createPubSub } from '@graphql-yoga/subscription'
import { type Friendship } from '../prisma/generated/type-graphql'

export const pubSub = createPubSub<{
  FRIENDS: [Friendship []]
}>()
