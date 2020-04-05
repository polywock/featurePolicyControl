
// round to nearest step.
const lowerAlpha = range(97, 97 + 26).map(n => String.fromCharCode(n))
const upperAlpha = range(65, 65 + 26).map(n => String.fromCharCode(n))
const numeric = range(10)

export function uuid(n: number, opts: {
  lowerAlpha?: boolean,
  upperAlpha?: boolean,
  numeric?: number
} = { lowerAlpha: true }) {
  let pool = [
    ...(opts.lowerAlpha ? lowerAlpha : []),
    ...(opts.upperAlpha ? upperAlpha : []),
    ...(opts.numeric ? numeric : [])
  ]
  return range(n).map(() => pool[randomInt(0, pool.length)]).join("")
}

export function uuidLowerAlpha(n: number) {
  return uuid(n, {lowerAlpha: true})
}

export function range(rb: number): number[];

export function range(lb: number, rb: number): number[] ;

export function range(lb: number, rb?: number): number[] {
  if (rb === null || rb === undefined) {
    rb = lb 
    lb = 0 
  }
  return Array(rb - lb).fill(0).map((v, i) => lb + i)  
}

export function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min))
}
