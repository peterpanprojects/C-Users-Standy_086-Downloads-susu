export function calculatePlatformFee(amount: number, feePercent: number): number {
  return Math.round((amount * feePercent / 100 + Number.EPSILON) * 100) / 100;
}
