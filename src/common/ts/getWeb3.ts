import Web3 from 'web3'
import getProvider from './getProvider'

export default function getWeb3(): Web3 {
  const provider = getProvider()
  if (!provider) {
    throw Error()
  }
  return new Web3(provider)
}
