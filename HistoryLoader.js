import { FBinanceSymbols, FBinanceLoad } from "../and/LoadHistoryBinance.js";
import * as MsTrade from "./Data_MSTrade.js";
class CHistorySource_MsTrade {
    constructor() {
        this.name = "MsTrade";
    }
    getSymbols() { return Promise.resolve(["BTCUSD", "ETHUSD", "LTCUSD", "XRPUSD"]); }
    getBars(symbol, tf, start, end) { return MsTrade.LoadQuotesWithConversionTimeframe(symbol, tf, start, end); }
    getBars2(symbol, tf, end, barsCount) { return this.getBars(symbol, tf, new Date(end.valueOf() - barsCount * tf.msec), end); }
}
export const HistorySource_MsTrade = new CHistorySource_MsTrade;
class CHistorySource_Binance {
    constructor() {
        this.name = "Binance";
    }
    getSymbols() { return FBinanceSymbols(); }
    getBars(symbol, tf, start, end) { return FBinanceLoad(symbol, tf, start, end); }
    getBars2(symbol, tf, end, barsCount) { return this.getBars(symbol, tf, new Date(end.valueOf() - barsCount * tf.msec), end); }
}
export const HistorySource_Binance = new CHistorySource_Binance;
//const __symHistoryCache = new Map<string, {tf :TF, startTime :const_Date, endTime :const_Date, bars :readonly CBar[]}> ();
// Получить кэшируемые котировки
export async function GetQuotesCacheable(source, symbol, tf, startTime, endTime, cache) {
    let key = symbol + " " + tf.name;
    let cachedData = cache.get(key);
    //console.log(cachedData, tf, startTime, endTime);
    //if (cachedData) console.log("ExistCacheData:", cachedData.tf, cachedData.startTime, cachedData.endTime);
    //console.log("!!!!", cachedData ? cachedData.tf+"  "+cachedData.startTime+"  "+cachedData.endTime : "");
    if (cachedData && cachedData.tf == tf && cachedData.startTime <= startTime && cachedData.endTime >= endTime) {
        console.log("Got quotes history from cache:", cachedData.bars.length, "bars");
        return cachedData.bars;
    }
    let localTime = Date.now();
    console.log("Start downloading quotes for ", key, "from", source.name);
    //let bars= await MsTrade.LoadQuotes(sym, tf, loadStartTime, endTime);
    let bars = await source.getBars(symbol, tf, startTime, endTime);
    if (!bars)
        return null;
    console.log("ok.  Received:", bars.length, "bars.  Elapsed:", Date.now() - localTime, "ms");
    if (bars.length == 0)
        return null; //
    if (endTime < new Date(Date.now() - Math.max(tf.sec, 3600 * 8) * 1000)) // Если не позднее прошлых суток или 8 часов
        cache.set(key, { tf, startTime, endTime, bars });
    return bars;
}
// Источник с кэшируемыми котировками
export class CHistorySourceCacheable {
    constructor(source) { this._source = source; this.cache = new Map(); }
    getSymbols() { return this._source.getSymbols(); }
    getBars(symbol, tf, start, end) { return GetQuotesCacheable(this._source, symbol, tf, start, end, this.cache); }
    getBars2(symbol, tf, end, barsCount) { return this.getBars(symbol, tf, new Date(end.valueOf() - barsCount * tf.msec), end); }
}
export class CHistoryCacheable_MsTrade extends CHistorySourceCacheable {
    constructor() { super(HistorySource_MsTrade); }
}
export class CHistoryCacheable_Binance extends CHistorySourceCacheable {
    constructor() { super(HistorySource_Binance); }
}
