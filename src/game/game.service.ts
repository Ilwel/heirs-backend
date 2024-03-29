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
    const games = await this.getCacheGames()
    const hasPlayer = games.find(game => game.players.map(item => item.user.id).includes(user.id))
    if (hasPlayer != null) {
      const removePlayer = hasPlayer.players.filter(item => item.user.id !== user.id)
      hasPlayer.players = removePlayer
      games.map(game => game.id === hasPlayer.id ? hasPlayer : game)
    }
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
    const hasPlayer = gameToUpdate.players.find(item => item.user.id === user.id)
    if (hasPlayer == null) {
      gameToUpdate?.players.push({ user, ...initPlayer, role: 'PLAYER' })
    }
    games.map(item => item.id === gameToUpdate?.id ? gameToUpdate : item)
    const result = await this.setCacheGames(games)
    console.log(result)
    this.friendsPublish(user, `${user.username} get in the game`)
    this.gamePublish(gameToUpdate)
    return gameToUpdate
  }

  public async getGame (id: string): Promise<Game> {
    const games = await this.getCacheGames()
    const game = games.find(item => item.id === id)
    if (game == null) {
      throw Error('not found')
    }
    return game
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
    let games = await this.getCacheGames()
    let gamesAtt: Game [] = []
    if (game.players.length === 0) {
      const user = await this.sessionRepository.getUserWithFriends(ctx, token)
      gamesAtt = games.filter(item => item.id !== game.id)
      const result = await this.setCacheGames(gamesAtt)
      console.log(result)
      this.friendsPublish(user, `${user.username} remove game`)
    } else {
      gamesAtt = games.map(item => item.id === game.id ? game as Game : item)
      const result = await this.setCacheGames(gamesAtt)
      console.log(result)
    }
    games = await this.getCacheGames()
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
      const friendGame = games.find(game => game.players[0]?.user.username === friend.username)
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
