/* eslint-disable @typescript-eslint/explicit-function-return-type */
const findFirstTokenWhereUsernameAndNotExpiredPrismaQuery = (username: string) => {
  return {
    user: {
      username
    },
    expired: false
  }
}

const createTokenAndConnectUserWhereUsernamePrismaQuery = (username: string) => {
  return {
    user: {
      connect: {
        username
      }
    }
  }
}

export {
  findFirstTokenWhereUsernameAndNotExpiredPrismaQuery,
  createTokenAndConnectUserWhereUsernamePrismaQuery
}
