/* eslint-disable @typescript-eslint/explicit-function-return-type */
const createUserPrismaQuery = (username: string, password: string) => {
  return {
    username,
    password
  }
}

const findUserWhereUsernamePrismaQuery = (username: string) => {
  return {
    username
  }
}

export {
  createUserPrismaQuery,
  findUserWhereUsernamePrismaQuery
}
