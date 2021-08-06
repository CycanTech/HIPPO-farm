import { getAddress } from '@ethersproject/address'
import { parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@cointribute/pancakeswap-sdk-v2'
import Web3 from 'web3'
import JSBI from 'jsbi'
import { USDT, WRAPPED_BNB } from './const'

const toString = Object.prototype.toString

export function setItem(k: string, v: string): void {
  try {
    window.localStorage.setItem(k, v)
  } catch (e) {
    console.log(`SetItem Error ${e}`)
  }
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object'
}

export function getItem(k: string): string | undefined {
  const v = window.localStorage.getItem(k)
  return v || undefined
}

export function getElementPosition(elementId: string): { x: number; y: number } {
  let target: HTMLElement | null = document.getElementById(elementId)
  let currentLeft = 0
  let currentTop = 0

  if (target?.offsetParent) {
    currentLeft = target.offsetLeft
    currentTop = target.offsetTop
    while ((target = target?.offsetParent as HTMLElement)) {
      currentLeft += target.offsetLeft
      currentTop += target.offsetTop
    }
  }

  return { x: currentLeft, y: currentTop }
}

export function isAddress(value: string): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  if (!address) {
    return ''
  }
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

export const isPlianObject = (o: unknown): o is Record<string, unknown> =>
  toString.call(o) === '[object Object]'

export function isEmptyObject(o: unknown): boolean {
  if (!o || !isPlianObject(o)) {
    return true
  }
  return Object.keys(o).length ? false : true
}

// eslint-disable-next-line
export function getContract(abi: any, address: string, library: Web3) {
  if (isAddress(address) === false) {
    throw Error(`Invalid address ${address}`)
  }

  const contract = new library.eth.Contract(abi, address)
  return contract
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function tryParseAmount(value?: string, currency?: Token): TokenAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.info(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

export function formatAmount(balance: string, decimal = 18): number {
  const balanceBI = JSBI.BigInt(balance)
  balance = balanceBI.toString()
  const wholeStr = balance.substring(0, balance.length - decimal) || '0'
  const fractionStr = balance
    .substring(balance.length - decimal)
    .padStart(decimal, '0')
    .substring(0, decimal)

  return Number(trimTrailingZeroes(`${wholeStr}.${fractionStr}`))
}

export function amountToDecimal(amount: string): string {
  const reg = /([0-9]+\.[0-9]{6})[0-9]*/
  return amount.replace(reg, '$1')
}

function trimTrailingZeroes(value: string): string {
  return value.replace(/\.?0*$/, '')
}

export function isUSDT(token: Token): boolean {
  return token.address.toUpperCase() === USDT.address.toUpperCase()
}

export function isWrappedBNB(token: Token): boolean {
  return token.address.toUpperCase() === WRAPPED_BNB.address.toUpperCase()
}
