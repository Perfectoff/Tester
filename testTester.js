import { CQuotesHistory, CSymbol, TF, CBars } from "./Trader.js";
import { RunSignallerTest } from "./Tester.js";
import * as MsTrade from "./Data_MSTrade.js";
import { Strategy_MA } from "./Strategy_MA.js";
async function Check() {
    let time = new Date();
    let sym = "btcusd";
    let tf = TF.H1;
    let bars = await MsTrade.LoadQuotes(sym, tf, new Date("2021-01-01"), new Date("2021-09-01"));
    //let res = await __LoadQuotes(TF.H1, new Date("2020.09.01"), new Date("2020.09.10"), ()=>print("Loaded"), ()=>print("Error"));
    //return res;
    console.log("ok.  Received:", bars.length, "bars.  Elapsed:", (new Date().valueOf() - time.valueOf()), " ms");
    if (bars.length == 0)
        return;
    let quotesHistory = new CQuotesHistory(new CBars(tf, bars), sym);
    //console.log(quotesHistory.minTf);
    //console.log(bars);
    //return;
    let symInfo = {
        name: sym,
        lotSize: 10,
        comissionPerSide: { value: 10, unit: "USD" },
        tickSize: 1,
        quoteCurrency: "USD"
    };
    let signaller = Strategy_MA.getSignaller([3, 5]);
    let symbol = new CSymbol(symInfo, quotesHistory);
    let testerConfig = {
        startTime: bars[0].time,
        endTime: bars[bars.length - 1].time,
        tradeConfig: null,
        startBalance: 10000,
        //defaultSymbol : null,
        //defaultTF : tf
    };
    let result = RunSignallerTest(signaller, tf, symbol, testerConfig);
}
await Check();
