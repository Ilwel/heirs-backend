import { Service } from 'typedi'
import { User } from '../../prisma/generated/type-graphql'
import { Field, ObjectType } from 'type-graphql'
import { pubSub } from '../pubSub'
import SessionRepository from '../graphql/resolvers/session/session.repository'
import { type IContext } from '../context'
import { v4 } from 'uuid'
import { type GameArgs } from '../graphql/args/game/game.args'

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

  @Field(() => String)
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
  ) {
    this.games = []
  }

  games: Game []

  public async createGame (ctx: IContext, token: string): Promise<Game> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const uuid = v4()
    const newGame: Game = {
      id: uuid,
      players: [{ user, ...initPlayer }],
      status: 'created'
    }
    this.games.push(newGame)
    this.friendsPublish(user, `${user.username} new game`)
    return newGame
  }

  public async registerOnGame (ctx: IContext, token: string, id: string): Promise<Game> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const gameToUpdate = this.games.find(game => game.id === id)
    if (gameToUpdate == null) {
      throw Error('game not found')
    }
    gameToUpdate?.players.push({ user, ...initPlayer })
    this.games.map(item => item.id === gameToUpdate?.id ? gameToUpdate : item)
    this.friendsPublish(user, `${user.username} get in the game`)
    return gameToUpdate
  }

  public async deleteGame (ctx: IContext, token: string, id: string): Promise<string> {
    const user = await this.sessionRepository.getUserWithFriends(ctx, token)
    const filteredGames = this.games.filter(game => game.id !== id)
    this.games = filteredGames
    this.friendsPublish(user, `${user.username} remove game`)
    return 'game deleted'
  }

  public changeGameState (game: GameArgs): string {
    const gamesAtt = this.games.map(item => {
      if (item.id === game.id) {
        const aux = game.players.map((player, index) => ({ user: item.players[index].user, ...player }))
        game.players = aux
        return game as Game
      } else {
        return item
      }
    })
    this.games = gamesAtt
    const sendGame = this.games.find(item => item.id === game.id)
    if (sendGame != null) {
      this.gamePublish(sendGame)
      return 'game updeted'
    }
    return 'game not updeted'
  }

  public listAllFriendsGames (friends: User []): Game [] {
    const friendGames: Game [] = []
    for (const friend of friends) {
      const friendGame = this.games.find(game => game.players[0].user.username === friend.username)
      if (friendGame != null) {
        friendGames.push(friendGame)
      }
    }
    return friendGames
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
