import { CBars, CTimeSeries, RunOptimization, RunTest, } from "./TesterAPI.js";
import { CDelayer } from "./Time.js";
import { CreateMyChartArea, DefaultChartColor, DrawCandleChart, scrollChartToTime } from "./Chart/Chart.js";
import * as lib from "./Common.js";
import { TradeStatistics } from "./TradeStatistics.js";
export { CParamStepper } from "./Strategy.js";
export function SymbolQuotesGetter(name, tickSize, quoteCurrency, source) {
    async function GetBars(tf, start, end) { return source.getBars(name, tf, start, end); }
    async function GetBars2(tf, end, barsCount) { return source.getBars2(name, tf, end, barsCount); }
    return { name, tickSize, quoteCurrency, GetBars, GetBars2 };
}
export class CTesterSpeed {
    constructor() {
        this.value = Number.MAX_VALUE;
    }
}
function TimeFloor(time, tf) { return new Date(Math.floor(time.valueOf() / tf.msec) * tf.msec); }
export async function Test0(testerInfo, // Инфа о тестировании
onTick, // обработчик сделок
speedRef, // ссылка на значение скорости тестирования
onProgress // обработчик прогресса выполнения
) {
}
export function SetChartAutoResize(chart, htmlElement) {
    let lastParentSize = [undefined, undefined];
    let $htmlElement = $(htmlElement);
    $htmlElement.on('mousemove', (() => {
        let parentSize = [$htmlElement.width(), $htmlElement.height()];
        if (parentSize[0]) {
            if (lastParentSize[0] && parentSize[0] != lastParentSize[0]) {
                //console.log("resize:",parentSize[0]);
                //priceChart?.resize(parentSize[0], quotesChartDiv.height, true);
                //equityChart?.resize(parentSize[0], equityChartDiv.height, true);
                chart === null || chart === void 0 ? void 0 : chart.applyOptions({ width: parentSize[0] }); //.priceScale().applyOptions()
                //equityChart?.timeScale()..applyOptions()
                //priceChart?.timeScale().fitContent();
                //console.log([parentSize[0], priceChart?.options().height], [parentSize[0], equityChart?.options().height]);
            }
            lastParentSize = [$htmlElement.width(), $htmlElement.height()];
        }
    }));
}
export async function Test(testerInfo, // Инфа о тестировании
quotesChartDiv, // элемент графика котировок
equityChartDiv, // элемент графика эквити
onTrades, // обработчик сделок
//speedRef? : Readonly<CTesterSpeed>,  // ссылка на значение скорости тестирования
getSpeed, // // получение значения скорости тестирования
onProgress // обработчик прогресса выполнения
) {
    let priceChart = CreateMyChartArea(quotesChartDiv);
    let equityChart = CreateMyChartArea(equityChartDiv);
    let $chartsParent = $(equityChartDiv).parent();
    SetChartAutoResize(priceChart, $chartsParent[0]);
    SetChartAutoResize(equityChart, $chartsParent[0]);
    // Скроллинг графиков
    function scrollCharts(timeStr) {
        let time = new Date(timeStr + " GMT"); //.valueOf();
        let timeRange = priceChart.timeScale().getVisibleRange();
        if (timeRange)
            equityChart.timeScale().setVisibleRange(timeRange);
        scrollChartToTime(priceChart, time);
        //equityChart.timeScale().options().
        //equityChart.timeScale().setVisibleRange(priceChart.timeScale().getVisibleRange());
        scrollChartToTime(equityChart, time);
    }
    let onTrades_simple = onTrades ? (trades) => onTrades(trades, scrollCharts) : undefined;
    return Test2(testerInfo, priceChart, equityChart, onTrades_simple, getSpeed, onProgress);
}
export const PriceChartColor = "#00FF00";
export const EquityChartColor = DefaultChartColor;
export async function Test2(testerInfo, // Инфа о тестировании
priceChart, // элемент графика котировок
equityChart, // элемент графика эквити
onTrades, // обработчик сделок
getSpeed, // получение значения скорости тестирования
onProgress // обработчик прогресса выполнения
) {
    var _a, _b, _c;
    //alert(testerInfo);
    //return;
    //let result= await RunTest (testerInfo,  undefined /*(tick, indicators)=>console.log("tick: ",tick)*/);//,  "chartDiv");
    let allbars = [];
    let trades = [];
    let markers = [];
    let equityBars = [];
    //let [priceChart, equityChart] : IChartApi[] = [];
    let [priceSeries, equitySeries] = [];
    let balanceSeries;
    function MyEquityChart(api) {
        let _equitySeries;
        let _balanceSeries;
        return {
            addEquityBars(bars) {
                if (!_equitySeries) {
                    [api, _equitySeries] = DrawCandleChart(bars, api, undefined, null, timeShift_s);
                }
                else
                    for (let bar of bars)
                        _equitySeries.update(bar);
            },
            addBalancePoints(points) {
                if (!_balanceSeries) {
                    _balanceSeries = api.addLineSeries({ color: "#3030FF", lineWidth: 1 });
                    _balanceSeries.setData(points);
                }
                else
                    for (let bar of points)
                        _balanceSeries.update(bar);
            }
            //equityChart.timeScale().setVisibleLogicalRange({ from: -3,  to: 2 });
            //priceChart.timeScale().subscribeVisibleTimeRangeChange((range)=>equityChart.timeScale().setVisibleRange(range));
            //equityChart.timeScale().subscribeVisibleTimeRangeChange((range)=>priceChart.timeScale().setVisibleRange(range));
        };
    }
    let myEquityChart = MyEquityChart(equityChart);
    //equityChartDiv.onwheel = (e)=> console.log("!!!",equityChart); //e.deltaY);
    let indDatas = []; //let indName : string[] = [];
    //let indChartSeries : ISeriesApi<"Line">[] = [];
    //let indChartSeriesWrappers : ReturnType<typeof createNewSeriesWrapper>[] = [];
    let indChartSeriesWrappers = []; //ReturnType<typeof createNewSeriesWrapper>[] = [];
    let indColors = ['#FFFF00', '#FF06FF']; // yellow,  green
    function createNewSeriesWrapper(newSeries) {
        let _empty = true;
        return {
            addData(data) {
                if (!(data instanceof Array))
                    data = [data];
                if (_empty) {
                    newSeries.setData(data);
                    _empty = false;
                }
                else
                    for (let item of data)
                        newSeries.update(item);
            }
        };
    }
    //const createNewLineSeriesWrapper = createNewSeriesWrapper<"Line">;
    function indicatorSeries(i) {
        var _a;
        return (_a = indChartSeriesWrappers[i]) !== null && _a !== void 0 ? _a : (indChartSeriesWrappers[i] = createNewSeriesWrapper(priceChart.addLineSeries({
            color: indColors[i] != undefined ? indColors[i] : '#FFFFFF',
            lineWidth: 1,
        })));
    }
    const timeShift_s = 0; //3600*6;
    let delayer = new CDelayer;
    const getSpeed_ = () => { var _a; return ((_a = getSpeed === null || getSpeed === void 0 ? void 0 : getSpeed()) !== null && _a !== void 0 ? _a : undefined); }; // { return speedRef?.value; }
    let useVisual = ((_a = getSpeed_()) !== null && _a !== void 0 ? _a : 0) < Number.MAX_VALUE;
    let balancePoints = []; // точки баланса
    let showProgressTime = 0;
    let priceChartColor = PriceChartColor; //'rgb(0,255,0)'
    //alert("use visual="+useVisual+"  "+speedRef.value);
    //let printTimer=0;
    let n = 0;
    let _percent = 0;
    if (!onProgress)
        onProgress = () => { };
    // Запускаем таймер для обновления прогресса тестирования
    let progressTimer = new lib.MyTimerInterval(50, () => (onProgress(_percent)), () => onProgress(_percent));
    let tf = (_b = testerInfo.config.tf) !== null && _b !== void 0 ? _b : testerInfo.strategyInfo.paramsData.tf;
    if (!tf)
        throw "tf is not defined";
    let result = await RunTest(testerInfo, async (tick, indicators, percent) => {
        var _a, _b, _c;
        var _d;
        let newbars = tick.bars.slice(n);
        n = allbars.push(...newbars); // Возвращает итоговое число элементов
        _percent = percent !== null && percent !== void 0 ? percent : 0;
        //if (tick.volume!=0)
        //console.log(tick);
        let tickPeriodTime = TimeFloor(tick.time, tf);
        if (indicators && indicators.length > indDatas.length)
            indDatas.length = indicators.length;
        let indValues = [];
        if (indicators)
            for (let i = 0; (_a = i < (indicators === null || indicators === void 0 ? void 0 : indicators.length)) !== null && _a !== void 0 ? _a : 0; i++) {
                (_b = indDatas[i]) !== null && _b !== void 0 ? _b : (indDatas[i] = new CTimeSeries);
                let val = indicators[i].value();
                // Отбрасываем значение времени к началу бара, т.к. иначе будут проблемы с пропуском баров на графике
                if (val != null)
                    indDatas[i].points.push({ time: tickPeriodTime, value: val });
                indValues[i] = val;
                (_c = (_d = indDatas[i]).name) !== null && _c !== void 0 ? _c : (_d.name = indicators[i].name);
            }
        let lastPrice = newbars.length > 0 ? newbars[newbars.length - 1].close : 0;
        let equityBar = tick.equityBar;
        let isNewTrade = AddTradeToArrays(tick.time, equityBar.volume, lastPrice, tick.volume, markers, trades);
        //console.log(tick);
        equityBars.push(equityBar);
        let balance = isNewTrade ? equityBar.close : (balancePoints.length > 0 ? balancePoints[balancePoints.length - 1].value : 0);
        balancePoints.push({ time: equityBar.time, value: balance });
        //console.log("tickTime ",tick.time,"  newbars: ",newbars.length);
        if (useVisual) {
            OnNewTick(tick.time, newbars, equityBar, tick.volume, indValues, tickPeriodTime, isNewTrade, balance);
            // Преобразовать скорость в задержку
            function speedToDelay_ms(speed) { return speed && speed > 0 ? 5000 / Math.pow(1.08, Math.max(speed - 1, 0)) : speed == 0 ? 9999999999 : null; }
            // Выжидаем паузу:
            await delayer.sleepAsync(() => speedToDelay_ms(getSpeed_()));
        }
        if (getSpeed_() == -1) {
            console.log("Stopped");
            return false;
        }
        return true;
    } // : { i = allbars.push(...tick.bars.slice(i));
    );
    console.log("Result bars: ", allbars.length);
    progressTimer.stop();
    /*
    function ScrollChartToTime(chart : IChartApi,  barsSeries : readonly CBar[], time :Time) { //position : number) {
        let range= chart.timeScale()?.getVisibleLogicalRange();
        let rangeSize= range ? range.to.valueOf() - range.from.valueOf() : 0; //if (range)alert(range.from+"  "+range.to);
        chart.timeScale().scrollToPosition(-(allbars.length-1-i - rangeSize/2), true);
    }
    */
    // Событие нового тика
    function OnNewTick(time, bars, equityBar, tradeVolumeTotal, indValues, periodTime, isNewTrade, balance) {
        //let lastPrice= bars.length>0 ? bars[bars.length-1].close : 0;
        //let isNewTrade = AddTrade(time, equityBar.volume, lastPrice, tradeVolumeTotal, markers, trades)
        if (!priceSeries) {
            [priceChart, priceSeries] = DrawCandleChart(bars, priceChart, priceChartColor, null, timeShift_s);
        } // console.log("Group: ",bars); }
        else {
            //for (let bar of bars) { console.log("Updating ",bar);  series.update(bar);  console.log("Updated"); }
            for (let bar of bars)
                priceSeries.update(bar);
        }
        if (isNewTrade) {
            priceSeries.setMarkers(markers);
            //chart.options().rightPriceScale.autoScale= false;
            //options.rightPriceScale.scaleMargins= { bottom: 0.05, top: 0.1 };
            if (onTrades)
                onTrades([trades[trades.length - 1]]);
        }
        // Отрисовываем значения индикаторов
        for (let ind = 0; ind < indValues.length; ind++) {
            if (indValues[ind] != null)
                // Берём время на начало бара, а не конца, иначе будут пропускаться бары на графике
                indicatorSeries(ind).addData({ time: periodTime, value: indValues[ind] });
        }
        if (!equityBar)
            return;
        myEquityChart.addEquityBars([equityBar]);
        myEquityChart.addBalancePoints([{ time: equityBar.time, value: balance }]);
        //return 0;
    }
    // Добавить сделку
    function AddTradeToArrays(time, volume, tradePrice, volumeTotal, markers, trades) {
        if (!volume)
            return false;
        let volumeStr = lib.DblToStrAuto(Math.abs(volume), -3);
        let markerTime = TimeFloor(time, tf);
        if (volume < 0) {
            markers.push({
                time: markerTime,
                position: 'aboveBar',
                color: '#e91e63',
                shape: 'arrowDown',
                //text: 'Sell ' + volumeStr
                text: volumeStr
            });
        }
        else {
            markers.push({
                time: markerTime,
                position: 'belowBar',
                color: '#2196F3',
                shape: 'arrowUp',
                //text: 'Buy ' + volumeStr
                text: volumeStr
            });
        }
        trades.push({ time, volume, price: tradePrice, volumeTotal });
        return true;
    }
    //if (useVisual)  return;
    if (!useVisual && result) // Не визуальное тестирование
     {
        (_c = result.EquityBars) !== null && _c !== void 0 ? _c : (result.EquityBars = []);
        //for (let i = 0; i < result.EquityBars.length; i++) { let bar = result.EquityBars[i]; AddTrade(bar.time, bar.volume, 0, result.points[i].value.volume, markers, trades); }
        if (onTrades)
            onTrades(trades);
        //FillTradeTable([{time: 100, volume: 1, volumeTotal: 10}]);
        //markers=[];
        // Рисуем график котировок
        [priceChart] = DrawCandleChart(allbars, priceChart, priceChartColor, markers, timeShift_s);
        // Перебираем индикаторы и отрисоваем их
        //if (0)
        for (let [ind, indData] of indDatas.entries()) {
            indicatorSeries(ind).addData(indData.points);
        }
        //console.log(result.EquityBars);
        if (result.EquityBars) {
            myEquityChart.addEquityBars(result.EquityBars); // Отрисовка баров эквити
            myEquityChart.addBalancePoints(balancePoints); // Отрисовка линии баланса
        }
        // Делаем видимым весь график теста
        let bars = new CBars(tf, allbars);
        let startTime = testerInfo.config.startTime;
        let i = bars.indexOfLessOrEqual(startTime);
        i = Math.max(i - 5, 0);
        if (bars.length > 0) { //startTime= new Date(Math.min(bars.time(i).valueOf(), startTime.valueOf()));
            let range = { from: bars.time(i), to: testerInfo.config.endTime };
            //console.log(new Date(testerInfo.config.endTime.valueOf() + testerInfo.tf.msec*50));
            priceChart.timeScale().setVisibleRange(range);
            equityChart.timeScale().setVisibleRange(range);
        }
    }
    let statistics = new TradeStatistics(equityBars); //, testerInfo.symInfo.comissionPerSide);
    return [statistics, equityBars];
}
//import {verify} from "crypto";
//-----------------------------------------------
export async function Optimizate(item, tf, // таймфрейм
paramDatas, // массивы значений по параметрам
testerConfig, // конфигурация тестера
threadCount, // число потоков
genetic, // Параметры генетики
onResult, // обработчик результата
cancelToken // токен отмены    //speedRef : Readonly<CTesterSpeed>
) {
    //let defaultTreadCount= 4;
    //let nThreads= isNaN(threadCount) ? defaultTreadCount : threadCount;
    //alert(maxThreads);  return;
    ///if (1) { await TestWorker.Test(nThreads);  return; }
    await RunOptimization(item, tf, paramDatas, testerConfig, threadCount, genetic, (params, result) => {
        var _a;
        let statistics = new TradeStatistics((_a = result === null || result === void 0 ? void 0 : result.EquityBars) !== null && _a !== void 0 ? _a : []); //, item.symbolInfo.comissionPerSide);
        let equityValues = result === null || result === void 0 ? void 0 : result.points.map((point) => point.value.equity);
        onResult(params, statistics, equityValues);
        //if (speedRef && speedRef.value<0) return false;
        return true;
    }, cancelToken);
}
export const MsTradeSymbolQuotes = (name, smth, currency) => {
    console.log(name, smth, currency);
};
