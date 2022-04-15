import { CQuotesHistory, CSymbol, CBars, } from "./Trader.js";
import { getSignaller } from "./Strategy.js";
import { RunStrategySignallerTest, } from "./Tester.js";
import { OptimizateSimple, } from "./Optimizer.js";
//import {Strategy_MA} from "./Strategy_MA";
export * from "./Tester.js";
export * from "./Trader.js";
export * from "./Strategy.js";
export { CMyWorker } from "./MyWorker.js";
export { JSON_clone } from "./MyWorker.js";
//----------------------------------
export class CTesterInfo {
    constructor(info, stratInfo, config) {
        return Object.assign(this, info.config ? info : { symInfo: info, strategyInfo: stratInfo, config });
    } //
}
//import { ChartBar, DrawChart } from "./Chart.js"
//function ff(f :()=>any) { }
//,  div? :string
export async function LoadSymbolQuotesForTesterInfo(info) {
    var _a;
    //console.log("Startegy: ",{...info.strategy});
    //console.log("Params: ",[...info.strategyParams]);
    let startTime = info.config.startTime;
    let endTime = info.config.endTime;
    let symName = info.symInfo.name;
    let strategyInfo = info.strategyInfo;
    let strategyTf = strategyInfo.paramsData.tf;
    let signaller = getSignaller(strategyInfo);
    if (!signaller) {
        console.log("Failed to get signaller: ");
        console.log("Strategy: ", Object.assign({}, strategyInfo.strategy), "\n", "Params: ", [...strategyInfo.paramsData.params]);
    }
    if (!signaller) {
        return null;
    }
    let tf = (_a = info.config.tf) !== null && _a !== void 0 ? _a : strategyTf;
    if (!tf)
        throw "timeframe is not defined";
    let minbars = signaller.minRequiredDepthBars;
    if (minbars == null)
        minbars = 1;
    if (tf != strategyTf && strategyTf)
        minbars *= strategyTf.sec / tf.sec;
    let loadStartTime = new Date(startTime.valueOf() - minbars * tf.msec);
    //let bars= await MsTrade.LoadQuotes(sym, tf, loadStartTime, endTime);
    let bars = await info.symInfo.priceInfo.GetBars(tf, loadStartTime, endTime); // MsTrade.GetQuotesCacheable(sym, tf, loadStartTime, endTime);
    if (!bars)
        return null;
    //let res = await __LoadQuotes(TF.H1, new Date("2020.09.01"), new Date("2020.09.10"), ()=>print("Loaded"), ()=>print("Error"));
    //return res;
    let quotesHistory = new CQuotesHistory(new CBars(tf, bars), symName);
    return quotesHistory;
}
export async function RunTest(info, 
//onTick :(testerTick :TesterTick, indicators? :readonly IIndicator[], percent? :number)=>Promise<boolean|void>
onTick) {
    let quotesHistory = await LoadSymbolQuotesForTesterInfo(info);
    if (!quotesHistory)
        return null;
    let symbol = new CSymbol(info.symInfo, quotesHistory);
    // let signaller= getSignaller(info.strategyInfo);
    // if (! signaller) return null;
    //
    // let result = await RunSignallerTest(signaller, info.strategyInfo.paramsData.tf, symbol,  info.config,
    // 	onTick ? (testerTick, percent)=>onTick(testerTick, signaller!.indicators, percent) : undefined
    // );
    let result = await RunStrategySignallerTest(info.strategyInfo, symbol, info.config, onTick);
    console.log("Equity:", [result === null || result === void 0 ? void 0 : result.toStrings()]);
    /*
    let chartBars= new Array<ChartBar>(bars.length);
    for(let i=0; i<bars.length; i++) {
        let bar= bars[i];
        //chartBars[i] = {date: bar.time.toISOString(),  open: bar.open,  high: bar.high,  low: bar.low,  close: bar.close};
    }*/
    //console.log("Drawing chart...");
    //DrawChart(div, chartBars);
    //console.log("Drawing is over.");
    return result;
}
//--------------------------------------------
export async function RunOptimization(item, tf, paramDatas, testerConfig, threadCount, genetic, onResult, //Promise<boolean|void>,
cancelToken) {
    /*
    let info : CTesterInfo = {
        symInfo: item.symbolInfo,
        strategy: item.strategy,
        strategyParams: [],
        tf: testerConfig.defaultTF;
        config: testerConfig
    };

    let quotesHistory= await LoadSymbolQuotesForTesterInfo(info);
    if (!quotesHistory) return null;
    */
    if (!tf) {
        console.log("Timeframe is not defined");
        throw "Timeframe is not defined";
    }
    let startTime = new Date(testerConfig.startTime.valueOf() - 499 * tf.msec);
    let bars = await item.symbolInfo.priceInfo.GetBars(tf, startTime, testerConfig.endTime); //  MsTrade.GetQuotesCacheable(item.symbolInfo.name, tf, startTime, testerConfig.endTime);
    if (!bars)
        return null;
    //let res = await __LoadQuotes(TF.H1, new Date("2020.09.01"), new Date("2020.09.10"), ()=>print("Loaded"), ()=>print("Error"));
    //return res;
    let quotesHistory = new CQuotesHistory(new CBars(tf, bars), item.symbolInfo.name);
    let symbol = new CSymbol(item.symbolInfo, quotesHistory);
    let result = await OptimizateSimple({ symbol, strategy: item.strategy }, paramDatas, testerConfig, threadCount, genetic, onResult, cancelToken);
    return result;
}
