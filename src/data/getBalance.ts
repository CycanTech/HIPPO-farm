import { Token, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import getNotAccountWeb3 from '../common/ts/getNotAccountWeb3'
import ERC20 from '../abi/ERC20.json'
import { getContract } from '@/common/ts/utils'

export default async function getBalance(token: Token, account?: string): Promise<TokenAmount> {
  const web3 = getNotAccountWeb3()
  if (!account) {
    throw Error(`getBalance can't find account.`)
  }

  const contract = getContract(ERC20, token.address, web3)
  const amount = (await contract.methods.balanceOf(account).call()) as string

  return new TokenAmount(token, amount)
}
