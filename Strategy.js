export * from "./Param.js";
export function StrategySignalTrailing(signal, bar, sl_Offset) {
    let [trendPrice, contrTrendPrice, k] = signal.volume > 0 ? [bar.high, bar.low, 1] : [bar.low, bar.high, -1];
    if (signal.stoploss != null && (contrTrendPrice - signal.stoploss) * k <= 0) //if (bar.low <= this.signal.stoploss)
        return null; //signal = null;
    if (signal.stoploss == null || (signal.trendExtrem != null && (trendPrice - signal.trendExtrem) * k >= 0)) { // if (bar.high >= trendExtrem) {
        let newSignal = Object.assign({}, signal);
        newSignal.stoploss = contrTrendPrice - sl_Offset * k; // = bar.low;
        newSignal.trendExtrem = trendPrice; // = bar.high;
        return newSignal;
    }
    return signal;
}
export function createStrategyObject(strategy, params, tf) {
    return { strategy, paramsData: { params, tf } };
}
// Реализация
export function getSignaller(strategyObjOrStrategy, params, tf) {
    let strategyObj = strategyObjOrStrategy.getSignaller == null ? strategyObjOrStrategy : createStrategyObject(strategyObjOrStrategy, params, tf);
    return strategyObj.strategy.getSignaller(strategyObj.paramsData.params, strategyObj.paramsData.tf);
}
