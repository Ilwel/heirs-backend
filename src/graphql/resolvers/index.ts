import { type NonEmptyArray } from 'type-graphql'
import { FindManyUserResolver, FriendshipCrudResolver } from '../../../prisma/generated/type-graphql'
import UserResolver from './user/user.resolver'
import { Service } from 'typedi'

Service()(FindManyUserResolver)
Service()(FriendshipCrudResolver)
// eslint-disable-next-line
export default [UserResolver, FindManyUserResolver, FriendshipCrudResolver] as NonEmptyArray<Function>
