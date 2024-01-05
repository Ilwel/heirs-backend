import { type NonEmptyArray } from 'type-graphql'
import { BoardCrudResolver, FindManyUserResolver, PlayerCrudResolver, FriendshipCrudResolver } from '../../../prisma/generated/type-graphql'
import UserResolver from './user/user.resolver'
import { Service } from 'typedi'

Service()(PlayerCrudResolver)
Service()(BoardCrudResolver)
Service()(FindManyUserResolver)
Service()(FriendshipCrudResolver)
// eslint-disable-next-line
export default [PlayerCrudResolver, BoardCrudResolver, UserResolver, FindManyUserResolver, FriendshipCrudResolver] as NonEmptyArray<Function>
