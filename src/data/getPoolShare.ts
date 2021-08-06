import { ONE_BIPS, ZERO } from '@/common/ts/const'
import { Percent, Token, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import JSBI from 'jsbi'

export default function getPoolShare({
  token,
  stakedAmount,
  poolStakedTokenAmount,
}: {
  token: Token
  stakedAmount: string
  poolStakedTokenAmount: string
}) {
  if (JSBI.equal(JSBI.BigInt(stakedAmount), ZERO)) {
    return '0%'
  }
  const numerator = new TokenAmount(token, stakedAmount)
  const denominator = new TokenAmount(token, poolStakedTokenAmount)
  const poolTokenPercentage = new Percent(numerator.raw, denominator.raw)
  return poolTokenPercentage.lessThan(ONE_BIPS) ? '<0.01%' : `${poolTokenPercentage.toFixed(2)}%`
}
