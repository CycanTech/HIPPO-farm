// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getProvider(): any | undefined {
  const ethereum = window.ethereum
  const provider = window?.web3?.currentProvider
  return ethereum || provider || undefined
}

// eslint-disable-next-line
export default function () {
  const provider = getProvider()
  if (provider === undefined || provider === null) {
    throw new Error('Failed to find provider.')
  }
  return provider
}
