export function calculateLogReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  return returns;
}

export function calculateSimpleReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

export function calculateCumulativeReturn(prices: number[]): number {
  if (prices.length < 2) return 0;
  return (prices[prices.length - 1] - prices[0]) / prices[0];
}

export function calculateAnnualizedReturn(prices: number[], days: number): number {
  if (prices.length < 2 || days === 0) return 0;
  const totalReturn = calculateCumulativeReturn(prices);
  const years = days / 365;
  return Math.pow(1 + totalReturn, 1 / years) - 1;
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateVariance(values: number[], ddof: number = 0): number {
  if (values.length < 2) return 0;
  const mean = calculateMean(values);
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - ddof);
}

export function calculateStdDev(values: number[], ddof: number = 0): number {
  return Math.sqrt(calculateVariance(values, ddof));
}

export function calculateVolatility(returns: number[], tradingDays: number = 252): number {
  if (returns.length < 2) return 0;
  const stdDev = calculateStdDev(returns, 1);
  return stdDev * Math.sqrt(tradingDays);
}

export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 0.03,
  tradingDays: number = 252
): number {
  if (returns.length < 2) return 0;
  const volatility = calculateVolatility(returns, tradingDays);
  if (volatility === 0) return 0;
  const meanReturn = calculateMean(returns);
  const annualizedReturn = Math.pow(1 + meanReturn, tradingDays) - 1;
  return (annualizedReturn - riskFreeRate) / volatility;
}

export function calculateCovariance(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  return x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0) / (x.length - 1);
}

export function calculateBeta(assetReturns: number[], marketReturns: number[]): number {
  if (assetReturns.length !== marketReturns.length || assetReturns.length < 2) return 0;
  const covariance = calculateCovariance(assetReturns, marketReturns);
  const marketVariance = calculateVariance(marketReturns, 1);
  if (marketVariance === 0) return 0;
  return covariance / marketVariance;
}

export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  const cov = calculateCovariance(x, y);
  const stdX = calculateStdDev(x, 1);
  const stdY = calculateStdDev(y, 1);
  if (stdX === 0 || stdY === 0) return 0;
  return cov / (stdX * stdY);
}

export function calculateMaxDrawdown(
  prices: number[]
): { maxDrawdown: number; peakIndex: number; troughIndex: number; recoveryIndex: number | null } {
  if (prices.length < 2) {
    return { maxDrawdown: 0, peakIndex: 0, troughIndex: 0, recoveryIndex: null };
  }

  let maxDrawdown = 0;
  let peakIndex = 0;
  let troughIndex = 0;
  let peak = prices[0];
  let recoveryIndex: number | null = null;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
      peakIndex = i;
    }

    const drawdown = (peak - prices[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      troughIndex = i;
      recoveryIndex = null;
    }

    if (drawdown === 0 && maxDrawdown > 0 && recoveryIndex === null) {
      recoveryIndex = i;
    }
  }

  return { maxDrawdown, peakIndex, troughIndex, recoveryIndex };
}

export function calculateCovarianceMatrix(returnsMatrix: number[][]): number[][] {
  const n = returnsMatrix.length;
  if (n === 0) return [];

  const k = returnsMatrix[0].length;
  const means = returnsMatrix.map((row) => calculateMean(row));
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let t = 0; t < k; t++) {
        sum += (returnsMatrix[i][t] - means[i]) * (returnsMatrix[j][t] - means[j]);
      }
      matrix[i][j] = sum / (k - 1);
    }
  }

  return matrix;
}

export function calculateCorrelationMatrix(covarianceMatrix: number[][]): number[][] {
  const n = covarianceMatrix.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      const stdDevI = Math.sqrt(covarianceMatrix[i][i]);
      const stdDevJ = Math.sqrt(covarianceMatrix[j][j]);
      if (stdDevI === 0 || stdDevJ === 0) {
        matrix[i][j] = 0;
      } else {
        matrix[i][j] = covarianceMatrix[i][j] / (stdDevI * stdDevJ);
      }
    }
  }

  return matrix;
}

// --- Portfolio optimization helpers ---

