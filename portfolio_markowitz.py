import argparse

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from scipy.optimize import minimize


# ------------------------------------------------------------
# Configuración inicial
# ------------------------------------------------------------
TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "NVDA", "META", "NFLX", "ORCL", "AMD"
]
START_DATE = "2023-01-01"
END_DATE = "2026-06-20"
RISK_FREE_RATE = 0.0
NUM_PORTFOLIOS = 10000
ANNUALIZATION_FACTOR = 252


# ------------------------------------------------------------
# Helpers
# ------------------------------------------------------------
def download_prices(tickers, start_date, end_date):
    """
    Descarga precios ajustados por acción usando yfinance.
    Devuelve un DataFrame con columnas por ticker.
    """
    data = yf.download(
        tickers=tickers,
        start=start_date,
        end=end_date,
        auto_adjust=True,
        progress=False,
        group_by="column",
        threads=True,
    )

    if isinstance(data.columns, pd.MultiIndex):
        level_values = data.columns.get_level_values(0)
        if "Adj Close" in level_values:
            data = data.xs("Adj Close", axis=1, level=0, drop_level=True)
        elif "Close" in level_values:
            data = data.xs("Close", axis=1, level=0, drop_level=True)
        else:
            raise ValueError(
                "No se encontró una columna 'Adj Close' o 'Close' en los datos descargados."
            )
    elif "Adj Close" in data.columns:
        data = data["Adj Close"]
    elif "Close" in data.columns:
        data = data["Close"]
    else:
        raise ValueError(
            "No se encontró una columna 'Adj Close' o 'Close' en los datos descargados."
        )

    data = data.dropna(how="all")
    data = data.interpolate(method="time").ffill().bfill()
    return data


def compute_daily_returns(prices):
    """
    Calcula retornos diarios simples.
    Se devuelve un DataFrame con retornos diarios.
    """
    returns = prices.pct_change().dropna()
    return returns


def annualize_mean(mean_daily_returns):
    return mean_daily_returns * ANNUALIZATION_FACTOR


def annualize_cov(cov_daily):
    return cov_daily * ANNUALIZATION_FACTOR


def portfolio_return(weights, mean_returns):
    return float(weights @ mean_returns)


def portfolio_volatility(weights, cov_matrix):
    return float(np.sqrt(weights @ cov_matrix @ weights))


def sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate=RISK_FREE_RATE):
    expected_return = portfolio_return(weights, mean_returns)
    volatility = portfolio_volatility(weights, cov_matrix)
    if volatility == 0:
        return 0.0
    return (expected_return - risk_free_rate) / volatility


# ------------------------------------------------------------
# Optimización
# ------------------------------------------------------------
def optimize_minimum_variance(mean_returns, cov_matrix):
    num_assets = len(mean_returns)

    def objective(weights):
        return portfolio_volatility(weights, cov_matrix) ** 2

    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0})
    bounds = [(0.0, 1.0) for _ in range(num_assets)]

    result = minimize(
        objective,
        x0=np.full(num_assets, 1 / num_assets),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
    )

    if not result.success:
        raise RuntimeError(f"No se pudo optimizar mínima varianza: {result.message}")

    weights = result.x
    return {
        "weights": weights,
        "return": portfolio_return(weights, mean_returns),
        "volatility": portfolio_volatility(weights, cov_matrix),
        "sharpe": sharpe_ratio(weights, mean_returns, cov_matrix),
    }


def optimize_max_sharpe(mean_returns, cov_matrix):
    num_assets = len(mean_returns)

    def neg_sharpe(weights):
        return -sharpe_ratio(weights, mean_returns, cov_matrix)

    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1.0})
    bounds = [(0.0, 1.0) for _ in range(num_assets)]

    result = minimize(
        neg_sharpe,
        x0=np.full(num_assets, 1 / num_assets),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints,
    )

    if not result.success:
        raise RuntimeError(f"No se pudo optimizar máximo Sharpe: {result.message}")

    weights = result.x
    return {
        "weights": weights,
        "return": portfolio_return(weights, mean_returns),
        "volatility": portfolio_volatility(weights, cov_matrix),
        "sharpe": sharpe_ratio(weights, mean_returns, cov_matrix),
    }


