import getWeb3 from './getWeb3'
import ERC20 from '../../abi/ERC20.json'
import { getContract } from './utils'
import { Token } from '@cointribute/pancakeswap-sdk-v2'
import { MaxUint256 } from '@ethersproject/constants'

export default async function approve(
  token: Token,
  spender: string,
  account?: string
): Promise<boolean> {
  const web3 = getWeb3()

  if (!web3) {
    throw Error(`Could not find web3 ->approve`)
  }

  if (!account) {
    throw Error(`Could not find user ->approve`)
  }

  const contract = getContract(ERC20, token.address, web3)
  try {
    return await contract.methods.approve(spender, MaxUint256.toString()).send({ from: account })
  } catch (error) {
    if (error.code !== 4001) {
      console.log(`Failed approve ${error}`)
    }
    return false
  }
}