function invertMatrix2D(m: number[][]): number[][] {
  const n = m.length;
  const a = m.map((row) => [...row]);
  const inv = a.map((_, i) => a.map((_, j) => (i === j ? 1 : 0)));

  for (let col = 0; col < n; col++) {
    const pivot = a[col][col];
    if (pivot === 0) throw new Error("Matrix is singular");
    for (let j = 0; j < n; j++) {
      a[col][j] /= pivot;
      inv[col][j] /= pivot;
    }
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = a[row][col];
        for (let j = 0; j < n; j++) {
          a[row][j] -= factor * a[col][j];
          inv[row][j] -= factor * inv[col][j];
        }
      }
    }
  }
  return inv;
}

function matVecMul(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function vecSum(v: number[]): number {
  return v.reduce((a, b) => a + b, 0);
}

function vecDot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

export function calculateMinVarianceWeights(covMatrix: number[][]): number[] {
  const n = covMatrix.length;
  const inv = invertMatrix2D(covMatrix);
  const ones = new Array(n).fill(1);
  const invOnes = matVecMul(inv, ones);
  const sumInvOnes = vecSum(invOnes);
  if (sumInvOnes === 0) return ones.map(() => 1 / n);
  return invOnes.map((v) => v / sumInvOnes);
}

export function calculateMaxSharpeWeights(covMatrix: number[][], meanReturns: number[]): number[] {
  const n = covMatrix.length;
  const inv = invertMatrix2D(covMatrix);
  const invMean = matVecMul(inv, meanReturns);
  const sumInvMean = vecSum(invMean);
  if (sumInvMean === 0) return meanReturns.map(() => 1 / n);
  return invMean.map((v) => v / sumInvMean);
}

export function calculatePortfolioReturn(weights: number[], meanReturns: number[]): number {
  return vecDot(weights, meanReturns);
}

export function calculatePortfolioVariance(weights: number[], covMatrix: number[][]): number {
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  return variance;
}

// --- VaR ---

export function calculateVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length < 2) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sorted.length);
  return sorted[Math.min(index, sorted.length - 1)];
}

export function calculateCVaR(returns: number[], confidence: number = 0.95): number {
  if (returns.length < 2) return 0;
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sorted.length);
  const tail = sorted.slice(0, Math.min(index + 1, sorted.length));
  return calculateMean(tail);
}

// --- Alpha & Information Ratio ---

export function calculateAlpha(
  assetReturns: number[],
  marketReturns: number[],
  riskFreeRate: number = 0.03,
  tradingDays: number = 252
): number {
  if (assetReturns.length < 2 || marketReturns.length < 2) return 0;
  const n = Math.min(assetReturns.length, marketReturns.length);
  const aRet = assetReturns.slice(-n);
  const mRet = marketReturns.slice(-n);
  const beta = calculateBeta(aRet, mRet);
  const meanAsset = calculateMean(aRet);
  const meanMarket = calculateMean(mRet);
  const annAsset = Math.pow(1 + meanAsset, tradingDays) - 1;
  const annMarket = Math.pow(1 + meanMarket, tradingDays) - 1;
  return annAsset - (riskFreeRate + beta * (annMarket - riskFreeRate));
}

export function calculateTrackingError(assetReturns: number[], benchmarkReturns: number[]): number {
  const n = Math.min(assetReturns.length, benchmarkReturns.length);
  if (n < 2) return 0;
  const diffs = assetReturns.slice(-n).map((r, i) => r - benchmarkReturns.slice(-n)[i]);
  return calculateStdDev(diffs, 1);
}

export function calculateInformationRatio(
  assetReturns: number[],
  benchmarkReturns: number[],
  tradingDays: number = 252
): number {
  const n = Math.min(assetReturns.length, benchmarkReturns.length);
  if (n < 2) return 0;
  const aRet = assetReturns.slice(-n);
  const bRet = benchmarkReturns.slice(-n);
  const excessReturns = aRet.map((r, i) => r - bRet[i]);
  const meanExcess = calculateMean(excessReturns);
  const trackingErr = calculateStdDev(excessReturns, 1);
  if (trackingErr === 0) return 0;
  const annExcess = Math.pow(1 + meanExcess, tradingDays) - 1;
  const annTracking = trackingErr * Math.sqrt(tradingDays);
  return annExcess / annTracking;
}
