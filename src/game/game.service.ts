import { Service } from 'typedi'
import { User } from '../../prisma/generated/type-graphql'
import { Field, ObjectType } from 'type-graphql'
import { pubSub } from '../pubSub'
import SessionRepository from '../graphql/resolvers/session/session.repository'
import { type IContext } from '../context'
import { v4 } from 'uuid'
import { type UserInput, type GameInput } from '../graphql/input-type/game/game.input'
import { client } from '../cache/redis.client'

@ObjectType()
export class Game {
  @Field(() => String)
    id!: string

  @Field(() => [Player])
    players!: Player []

  @Field(() => String)
    status!: string

  @Field(() => Number)
    turnPlayer!: number

  @Field(() => [ChatMsg])
    chat!: ChatMsg []
}

@ObjectType()
export class ChatMsg {
  @Field(() => String)
    msg!: string

  @Field(() => String)
    username!: string

  @Field(() => String)
    createdAt!: string
}

@ObjectType()
export class Player {
  @Field(() => User)
    user!: User | UserInput

  @Field(() => Number)
    money!: number

  @Field(() => String)
    square!: string

  @Field(() => Boolean)
    playable!: boolean

  @Field(() => String)
    role!: 'ADMIN' | 'PLAYER' | 'SPECTATOR'
}

const initPlayer = {
  money: 0,
  square: 'INIT',
  playable: false
}

@Service()
export class GameService {
  constructor (
    private readonly sessionRepository: SessionRepository
  ) {}

  public async createGame (ctx: IContext, token: string): Promise<Game> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const uuid = v4()
    const newGame: Game = {
      id: uuid,
      players: [{ user, ...initPlayer, role: 'ADMIN' }],
      status: 'created',
      turnPlayer: 0,
      chat: []
    }
    const result = await this.setCacheGame(newGame)
    console.log(result)
    await this.friendsPublishSetGame(user, `${user.username} new game`, newGame)
    return newGame
  }

  public async registerOnGame (ctx: IContext, token: string, id: string): Promise<Game> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const gameToUpdate = await this.getCacheGame(id)
    if (typeof gameToUpdate === 'string') {
      throw Error(gameToUpdate)
    } else {
      const hasPlayer = gameToUpdate.players.find(item => item.user.id === user.id)
      if (hasPlayer == null) {
        gameToUpdate?.players.push({ user, ...initPlayer, role: 'PLAYER' })
      }
      const result = await this.setCacheGame(gameToUpdate)
      console.log(result)
      await this.friendsPublishSetGame(user, `${user.username} get in the game`, gameToUpdate)
      this.gamePublish(gameToUpdate)
      return gameToUpdate
    }
  }

  public async getGame (id: string): Promise<Game> {
    const game = await this.getCacheGame(id)
    if (typeof game === 'string') {
      throw Error(game)
    }
    return game
  }

  public async deleteGame (ctx: IContext, token: string, id: string): Promise<string> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const result = this.deleteCacheGame(id)
    console.log(result)
    await this.friendsPublishDeleteGame(user, `${user.username} remove game`, id)
    return 'game deleted'
  }

  public async changeGameState (game: GameInput, ctx: IContext, token: string): Promise<string> {
    if (game.players.length === 0) {
      await this.deleteGame(ctx, token, game.id)
      return 'game updeted'
    } else {
      const user = await this.sessionRepository.getUser(ctx, token)
      const hasPlayerYet = game.players.map(player => player.user.id).includes(user.id)
      if (!hasPlayerYet) {
        await this.friendsPublishDeleteGame(user, `${user.username} remove game`, game.id)
      }
      const result = await this.setCacheGame(game)
      console.log(result)
      if (result === 'cache fail') {
        return 'game not updeted'
      } else {
        this.gamePublish(game)
        return 'game updeted'
      }
    }
  }

  public async listAllFriendsGames (id: string): Promise<Game []> {
    console.log('subscription for friend games =>')
    const games = await this.getFriendCacheGame(id)
    return games
  }

  // private async getCacheGames (): Promise<Game []> {
  //   const jsonKeys = await client.keys('*')
  //   console.log('jsonGames: ', jsonKeys)
  //   const games = []
  //   for (const gameKey of jsonKeys) {
  //     const result = await this.getCacheGame(gameKey)
  //     if (typeof result !== 'string') {
  //       games.push(result)
  //     }
  //   }
  //   return games
  // }

  private async getCacheGame (id: string): Promise<Game | string> {
    const jsonGame = await client.get(id)
    if (jsonGame != null) {
      const game = JSON.parse(jsonGame) as Game
      return game
    } else {
      return 'game not found'
    }
  }

  private async setCacheGame (game: Game): Promise<string> {
    const result = await client.set(game.id, JSON.stringify(game))
    if (result != null) return 'cached'
    else return 'cache fail'
  }

  private async deleteCacheGame (id: string): Promise<string> {
    const result = await client.del(id)
    if (result === 1) return 'deleted'
    else return 'delete fail'
  }

  private async getFriendCacheGame (id: string): Promise<Game []> {
    const jsonFriendGames = await client.get('friend-' + id) ?? '[]'
    const parsedFriendGames = await JSON.parse(jsonFriendGames) as Game []
    return parsedFriendGames
  }

  private async setFriendCacheGame (id: string, game: Game): Promise<string> {
    const jsonFriendGames = await client.get(id) ?? '[]'
    const parsedFriendGames = JSON.parse(jsonFriendGames) as Game []
    parsedFriendGames.push(game)
    const result = await client.set('friend-' + id, JSON.stringify(parsedFriendGames))
    if (result != null) return 'cached friend game'
    else return 'cache friend game fail'
  }

  private async deleteFriendCacheGame (id: string, gameId: string): Promise<string> {
    const jsonFriendGames = await client.get('friend-' + id) ?? '[]'
    const parsedFriendGames = JSON.parse(jsonFriendGames) as Game []
    const filteredFriendGames = parsedFriendGames.filter(game => game.id !== gameId)
    const result = await client.set('friend-' + id, JSON.stringify(filteredFriendGames))
    if (result != null) return 'cached delete friend game'
    else return 'cache delete friend game fail'
  }

  private async friendsPublishSetGame (user: User, msg: string, game: Game): Promise<void> {
    if ((user?.followedBy) != null) {
      for (const friend of user.followedBy) {
        if ((friend.whosFollowing?.username) != null) {
          pubSub.publish(friend.whosFollowing?.username, msg)
          await this.setFriendCacheGame(friend.whosFollowing.id, game)
        }
      }
    }
  }

  private async friendsPublishDeleteGame (user: User, msg: string, gameId: string): Promise<void> {
    if ((user?.followedBy) != null) {
      for (const friend of user.followedBy) {
        if ((friend.whosFollowing?.username) != null) {
          pubSub.publish(friend.whosFollowing?.username, msg)
          await this.deleteFriendCacheGame(friend.whosFollowing.id, gameId)
        }
      }
    }
  }

  private gamePublish (game: Game): void {
    pubSub.publish(game.id, game)
  }
}
