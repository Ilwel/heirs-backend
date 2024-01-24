import { Service } from 'typedi'
import { User } from '../../prisma/generated/type-graphql'
import { Field, ObjectType } from 'type-graphql'
import { pubSub } from '../pubSub'
import SessionRepository from '../graphql/resolvers/session/session.repository'
import { type IContext } from '../context'
import { v4 } from 'uuid'
import { type GameInput } from '../graphql/input-type/game/game.input'
import { client } from '../cache/redis.client'

@ObjectType()
export class Game {
  @Field(() => String)
    id!: string

  @Field(() => [Player])
    players!: Player []

  @Field(() => String)
    status!: string
}

@ObjectType()
export class Player {
  @Field(() => User)
    user!: User

  @Field(() => String)
    money!: string

  @Field(() => String)
    square!: string

  @Field(() => Boolean)
    playable!: boolean
}

const initPlayer = {
  money: '0',
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
      players: [{ user, ...initPlayer }],
      status: 'created'
    }
    const games = await this.getCacheGames()
    games.push(newGame)
    const result = await this.setCacheGames(games)
    console.log(result)
    this.friendsPublish(user, `${user.username} new game`)
    return newGame
  }

  public async registerOnGame (ctx: IContext, token: string, id: string): Promise<Game> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const games = await this.getCacheGames()
    const gameToUpdate = games.find(game => game.id === id)
    if (gameToUpdate == null) {
      throw Error('game not found')
    }
    gameToUpdate?.players.push({ user, ...initPlayer })
    games.map(item => item.id === gameToUpdate?.id ? gameToUpdate : item)
    const result = await this.setCacheGames(games)
    console.log(result)
    this.friendsPublish(user, `${user.username} get in the game`)
    return gameToUpdate
  }

  public async deleteGame (ctx: IContext, token: string, id: string): Promise<string> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const games = await this.getCacheGames()
    const filteredGames = games.filter(game => game.id !== id)
    const result = await this.setCacheGames(filteredGames)
    console.log(result)
    this.friendsPublish(user, `${user.username} remove game`)
    return 'game deleted'
  }

  public async changeGameState (game: GameInput, ctx: IContext, token: string): Promise<string> {
    const games = await this.getCacheGames()
    let gamesAtt: Game [] = []
    if (game.players.length === 0) {
      const user = await this.sessionRepository.getUserWithFriends(ctx, token)
      gamesAtt = games.filter(item => item.id !== game.id)
      const result = await this.setCacheGames(gamesAtt)
      console.log(result)
      this.friendsPublish(user, `${user.username} remove game`)
    } else {
      gamesAtt = games.map(item => {
        if (item.id === game.id) {
          const aux = game.players.map((player, index) => ({ user: item.players[index].user, ...player }))
          game.players = aux
          return game as Game
        } else {
          return item
        }
      })
      const result = await this.setCacheGames(gamesAtt)
      console.log(result)
    }

    const sendGame = games.find(item => item.id === game.id)
    if (sendGame != null) {
      this.gamePublish(sendGame)
      return 'game updeted'
    }
    return 'game not updeted'
  }

  public async listAllFriendsGames (friends: User []): Promise<Game []> {
    const friendGames: Game [] = []
    for (const friend of friends) {
      const games = await this.getCacheGames()
      const friendGame = games.find(game => game.players[0].user.username === friend.username)
      if (friendGame != null) {
        friendGames.push(friendGame)
      }
    }
    return friendGames
  }

  private async getCacheGames (): Promise<Game [] > {
    const jsonGames = await client.get('games')
    if (jsonGames != null) {
      const games = JSON.parse(jsonGames) as Game []
      return games
    } else {
      return []
    }
  }

  private async setCacheGames (games: Game []): Promise<string> {
    const result = await client.set('games', JSON.stringify(games))
    if (result != null) return 'cached'
    else return 'cache fail'
  }

  private friendsPublish (user: User, msg: string): void {
    if ((user?.followedBy) != null) {
      for (const friend of user.followedBy) {
        if ((friend.whosFollowing?.username) != null) {
          pubSub.publish(friend.whosFollowing?.username, msg)
        }
      }
    }
  }

  private gamePublish (game: Game): void {
    pubSub.publish(game.id, game)
  }
}
