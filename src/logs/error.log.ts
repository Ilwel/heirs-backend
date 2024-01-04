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

export {
  userNotFoundLogAndError
}
