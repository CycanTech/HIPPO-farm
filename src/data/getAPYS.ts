import getAPY from '@/data/getAPY'
import { PoolInfo } from '../store/state-types'

export default async function getAPYS(pools: PoolInfo[]): Promise<{ [poolId: number]: string }> {
  const allPoolPoint = pools.reduce((t, { allocPoint }) => (t += allocPoint), 0)

  const APYLIST = await Promise.all(
    pools.map((item) => getAPY(item.token, allPoolPoint / item.allocPoint))
  )
  const APYS: { [poolId: number]: string } = {}
  APYLIST.forEach((APY, i) => {
    APYS[pools[i].poolId] = APY
  })
  return APYS
}
