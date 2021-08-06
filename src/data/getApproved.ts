import getNotAccountWeb3 from '../common/ts/getNotAccountWeb3'
import ERC20 from '../abi/ERC20.json'
import JSBI from 'jsbi'
import { Token, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import { ZERO } from '../common/ts/const'
import { getContract } from '@/common/ts/utils'

export default async function getApproved(
  token: Token,
  spender: string,
  account?: string,
  amountToApprove?: TokenAmount
): Promise<boolean> {
  if (!account) {
    throw Error(`getApproved can't find account.`)
  }
  const web3 = getNotAccountWeb3()

  const contract = getContract(ERC20, token.address, web3)
  const allowance = (await contract.methods.allowance(account, spender).call()) as string

  if (amountToApprove && amountToApprove instanceof TokenAmount) {
    const allowanceAmount = new TokenAmount(amountToApprove.token, allowance)
    return allowanceAmount.greaterThan(amountToApprove)
  }

  return JSBI.GT(JSBI.BigInt(allowance), ZERO)
}
