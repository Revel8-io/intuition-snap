export const addressToCaip10 = (
  // input params formatted to fit MetaMask tx params
  address: string, // `0x${string}`,
  chainId: string, // `eip155:${number}`,
): string => {
  return `caip10:${chainId}:${address}`;
};

/**
 * Converts a string representation of a number to a decimal value
 * accounting for the specified number of decimal places.
 *
 * @param value - The string value to convert
 * @param decimals - The number of decimal places (e.g., 18 for ETH)
 * @returns The decimal representation of the value
 */
export const stringToDecimal = (value: string, decimals: number): number => {
  const num = BigInt(value);
  const divisor = BigInt(10 ** decimals);
  const quotient = num / divisor;
  const remainder = num % divisor;

  // Convert to decimal with precision
  const decimalPart = remainder.toString().padStart(decimals, '0');
  const significantDecimals = decimalPart.slice(0, 6); // Keep 6 decimal places

  return Number(`${quotient}.${significantDecimals}`);
};
