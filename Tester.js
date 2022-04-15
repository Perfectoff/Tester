//any.[0]= "gg";
import { CAccount, CBar, CBarBase, CQuotesHistoryMutable2, CSymbol, CSymbols, CTimeSeries, CTimeSeriesBase, OHLC, Period, TF, sleepAsync } from "./Trader.js";
import { getSignaller, createStrategyObject } from "./Strategy.js";
// import {Strategy_MA} from "./Strategy_MA.js";
// import {Strategy_Pan} from "./Strategy_Pan.js"
// import {Strategy_Lana} from "./Strategy_Lana.js";
import { AllStrategies } from "./Strategies.js";
import { ByteStreamW } from "./ByteStream.js";
import { CMyWorker2, JSON_clone } from "./MyWorker.js";
export * from "./Trader.js";
//import {length} from "@amcharts/amcharts4/.internal/core/utils/Iterator";
// export {Strategy_Lana} from "./Strategy_Lana";
// export {CStrategy_Lana} from "./Strategy_Lana";
// export {CStrategySignaller_Lana} from "./Strategy_Lana";
// export {Strategy_MA} from "./Strategy_MA";
// export {CStrategy_MA} from "./Strategy_MA";
// export {CStrategySignaller_MA} from "./Strategy_MA";
export * from "./Strategy.js";
//import {read} from "fs";
function CBar_read(stream) { return new CBar(new Date(stream.readUint64()), stream.readDouble(), stream.readDouble(), stream.readDouble(), stream.readDouble(), stream.readDouble()); }
function CBar_write(stream, bar) { var _a, _b; return ((_b = (_a = stream.pushInt64(bar.time.valueOf())) === null || _a === void 0 ? void 0 : _a.pushNumbers([bar.open, bar.high, bar.low, bar.close], "double")) === null || _b === void 0 ? void 0 : _b.pushDouble(bar.volume)) != null; }
export class CTradeBar extends CBarBase {
    constructor(time, ohlc, volume, comission) { if (ohlc instanceof OHLC)
        super(time, ohlc.open, ohlc.high, ohlc.low, ohlc.close);
    else
        super(time, ohlc[0], ohlc[1], ohlc[2], ohlc[3], volume); this.comission = comission; }
    static fromParsedJSON(data) { let bar = CBar.fromParsedJSON(data); return bar ? new CTradeBar(bar.time, [bar.open, bar.high, bar.low, bar.close], bar.volume, data.comission) : null; }
    static read(stream) { let bar = CBar_read(stream); return new CTradeBar(bar.time, [bar.open, bar.high, bar.low, bar.close], bar.volume, stream.readDouble()); }
    write(stream) { return CBar_write(stream, this) && stream.pushDouble(this.comission) != null; }
}
export class CTradeHistory extends CTimeSeriesBase {
    constructor() {
        super(...arguments);
        this.data = new CTimeSeries();
        this.EquityBars = [];
        this.tradesCount = 0;
    }
    get points() { return this.data.points; }
    ;
    set points(points) { this.data.points = points; }
    ;
    get name() { return this.data.name; }
    set name(name) { this.data.name = name; }
    //toString() { return this.points.reduce((prevStr, point)=>point.time.toString()+", ")}
    get pointsExt() {
        return this.points.map((point) => ({
            time: point.time,
            equity: point.value.equity,
            volume: point.value.volume
        }));
    }
    toStrings() {
        return this.points.map((pnt) => "time: " + pnt.time.toISOString() + ", equity: " + pnt.value.equity + ", volume: " + pnt.value.volume);
    } //JSON.stringify(tradeEquity.points,undefined).replace(/"([^"]+)":/g, '$1:'));
    toString() { return this.toStrings().join(",\n"); }
    //JSON.stringify(tradeEquity.points,undefined).replace(/"([^"]+)":/g, '$1:'));
    pushPoint(time, value, volume) {
        return this.points.push({ time, value: { equity: value, volume } });
    }
    pushBar1(time, ohlc, deltaVolume, comission, totalVolume) {
        this.pushBar2(new CTradeBar(time, ohlc, deltaVolume, comission), totalVolume);
    }
    pushBar2(bar, totalVolume) {
        this.pushPoint(bar.time, bar.close, totalVolume);
        if (!this.EquityBars)
            this.EquityBars = [];
        this.EquityBars.push(bar); //return this.pushBar(bar.time, new OHLC(bar.open, bar.high, bar.low, bar.close), bar.volume, totalVolume);
    }
    static fromParsedJSON(parsedHistory) {
        var _a, _b;
        let data = parsedHistory.data;
        let parsedData = data;
        //let aaa : ParsedUrlQueryInputMy<CTimeSeries<number>> = { };
        let obj = Object.assign(new CTradeHistory(), Object.assign(Object.assign({}, parsedHistory), { data: CTimeSeries.fromParsedJSON(parsedData) }));
        obj.EquityHistory = CTimeSeries.fromParsedJSON(parsedHistory.EquityHistory);
        obj.VolumeHistory = CTimeSeries.fromParsedJSON(parsedHistory.VolumeHistory);
        obj.EquityBars = (_b = (_a = parsedHistory.EquityBars) === null || _a === void 0 ? void 0 : _a.map((barData) => { var _a; return (_a = CTradeBar.fromParsedJSON(barData)) !== null && _a !== void 0 ? _a : (() => { throw "null bar!"; })(); })) !== null && _b !== void 0 ? _b : [];
        return obj;
    }
    write(stream) {
        var _a, _b;
        let ok = this.data.write(stream, (stream, dataPoint) => stream.pushDouble(dataPoint.equity).pushDouble(dataPoint.volume) != null);
        //print("w:  (ok="+ok+"\n",stream);
        ok = ok && stream.pushBool(this.EquityHistory != null) && ((_a = this.EquityHistory) === null || _a === void 0 ? void 0 : _a.write(stream, "double")) != false;
        ok = ok && stream.pushBool(this.VolumeHistory != null) && ((_b = this.VolumeHistory) === null || _b === void 0 ? void 0 : _b.write(stream, "double")) != false;
        return ok && stream.pushArray(this.EquityBars) != null;
    }
    static read(stream) {
        let timeseries = CTimeSeries.read(stream, (stream) => ({ equity: stream.readDouble(), volume: stream.readDouble() }));
        let obj = new CTradeHistory();
        Object.assign(obj, timeseries);
        //print("r:\n",stream);
        if (stream.readBool())
            obj.EquityHistory = CTimeSeries.read(stream, "double");
        if (stream.readBool())
            obj.VolumeHistory = CTimeSeries.read(stream, "double");
        obj.EquityBars = stream.readArray(CTradeBar);
        return obj;
    }
}
//static seriesToBinary(series : CTimeSeries) { }
/*
static toBinary<T extends {[key in keyof T]: number} | { toBinary();}> (obj : CTimeSeries<T>) {
    //if (obj.points[0]. );
    const buffer = new ArrayBuffer(obj.points.length);  const view = new DataView(buffer);
    DataView.
}
*/
export class CTestResult extends CAccount {
    constructor() {
        super(...arguments);
        this.EquityHistory = new CTimeSeries();
    }
}
// Конфигурация торговли
class CTradeConfig {
}
// Конфигурация тестирования
export class CTesterConfig {
    //defaultSymbol? : string;  // Символ по умолчанию
    //defaultTf? : TF;          // Таймфрейм по умолчанию
    constructor(startTime, endTime, startBalance = 0) {
        this.startBalance = 0; // Начальный баланс
        this.startTime = startTime;
        this.endTime = endTime;
        this.startBalance = startBalance;
    }
    static fromParsedJSON(data) {
        //let tf = data.defaultTf ? TF.fromSec(data.defaultTf.sec) : undefined;
        return {
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            tradeConfig: data.tradeConfig ? Object.assign(new CTradeConfig(), data.tradeConfig) : undefined,
            startBalance: data.startBalance,
            tf: data.tf ? TF.all[data.tf.index] : undefined
        }; //,  defaultSymbol: data.defaultSymbol,  defaultTf: tf };
    }
}
//export type CTesterConfig = Readonly<CTesterConfig_mut>;
export class CLogger {
    print(...args) { console.log(...args); }
    alert(...args) { console.log(...args); } //prompt(...args); }
}
//-------------------
//function RunTest(symbol : CSymbol,  strategy : IStrategy,  startTime : Date,  endTime : Date, config : CTradeConfig) : CTestResult
export function RunTest(trader, testerConfig, marketData) {
    var _a;
    let newsymbols = [];
    let minTf = null;
    for (let symbol of marketData.symbols) {
        let quotes = new CQuotesHistoryMutable2(symbol.name);
        newsymbols.push(new CSymbol(symbol.info, quotes));
        if (!minTf || minTf < ((_a = symbol.quotesHistory.minTf) !== null && _a !== void 0 ? _a : minTf))
            minTf = symbol.quotesHistory.minTf;
    }
    let tf = minTf;
    if (!tf)
        return null;
    let startTime = Period.EndTime(tf, testerConfig.startTime);
    let traderMarket = { symbols: new CSymbols(newsymbols), time: startTime };
    let env = { market: traderMarket, account: new CAccount(), logger: new CLogger() };
    env.account.balance = testerConfig.startBalance;
    env.account.equity = env.account.balance;
    trader.OnInit(env);
    let equity = new CTimeSeries();
    for (let time = startTime; time <= testerConfig.endTime; time = new Date(time.valueOf() + tf.msec)) {
        env.market.time = time;
        env.market.symbols.map((symbol, i) => symbol.quotesHistory.Update(marketData.symbols[i].quotesHistory, time));
        env.account.UpdateFromMarket(env.market);
        let orders = trader.OnTick(env);
        env.account.UpdateFromOrders(orders, env.market);
        equity.points.push({ time, value: env.account.equity });
    }
    trader.OnDeinit(env);
    let result = new CTestResult();
    result.EquityHistory = equity;
    return result;
}
function _Calculate(cyclesCount = 1) {
    let start = Date.now();
    let stop = start + 200000 * cyclesCount;
    let sum = 0;
    for (let i = start; i < stop; i++)
        sum += Math.sqrt(i);
    //console.log("result: ",sum," Elapsed:",Date.now()-start,"ms");
    return sum;
}
export async function RunSignallerTest(strategy, strategyTF, symbol, testerConfig, onbarOrCancelToken) {
    var _a, _b, _c, _d, _e;
    if (0) {
        let res = new CTradeHistory();
        let d = Date.now();
        let val = _Calculate(5);
        //print("Pass elapsed:",Date.now()-d,"ms")
        res.points.push({ time: new Date(), value: { equity: val, volume: val } });
        //print("!!!");
        return res; //new CTradeHistory;
    }
    //if(counter<=2) return RunSignallerTest(strategy, symbol, testerConfig, onbar, counter+1);
    //if (!onbar) return Calculate();
    //if (!onbar) { let tradeEquity= new CTradeHistory;  tradeEquity.pushBar2(new CBar(null, 0, 0, 0, Calculate(), 0), 0);  return tradeEquity; }
    let [onbar, isCancelled] = typeof onbarOrCancelToken == "object"
        ? [undefined, () => { var _a; return (_a = onbarOrCancelToken.isCancelled) === null || _a === void 0 ? void 0 : _a.call(onbarOrCancelToken); }]
        : [onbarOrCancelToken, () => false];
    // //let onbar : ((tick :TesterTick, percent :number)=>boolean|void) | undefined;
    // //let isCancelled = ()=>false; // { return false; }
    // const isCancelToken = typeof onbarOrCancelToken=="object";
    // if (isCancelToken) { //instanceof CancelToken) {
    //     let cancelToken= <ICancelToken>onbarOrCancelToken;
    //     isCancelled = ()=>cancelToken.isCancelled?.();
    //     //onbar= ()=>Promise.resolve(! cancelToken.isCancelled());
    // }
    // //else onbar= onbarOrCancelToken; // as typeof onbar;
    // //const onbar= isCancelToken ? undefined : onbar;
    let tf = (_a = testerConfig.tf) !== null && _a !== void 0 ? _a : symbol.quotesHistory.minTf;
    if (!tf) {
        console.log("tf is not defined");
        return null;
    }
    if (!strategyTF)
        strategyTF = tf;
    if (tf > strategyTF)
        throw "Tester timeframe " + tf.name + " > strategy timeframe " + (strategyTF === null || strategyTF === void 0 ? void 0 : strategyTF.name) + " !!!";
    let startTime = Period.StartTime(tf, testerConfig.startTime);
    let startCloseTime = Period.EndTime(tf, testerConfig.startTime);
    //let quotes = new CQuotesHistoryMutable2(symbol.name);
    let equity = new CTimeSeries();
    let tradeEquity = new CTradeHistory();
    //tradeEquity.EquityBars.length= 10000;  tradeEquity.EquityBars.length= 0;
    //tradeEquity.pointsExt.length= 10000;   tradeEquity.pointsExt.length=0;
    let volume = 0;
    let value = testerConfig.startBalance;
    let bars = symbol.quotesHistory.Bars(tf);
    let iPrev = -1; //bars.IndexOf(startTime, E_MATCH.GREAT_OR_EQUAL);
    //startTime = new Date(startTime.valueOf() + Math.random()*5 * tf.msec);
    console.log("Start testing " + symbol.name + " ", testerConfig.startTime, "-", testerConfig.endTime, " ", tf.name);
    let localTime = Date.now();
    let pastBars = [];
    let ibar = bars.indexOfLessOrEqual(startTime) - 1;
    let nextBarTime = new Date(0); //ibar>=0 ?
    let strategyBars = symbol.quotesHistory.Bars(strategyTF);
    let strategyBarIndex = strategyBars.indexOf(startTime, "greatOrEqual");
    if (strategyBarIndex == -1)
        return tradeEquity;
    let strategyBarEndTime = strategyBars.closeTime(strategyBarIndex); //strategyBars[istrategyBar].time.valueOf() + strategyTF.msec-1);
    strategy.onNewBars(strategyBars.data.slice(0, strategyBarIndex));
    let s = 0;
    //print("old:",startTime);
    //startTime = new Date(startTime.valueOf() + (Date.now() - Date.parse("2020-10-26")) / (1440*60*1000));
    //print("new:",startTime);
    let isPercentFee = ((_b = symbol.info.comissionPerSide) === null || _b === void 0 ? void 0 : _b.unit) == "%";
    const MAX_TIME = new Date(8640000000000000);
    let _signal;
    //let stopLoss :number|undefined, takeProfit :number|undefined;
    let timeStamp = Date.now();
    for (let time = startTime; time <= testerConfig.endTime; time = new Date(time.valueOf() + tf.msec)) {
        let closeTime = new Date(time.valueOf() + tf.msec - 1);
        if (time >= nextBarTime) {
            ibar++;
            nextBarTime = ibar < bars.count - 1 ? bars.time(ibar + 1) : MAX_TIME;
            if (time >= nextBarTime)
                throw "wrong bar time: " + nextBarTime;
        }
        let i = ibar; //bars.IndexOfLessOrEqual(time);
        s += i;
        if (i == -1)
            break;
        let valueHigh = value, valueLow = value, valueOpen = value;
        let oldVolume = volume;
        let comission = 0;
        //continue;
        if (i > iPrev) {
            let bar = bars.data[i];
            if (volume) {
                let prevPrice = bars.close(iPrev); //.close;
                let fullVolume = volume * symbol.info.lotSize;
                valueOpen = value + fullVolume * (bar.open - prevPrice);
                valueHigh = value + fullVolume * (bar.high - prevPrice);
                valueLow = value + fullVolume * (bar.low - prevPrice);
                value += fullVolume * (bar.close - prevPrice);
                // if (_signal) {
                //     if (_signal.takeprofit!=null)
                //         if (volume>0 ? bar.high>=_signal.takeprofit : bar.low<=_signal.takeprofit)
                // }
            }
            if (onbar != undefined) {
                let newBars = bars.data.slice(iPrev + 1, i + 1);
                pastBars.push(...newBars);
            }
            iPrev = i;
            if (closeTime >= strategyBarEndTime) {
                //console.log(closeTime);
                let strategyBar = strategyBars.data[strategyBarIndex];
                strategy.onNewBars([strategyBar]);
                strategyBarIndex++;
                strategyBarEndTime = strategyBarIndex < strategyBars.length ? strategyBars.closeTime(strategyBarIndex) : MAX_TIME;
                console.assert(strategyBarEndTime > closeTime);
                let signal = strategy.getSignal();
                //console.log(signal);
                let signalLots = typeof signal == "number" ? signal : signal === null || signal === void 0 ? void 0 : signal.volume;
                //console.log(time, signal);
                if (signalLots == null)
                    continue;
                if (signalLots != volume) {
                    comission = ((_e = (_d = (_c = symbol.info) === null || _c === void 0 ? void 0 : _c.comissionPerSide) === null || _d === void 0 ? void 0 : _d.value) !== null && _e !== void 0 ? _e : 0) * Math.abs(signalLots - volume) * (isPercentFee ? bar.close / 100 : 1);
                    value -= comission;
                    if (value < valueLow)
                        valueLow = value;
                    volume = signalLots;
                    tradeEquity.tradesCount++;
                }
            }
        }
        //if (comission) console.log(valueHigh,"  ",comission);
        //continue;
        //equity.points.push({time: time, value: value});
        //tradeEquity.pushPoint(time, value, volume);
        //let equityOHLC= new OHLC( valueOpen, valueHigh, valueLow, value);
        let equityBar = new CTradeBar(time, [valueOpen, valueHigh, valueLow, value], volume - oldVolume, comission);
        //tradeEquity.pushBar(time, equityOHLC, volume-oldVolume, volume);
        tradeEquity.pushBar2(equityBar, volume);
        if (1)
            if (onbar) {
                let percentOfComplete = (time.valueOf() - startTime.valueOf()) * 100 / (testerConfig.endTime.valueOf() - startTime.valueOf());
                let res = onbar({ time: closeTime, price: bars[i].close, bars: pastBars, equity: value, volume, equityBar }, strategy.indicators, percentOfComplete);
                let boolRes = res instanceof Promise ? await res : res;
                if (!boolRes) {
                    console.log("Stopped!");
                    break;
                }
            }
        if (Date.now() - timeStamp >= 50) {
            await sleepAsync(0);
            timeStamp = Date.now();
        }
        if (isCancelled()) {
            console.log("Stopped!");
            break;
        }
    }
    //print("Finish testing "+symbol.name+". Elapsed:", Date.now()-localTime, "ms");
    //console.log("!!!  Возвращаем пустой результат");
    //return new CTradeHistory;
    return tradeEquity;
}
export async function RunStrategySignallerTest(strategyObject, symbol, testerConfig, onbarOrCancelToken) {
    let signaller = getSignaller(strategyObject);
    if (!signaller)
        return null;
    return RunSignallerTest(signaller, strategyObject.paramsData.tf, symbol, testerConfig, onbarOrCancelToken);
}
//---------------------------------
export class TesterTaskInfo {
    constructor(info) {
        this.symbol = info.symbol;
        this.strategyName = info.strategyName;
        this.strategyParams = info.strategyParams;
        this.tfName = info.tfName;
        this.testerConfig = info.testerConfig;
    }
    static fromParsedJSON(data) {
        return {
            symbol: data.symbol ? CSymbol.fromParsedJSON(data.symbol) : null,
            strategyName: data.strategyName,
            strategyParams: data.strategyParams,
            tfName: data.tfName,
            testerConfig: data.testerConfig ? CTesterConfig.fromParsedJSON(data.testerConfig) : null
        };
    }
}
//let [s,i] = await PromiseAny2([Promise.resolve(2), Promise.resolve(3)]);
//Promise.prototype['any'] = promiseAny;
//Promise.all();
//interface PromiseConstructor { any(iterable : Iterable<Promise<any>>) : Promise<any>; }
//Promise['any']= promiseAny;
//Promise.any([]);
let __StrategyName;
let __Symbol;
let __testerConfig;
// Передача результата теста в бинарном виде, иначе в текстовом
const TRANSFER_BINARY_TRADE_HISTORY = true;
//let threadMutex= new lib.Mutex;
async function OnMessage(ev) {
    var _a, _b;
    //let res = Calculate(1);
    //postMessage(JSON_clone(new CTradeHistory));  return;
    //let unlock= await threadMutex.lock();
    console.log = () => { };
    //return;
    /*
    console.log("==== In worker #"+ev.data?.strategyName+".  Time=",Date.now());
    console.log("!!!  Возвращаем пустой результат");
    postMessage(null);  return;
    postMessage(JSON_clone(new CTradeHistory), undefined);  return;
    */
    //let data= ev.data;
    let datas = ev.data instanceof Array ? ev.data : [ev.data];
    //print("tasks:",datas.length);
    let results = [];
    let localTime0 = Date.now();
    for (let data of datas) {
        let strategyName = (_a = data.strategyName) !== null && _a !== void 0 ? _a : __StrategyName;
        let symbol = data.symbol ? CSymbol.fromParsedJSON(data.symbol) : __Symbol;
        let testerConfig = data.testerConfig ? CTesterConfig.fromParsedJSON(data.testerConfig) : __testerConfig;
        //print(strategyName, symbol.name, testerConfig);
        //if (__Symbol && data.symbol)
        //console.assert(! (__Symbol && (data.symbol || data.testerConfig)),  data);
        __StrategyName = strategyName;
        __Symbol = symbol;
        __testerConfig = testerConfig;
        //console.log("Отключаем проверку стратегии");
        let strategy = AllStrategies[strategyName]; // strategies.find((item)=>item.name==strategyName);
        if (!strategy) {
            throw ("Wrong strategy: " + strategyName);
        }
        let localTime = Date.now();
        let tf = (_b = TF.fromName(data.tfName)) !== null && _b !== void 0 ? _b : (() => { throw "Wrong tf: " + data.tfName; })();
        let trader = getSignaller(createStrategyObject(strategy, data.strategyParams, tf));
        if (!trader)
            throw ("Failed to get signaller for params: " + data.strategyParams.join());
        let result = await RunSignallerTest(trader, tf, symbol, testerConfig);
        //let result = RunSignallerTest2(trader, symbol, testerConfig);
        console.log("Elapsed for RunSignallerTest:", Date.now() - localTime);
        results.push(result);
        //print("tested combo Ok");
        //postMessage(Date.now()-localTime); return;
        //CSymbol.fromParsedJSON(data.symbol);
        //let z= CTradeHistory.fromParsedJSON(JSON_clone(new CTradeHistory));
    }
    //let stream= new ByteStreamW;
    //for(let result of results) stream.pushNullable(result);
    //print("tested group Ok");
    let result = ev.data instanceof Array ? results : results[0];
    //print("Agent result:",result);
    if (0) {
        console.log("!!!  Возвращаем пустой результат");
        result = new CTradeHistory();
    }
    //print(JSON_stringify_DateAsNumber(result));
    //postMessage(JSON_clone(result));
    let elapsed_ms = Date.now() - localTime0;
    if (TRANSFER_BINARY_TRADE_HISTORY) {
        let stream = new ByteStreamW();
        if (result instanceof Array)
            stream.pushArrayOfNullable(result);
        else
            stream.pushNullable(result);
        let buffer = stream.data.buffer;
        //postMessage({ jsonData : JSON_clone(new CTradeHistory), binaryData: buffer }, [buffer]);
        return { data: buffer, duration: elapsed_ms };
    }
    return { data: JSON_clone(result), duration: elapsed_ms };
    //unlock();
    //let d= new Date();
}
let __lastMessageTask;
onmessage = async function (ev) {
    await __lastMessageTask;
    let answer;
    answer = await (__lastMessageTask = OnMessage(ev));
    function postMyMessage(message, transfer) { return transfer ? postMessage(message, transfer) : postMessage(message); }
    let isBinary = answer.data instanceof ArrayBuffer; // ? true : typeof answer.data=="string" ? false : (()=>{throw("Wrong data type")})();
    //console.warn("result: ",answer);
    postMyMessage(Object.assign(Object.assign({}, answer), { isBinary }), answer.data instanceof ArrayBuffer ? [answer.data] : undefined);
};
export class CTesterWorker extends CMyWorker2 {
    constructor() {
        super(import.meta.url);
        console.assert(onmessage != undefined);
        //super("./Tester.js");
    }
}
//function JSON_stringify_DateAsNumber(obj) : string { return JSON.stringify(obj, (key,value)=> key=="time" || value instanceof Date ? value.valueOf() : value); }
//function JSON_clone_DateAsNumber(obj) : ParsedUrlQueryInputMy { return JSON.parse(JSON_stringify_DateAsNumber(obj)); }
//declare const jQuery;
//function cloneFull<T>(obj :T) : T {  let newobj = {};  Object.setPrototypeOf(newobj, Object.getPrototypeOf(obj));   newobj= jQuery.extend(true, newobj, obj);  return newobj as T; }//newobj.prototype= obj.prototype;  return newobj; } // let newobj= JSON.parse(JSON.stringify(obj));  return newobj; }
//async function RunSignallerTestAsync(strategy :IStrategySignaller, symbol :CSymbol, testerConfig :Readonly<CTesterConfig>) : Promise<CTradeHistory|null>
//async function RunSignallerTestAsync(strategy :IStrategy, params :readonly number[], symbol :CSymbol, testerConfig :CTesterConfig) : Promise<CTradeHistory|null>
export function GetSumEquity(barsArrays) {
    var _a, _b;
    //let sumEquity : CBar[] = [];
    let myBars = []; //{time: const_Date, delta: number, volume: number}[] = []
    for (let bars of barsArrays)
        for (let [i, bar] of bars.entries())
            myBars.push(Object.assign(Object.assign({}, bar), { delta: bar.close - ((_b = (_a = bars[i - 1]) === null || _a === void 0 ? void 0 : _a.close) !== null && _b !== void 0 ? _b : 0) }));
    myBars.sort((a, b) => a.time.valueOf() - b.time.valueOf());
    let myBar = new CTradeBar(new Date(0), [0, 0, 0, 0], 0, 0);
    let resultEquity = [];
    for (let i = 0; i < myBars.length; i++) {
        let bar = myBars[i];
        if (i > 0 && bar.time > myBar.time) {
            resultEquity.push(Object.assign({}, myBar));
            myBar.volume = 0;
            myBar.comission = 0;
        }
        let price = myBar.close + bar.delta;
        myBar = new CTradeBar(bar.time, [price, price, price, price], myBar.volume + bar.volume, myBar.comission + bar.comission);
    }
    if (myBars.length)
        resultEquity.push(myBar);
    return resultEquity;
}
// let myBar = new CBar(new Date(0), 0, 0, 0, 0) as Mutable<CBar>;
// let resultEquity = [];
// for(let i=0; i<sumEquity.length; i++) {
// 	let bar= sumEquity[i];
// 	if (bar.time>myBar.time) {
// 		resultEquity.push({...myBar});
// 		myBar= {...bar};
// 		continue;
// 	}
// 	myBar.high= Math.max(myBar.high, bar.high);
// 	myBar.low= Math.min(myBar.low, bar.low);
// 	myBar.close= Math.min(myBar.low, bar.low);
// }
