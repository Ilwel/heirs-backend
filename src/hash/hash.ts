import bcrypt from 'bcrypt'
import { Service } from 'typedi'

@Service()
export class Hash {
  public async hash (toHash: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(toHash, salt)
    return hashed
  }
}
