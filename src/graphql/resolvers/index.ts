import { type NonEmptyArray } from 'type-graphql'
import { BoardCrudResolver, PlayerCrudResolver } from '../../../prisma/generated/type-graphql'

// eslint-disable-next-line
export default [PlayerCrudResolver, BoardCrudResolver] as NonEmptyArray<Function>
