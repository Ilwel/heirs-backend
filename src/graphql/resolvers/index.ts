import { type NonEmptyArray } from 'type-graphql'
import { BoardCrudResolver, FindManyUserResolver, PlayerCrudResolver } from '../../../prisma/generated/type-graphql'
import UserResolver from './user/user.resolver'
import { Service } from 'typedi'

Service()(PlayerCrudResolver)
Service()(BoardCrudResolver)
Service()(FindManyUserResolver)
// eslint-disable-next-line
export default [PlayerCrudResolver, BoardCrudResolver, UserResolver, FindManyUserResolver] as NonEmptyArray<Function>
