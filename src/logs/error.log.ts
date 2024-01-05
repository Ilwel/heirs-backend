import { GraphQLError } from 'graphql'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const userNotFoundLogAndError = () => {
  console.error('😥 user not found or incorrect password')
  return new GraphQLError('😥 user not found or incorrect password', {
    extensions: {
      code: 'NOT_FOUND',
      fullMessage: '😥 user not found or incorrect password'
    }
  })
}

const sessionExpiredOrNotFound = () => {
  console.error('😥 session expired or not found')
  return new GraphQLError('😥 session expired or not found', {
    extensions: {
      code: 'UNAUTHORIZED',
      fullMessage: '😥 session expired or not found'
    }
  })
}

export {
  userNotFoundLogAndError,
  sessionExpiredOrNotFound
}
