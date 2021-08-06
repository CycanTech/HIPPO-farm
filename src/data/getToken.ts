import { Token, ChainId } from '@cointribute/pancakeswap-sdk-v2'
import getNotAccountWeb3 from '../common/ts/getNotAccountWeb3'
import ERC20 from '../abi/ERC20.json'
import { getContract } from '@/common/ts/utils'

export default async function getToken(address: string): Promise<Token> {
  const web3 = getNotAccountWeb3()
  const contract = getContract(ERC20, address, web3)

  const [decimals, symbol, tokenName] = (await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
    contract.methods.name().call(),
  ])) as [string, string, string]

  const token = new Token(ChainId.MAINNET, address, Number(decimals), symbol, tokenName)

  return token
}
