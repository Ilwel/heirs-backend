/* eslint-disable @typescript-eslint/explicit-function-return-type */
const findFirstSessionWhereUsernameAndNotExpiredPrismaQuery = (username: string) => {
  return {
    user: {
      username
    },
    expired: false
  }
}

const createSessionAndConnectUserWhereUsernamePrismaQuery = (username: string) => {
  return {
    user: {
      connect: {
        username
      }
    }
  }
}

export {
  findFirstSessionWhereUsernameAndNotExpiredPrismaQuery,
  createSessionAndConnectUserWhereUsernamePrismaQuery
}
