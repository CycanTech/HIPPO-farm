import getNotAccountWeb3 from '@/common/ts/getNotAccountWeb3'
import { getContract } from '@/common/ts/utils'
import { Token } from '@cointribute/pancakeswap-sdk-v2'
import getToken from './getToken'
import IPancakePairAbi from '@/abi/IPancakePair.json'

export default async function getCurrencysByLPToken(
  LPToken: Token
): Promise<[Token, Token] | undefined> {
  const web3 = getNotAccountWeb3()
  try {
    const contract = getContract(IPancakePairAbi, LPToken.address, web3)
    const [token0, token1] = await Promise.all([
      contract.methods.token0().call(),
      contract.methods.token1().call(),
    ])
    return await Promise.all([getToken(token0), getToken(token1)])
  } catch (error) {
    return undefined
  }
}