# ------------------------------------------------------------
# Simulación Monte Carlo
# ------------------------------------------------------------
def simulate_random_portfolios(mean_returns, cov_matrix, num_portfolios=NUM_PORTFOLIOS):
    rng = np.random.default_rng(42)
    num_assets = len(mean_returns)

    returns = np.empty(num_portfolios)
    volatilities = np.empty(num_portfolios)
    sharpe_values = np.empty(num_portfolios)

    for i in range(num_portfolios):
        weights = rng.dirichlet(np.ones(num_assets))
        ret = portfolio_return(weights, mean_returns)
        vol = portfolio_volatility(weights, cov_matrix)
        sharpe = sharpe_ratio(weights, mean_returns, cov_matrix)

        returns[i] = ret
        volatilities[i] = vol
        sharpe_values[i] = sharpe

    return pd.DataFrame(
        {
            "retorno": returns,
            "volatilidad": volatilities,
            "sharpe": sharpe_values,
        }
    )


# ------------------------------------------------------------
# Visualización
# ------------------------------------------------------------
def plot_frontier(sim_results, min_var, max_sharpe):
    plt.figure(figsize=(10, 7))
    scatter = plt.scatter(
        sim_results["volatilidad"],
        sim_results["retorno"],
        c=sim_results["sharpe"],
        cmap="viridis",
        alpha=0.5,
        s=15,
    )

    plt.scatter(
        min_var["volatility"],
        min_var["return"],
        color="red",
        marker="*",
        s=300,
        label="Mínima varianza",
    )
    plt.scatter(
        max_sharpe["volatility"],
        max_sharpe["return"],
        color="gold",
        marker="*",
        s=300,
        label="Máximo Sharpe",
    )

    plt.xlabel("Volatilidad (riesgo)")
    plt.ylabel("Retorno esperado")
    plt.title("Frontera eficiente - Portafolio de Markowitz")
    plt.colorbar(scatter, label="Sharpe Ratio")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.show()


# ------------------------------------------------------------
# Ejecución principal
# ------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Optimización de portafolio de Markowitz con Python."
    )
    parser.add_argument(
        "--tickers",
        nargs="+",
        default=TICKERS,
        help="Lista de tickers a analizar (por ejemplo: AAPL MSFT GOOGL).",
    )
    parser.add_argument(
        "--start",
        default=START_DATE,
        help="Fecha inicial para descargar precios (YYYY-MM-DD).",
    )
    parser.add_argument(
        "--end",
        default=END_DATE,
        help="Fecha final para descargar precios (YYYY-MM-DD).",
    )
    args = parser.parse_args()

    if len(args.tickers) < 2:
        raise ValueError("Debes proporcionar al menos dos tickers.")

    prices = download_prices(args.tickers, args.start, args.end)
    if prices.empty:
        raise ValueError("No se pudieron descargar precios válidos.")

    # Aseguramos columnas limpias
    prices = prices.loc[:, ~prices.columns.duplicated()]
    prices = prices.dropna(axis=1, how="all")

    # Retornos diarios
    returns = compute_daily_returns(prices)

    # Media y covarianza anualizadas
    mean_daily = returns.mean()
    cov_daily = returns.cov()

    mean_annual = annualize_mean(mean_daily)
    cov_annual = annualize_cov(cov_daily)

    # Optimización
    min_var = optimize_minimum_variance(mean_annual, cov_annual)
    max_sharpe = optimize_max_sharpe(mean_annual, cov_annual)

    # Simulación Monte Carlo
    sim_results = simulate_random_portfolios(mean_annual, cov_annual)

    # Mostrar resultados de la matriz de covarianza
    print("\nMatriz de covarianzas anualizada:")
    print(cov_annual.round(6))

    print("\nPortafolio de mínima varianza:")
    print(pd.DataFrame(
        {
            "Ticker": list(prices.columns),
            "Peso": np.round(min_var["weights"], 6),
        }
    ))
    print(f"Retorno esperado: {min_var['return']:.6f}")
    print(f"Volatilidad: {min_var['volatility']:.6f}")
    print(f"Sharpe: {min_var['sharpe']:.6f}")

    print("\nPortafolio de máximo Sharpe:")
    print(pd.DataFrame(
        {
            "Ticker": list(prices.columns),
            "Peso": np.round(max_sharpe["weights"], 6),
        }
    ))
    print(f"Retorno esperado: {max_sharpe['return']:.6f}")
    print(f"Volatilidad: {max_sharpe['volatility']:.6f}")
    print(f"Sharpe: {max_sharpe['sharpe']:.6f}")

    # Gráfico
    plot_frontier(sim_results, min_var, max_sharpe)


if __name__ == "__main__":
    main()
