export interface TVCandlestick {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TVLinePoint {
  time: number;
  value: number;
}

export function toTVCandlesticks(
  data: { date: Date; open: number | null; high: number | null; low: number | null; close: number | null; volume?: number | null }[]
): TVCandlestick[] {
  return data
    .filter((d) => d.open !== null && d.high !== null && d.low !== null && d.close !== null)
    .map((d) => ({
      time: Math.floor(d.date.getTime() / 1000),
      open: d.open!,
      high: d.high!,
      low: d.low!,
      close: d.close!,
      ...(d.volume !== undefined && d.volume !== null ? { volume: d.volume } : {}),
    }));
}

export function toTVLine(
  data: { date: Date; value: number | null }[]
): TVLinePoint[] {
  return data
    .filter((d) => d.value !== null)
    .map((d) => ({
      time: Math.floor(d.date.getTime() / 1000),
      value: d.value!,
    }));
}

export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j];
      }
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);

  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      result.push(ema);
    } else {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
  }
  return result;
}

export function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
      continue;
    }

    let gains = 0;
    let losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = data[j] - data[j - 1];
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - 100 / (1 + rs));
    }
  }
  return result;
}

export interface BollingerBands {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
}

export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  stdDev: number = 2
): BollingerBands {
  const sma = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    if (sma[i] === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      let sumSqDiff = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sumSqDiff += Math.pow(data[j] - sma[i]!, 2);
      }
      const std = Math.sqrt(sumSqDiff / period);
      upper.push(sma[i]! + stdDev * std);
      lower.push(sma[i]! - stdDev * std);
    }
  }

  return { upper, middle: sma, lower };
}

export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i]! - slowEMA[i]!);
    }
  }

  const validMACD = macdLine.filter((v): v is number => v !== null);
  const signalLine = calculateEMA(validMACD, signalPeriod);

  const signal: (number | null)[] = [];
  const histogram: (number | null)[] = [];
  let signalIdx = 0;
  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] === null) {
      signal.push(null);
      histogram.push(null);
    } else {
      const sig = signalLine[signalIdx];
      signal.push(sig);
      histogram.push(macdLine[i]! - (sig ?? 0));
      signalIdx++;
    }
  }

  return { macd: macdLine, signal, histogram };
}
