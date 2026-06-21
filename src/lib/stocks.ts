export interface StockInfo {
  symbol: string;
  name: string;
  market: "USA" | "ARG" | "WORLD";
  type: "stock" | "crypto" | "bond";
}

export const ASSET_GROUPS: { label: string; filter: (s: StockInfo) => boolean }[] = [
  { label: "Acciones USA", filter: (s) => s.type === "stock" && s.market === "USA" },
  { label: "ADRs Argentina", filter: (s) => s.type === "stock" && s.market === "ARG" },
  { label: "Criptomonedas", filter: (s) => s.type === "crypto" },
  { label: "Bonos", filter: (s) => s.type === "bond" },
];

export const AVAILABLE_STOCKS: StockInfo[] = [
  // ---- USA Stocks ----
  { symbol: "AAPL", name: "Apple Inc.", market: "USA", type: "stock" },
  { symbol: "MSFT", name: "Microsoft Corp.", market: "USA", type: "stock" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "USA", type: "stock" },
  { symbol: "AMZN", name: "Amazon.com Inc.", market: "USA", type: "stock" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "USA", type: "stock" },
  { symbol: "NVDA", name: "NVIDIA Corp.", market: "USA", type: "stock" },
  { symbol: "META", name: "Meta Platforms Inc.", market: "USA", type: "stock" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", market: "USA", type: "stock" },
  { symbol: "V", name: "Visa Inc.", market: "USA", type: "stock" },
  { symbol: "NFLX", name: "Netflix Inc.", market: "USA", type: "stock" },

  // ---- Argentina Stocks (ADRs) ----
  { symbol: "YPF", name: "YPF Sociedad Anónima", market: "ARG", type: "stock" },
  { symbol: "GGAL", name: "Grupo Financiero Galicia", market: "ARG", type: "stock" },
  { symbol: "BMA", name: "Banco Macro S.A.", market: "ARG", type: "stock" },
  { symbol: "PAM", name: "Pampa Energía S.A.", market: "ARG", type: "stock" },
  { symbol: "SUPV", name: "Grupo Supervielle S.A.", market: "ARG", type: "stock" },
  { symbol: "BBAR", name: "Banco BBVA Argentina", market: "ARG", type: "stock" },
  { symbol: "CEPU", name: "Central Puerto S.A.", market: "ARG", type: "stock" },
  { symbol: "LOMA", name: "Loma Negra C.I.A.S.A.", market: "ARG", type: "stock" },
  { symbol: "EDN", name: "Edenor S.A.", market: "ARG", type: "stock" },
  { symbol: "TGS", name: "Transportadora de Gas del Sur", market: "ARG", type: "stock" },

  // ---- ETFs ----
  { symbol: "SPY", name: "S&P 500 ETF", market: "USA", type: "stock" },
  { symbol: "QQQ", name: "Nasdaq ETF", market: "USA", type: "stock" },
  { symbol: "DIA", name: "Dow ETF", market: "USA", type: "stock" },
  { symbol: "IWM", name: "Russell 2000 ETF", market: "USA", type: "stock" },

  // ---- Cryptocurrencies (via Yahoo Finance como XXX-USD) ----
  { symbol: "BTC-USD", name: "Bitcoin", market: "WORLD", type: "crypto" },
  { symbol: "ETH-USD", name: "Ethereum", market: "WORLD", type: "crypto" },
  { symbol: "USDT-USD", name: "Tether", market: "WORLD", type: "crypto" },
  { symbol: "XRP-USD", name: "XRP", market: "WORLD", type: "crypto" },
  { symbol: "BNB-USD", name: "BNB", market: "WORLD", type: "crypto" },
  { symbol: "SOL-USD", name: "Solana", market: "WORLD", type: "crypto" },
  { symbol: "USDC-USD", name: "USD Coin", market: "WORLD", type: "crypto" },
  { symbol: "DOGE-USD", name: "Dogecoin", market: "WORLD", type: "crypto" },
  { symbol: "TRX-USD", name: "Tron", market: "WORLD", type: "crypto" },
  { symbol: "ADA-USD", name: "Cardano", market: "WORLD", type: "crypto" },
  { symbol: "HYPE-USD", name: "Hyperliquid", market: "WORLD", type: "crypto" },
  { symbol: "XLM-USD", name: "Stellar", market: "WORLD", type: "crypto" },
  { symbol: "SUI-USD", name: "Sui", market: "WORLD", type: "crypto" },
  { symbol: "BCH-USD", name: "Bitcoin Cash", market: "WORLD", type: "crypto" },
  { symbol: "LINK-USD", name: "Chainlink", market: "WORLD", type: "crypto" },
  { symbol: "AVAX-USD", name: "Avalanche", market: "WORLD", type: "crypto" },
  { symbol: "LEO-USD", name: "LEO Token", market: "WORLD", type: "crypto" },
  { symbol: "TON-USD", name: "Toncoin", market: "WORLD", type: "crypto" },
  { symbol: "SHIB-USD", name: "Shiba Inu", market: "WORLD", type: "crypto" },
  { symbol: "HBAR-USD", name: "Hedera", market: "WORLD", type: "crypto" },

  // ---- Argentina Bonos (via Yahoo Finance como .BA) ----
  { symbol: "AL29.BA", name: "Bono AL29", market: "ARG", type: "bond" },
  { symbol: "AL30.BA", name: "Bono AL30", market: "ARG", type: "bond" },
  { symbol: "AL35.BA", name: "Bono AL35", market: "ARG", type: "bond" },
  { symbol: "AL38.BA", name: "Bono AL38", market: "ARG", type: "bond" },
  { symbol: "AL41.BA", name: "Bono AL41", market: "ARG", type: "bond" },
  { symbol: "AE38.BA", name: "Bono AE38", market: "ARG", type: "bond" },
  { symbol: "GD29.BA", name: "Bono GD29", market: "ARG", type: "bond" },
  { symbol: "GD30.BA", name: "Bono GD30", market: "ARG", type: "bond" },
  { symbol: "GD35.BA", name: "Bono GD35", market: "ARG", type: "bond" },
  { symbol: "GD38.BA", name: "Bono GD38", market: "ARG", type: "bond" },
  { symbol: "GD41.BA", name: "Bono GD41", market: "ARG", type: "bond" },
  { symbol: "GD46.BA", name: "Bono GD46", market: "ARG", type: "bond" },
  { symbol: "TX26.BA", name: "Bono TX26", market: "ARG", type: "bond" },
  { symbol: "TX28.BA", name: "Bono TX28", market: "ARG", type: "bond" },
  { symbol: "TX31.BA", name: "Bono TX31", market: "ARG", type: "bond" },
  { symbol: "T2X6.BA", name: "Bono T2X6", market: "ARG", type: "bond" },
  { symbol: "TZX27.BA", name: "Bono TZX27", market: "ARG", type: "bond" },
  { symbol: "TO26.BA", name: "Bono TO26", market: "ARG", type: "bond" },
  { symbol: "PR13.BA", name: "Bono PR13", market: "ARG", type: "bond" },
  { symbol: "PR17.BA", name: "Bono PR17", market: "ARG", type: "bond" },

  // ---- Bonos USD / LECAPs / ONs (MAE A3) ----
  { symbol: "AL30D.BA", name: "Bono AL30 USD", market: "ARG", type: "bond" },
  { symbol: "AL35D.BA", name: "Bono AL35 USD", market: "ARG", type: "bond" },
  { symbol: "GD30D.BA", name: "Bono GD30 USD", market: "ARG", type: "bond" },
  { symbol: "GD35D.BA", name: "Bono GD35 USD", market: "ARG", type: "bond" },
  { symbol: "AE38D.BA", name: "Bono AE38 USD", market: "ARG", type: "bond" },
  { symbol: "BA37D.BA", name: "Bono BA37 USD", market: "ARG", type: "bond" },
  { symbol: "BPY26.BA", name: "Bono PBA Y26", market: "ARG", type: "bond" },
  { symbol: "PBY26.BA", name: "Bono PBA 2026", market: "ARG", type: "bond" },
  { symbol: "DICP.BA", name: "Bono DICP", market: "ARG", type: "bond" },
  { symbol: "PARP.BA", name: "Bono PARP", market: "ARG", type: "bond" },
  { symbol: "CO21D.BA", name: "ON CO21D", market: "ARG", type: "bond" },
  { symbol: "TTD26.BA", name: "Letra TTD26", market: "ARG", type: "bond" },
  { symbol: "TTS26.BA", name: "Letra TTS26", market: "ARG", type: "bond" },
  { symbol: "TTJ26.BA", name: "Letra TTJ26", market: "ARG", type: "bond" },
  { symbol: "TTM26.BA", name: "Letra TTM26", market: "ARG", type: "bond" },
  { symbol: "S10N5.BA", name: "LECAP S10N5", market: "ARG", type: "bond" },
  { symbol: "S29G5.BA", name: "LECAP S29G5", market: "ARG", type: "bond" },
  { symbol: "S31L5.BA", name: "LECAP S31L5", market: "ARG", type: "bond" },
  { symbol: "T13F6.BA", name: "Bono T13F6", market: "ARG", type: "bond" },
  { symbol: "TZVD5.BA", name: "Bono TZVD5", market: "ARG", type: "bond" },
];
