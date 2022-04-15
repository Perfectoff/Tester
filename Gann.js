import * as lib from "../Nav/Common.js";
var BarMode;
(function (BarMode) {
    BarMode[BarMode["High"] = 0] = "High";
    BarMode[BarMode["OpenClose"] = 1] = "OpenClose";
    BarMode[BarMode["Average"] = 2] = "Average";
})(BarMode || (BarMode = {}));
class CGannLevels {
    constructor() {
        this.priceLevels = [];
        this.timeLevels = [];
        this.levelPercents = [];
    }
}
// class CGannLines
// {
// 	horizontals : readonly Line[] = [];
// 	verticals : readonly Line[] = [];
// 	diagonals : readonly Line[] = [];
// 	mainDiagIndexes :[number,number];
// }
// class CGannGrid
// {
// 	levels : CGannLevels;
// 	lines : CGannLines;
// }
function GetGannLines(grid) {
    var _a, _b;
    let diagonals = [];
    let horizontals = [];
    let verticals = [];
    let [timeLevels, priceLevels] = [grid.timeLevels, grid.priceLevels];
    let timeLevelLast = timeLevels[timeLevels.length - 1];
    let priceLevelLast = priceLevels[priceLevels.length - 1];
    //console.log(grid);
    //return null;
    function newLine(x1, y1, x2, y2, name) { return { begin: { x: x1, y: y1 }, end: { x: x2, y: y2 }, name }; }
    // Вертикали
    if (1)
        for (let i = 0; i < timeLevels.length; i++)
            verticals.push(newLine(timeLevels[i], priceLevels[0], timeLevels[i], priceLevelLast, (_a = grid.levelPercents) === null || _a === void 0 ? void 0 : _a[i].toString()));
    //console.log(verticals);
    // Горизонтали
    if (1)
        for (let i = 0; i < priceLevels.length; i++)
            horizontals.push(newLine(timeLevels[0], priceLevels[i], timeLevelLast, priceLevels[i], (_b = grid.levelPercents) === null || _b === void 0 ? void 0 : _b[i].toString()));
    //console.log(horizontals);
    // Диагонали:
    if (1)
        for (let i = 1; i < timeLevels.length - 1; i++) {
            diagonals.push(newLine(timeLevels[0], priceLevels[0], timeLevels[i], priceLevelLast));
            diagonals.push(newLine(timeLevels[0], priceLevelLast, timeLevels[i], priceLevels[0]));
            diagonals.push(newLine(timeLevels[i], priceLevelLast, timeLevelLast, priceLevels[0]));
            diagonals.push(newLine(timeLevels[i], priceLevels[0], timeLevelLast, priceLevelLast));
        }
    //console.log(diagonals);
    if (1)
        for (let j = 1; j < priceLevels.length - 1; j++) {
            diagonals.push(newLine(timeLevels[0], priceLevels[0], timeLevelLast, priceLevels[j]));
            diagonals.push(newLine(timeLevels[0], priceLevelLast, timeLevelLast, priceLevels[j]));
            diagonals.push(newLine(timeLevels[0], priceLevels[j], timeLevelLast, priceLevels[0]));
            diagonals.push(newLine(timeLevels[0], priceLevels[j], timeLevelLast, priceLevelLast));
        }
    // Главные диагонали
    diagonals.push(newLine(timeLevels[0], priceLevels[0], timeLevelLast, priceLevelLast));
    diagonals.push(newLine(timeLevels[0], priceLevelLast, timeLevelLast, priceLevels[0]));
    // Проверка наличия дубликатов
    if (0) {
        let alllines = [...horizontals, ...verticals, ...diagonals];
        for (let i = 0; i < alllines.length; i++)
            for (let j = 0; j < alllines.length; j++)
                if (j != i)
                    if (JSON.stringify(alllines[i]) == JSON.stringify(alllines[j]))
                        console.log("Dublicate lines #" + i + " and #" + j + ":  ", alllines[i], " == ", alllines[j], "  ", alllines[i] == alllines[j]);
    }
    return { horizontals, verticals, diagonals, mainDiagIndexes: [diagonals.length - 2, diagonals.length - 1] };
}
export class CLevelFlags {
    constructor() {
        this.quarter = false; // 1/4
        this.eighth = false; // 1/8
        this.third = false; // 1/3
        //ninth :boolean;  // 1/9
        this.fifth = false; // 1/5
    }
}
CLevelFlags.full = { quarter: true, eighth: true, third: true, fifth: true };
function createGannLevels(date1, price1, date2, price2, levels) {
    if (!(levels instanceof Array)) {
        let flags = levels;
        const levels1 = [0, 100];
        const levels4 = [25, 50, 75];
        const levels8 = [12.5, 37.5, 62.5, 87.5];
        const levels3 = [33.3, 66.6];
        const levels5 = [20, 40, 60, 80];
        const levels9 = [11.1, 22.2, 44.4, 55.5, 77.7, 88.8];
        let numLevels = [...levels1, ...(flags.quarter ? levels4 : []), ...(flags.eighth ? levels8 : []), ...(flags.third ? levels3 : []), ...(flags.fifth ? levels5 : [])];
        levels = numLevels.sort((a, b) => Math.sign(a - b));
        //console.log(levels);
    }
    let priceRange = price2 - price1;
    let timeRange = date2.valueOf() - date1.valueOf();
    console.assert(timeRange > 0, "timeRange=" + timeRange + " date1=" + date1 + " date2=" + date2);
    let priceLevels = [];
    let timeLevels = [];
    for (let i = 0; i < levels.length; i++) {
        priceLevels[i] = price1 + priceRange * levels[i] / 100.0;
        timeLevels[i] = date1.valueOf() + timeRange * levels[i] / 100.0;
    }
    return { timeLevels, priceLevels, levelPercents: levels };
}
// Расчёт сетки ганна
function createGannLevelsBySize(bar, mode, tf, priceUnit, size, Up, levelFlags) {
    let priceOC = Up ? Math.min(bar.open, bar.close) : Math.max(bar.open, bar.close);
    let priceExtrem = Up ? bar.low : bar.high;
    let priceA = mode == BarMode.High ? priceExtrem : mode == BarMode.OpenClose ? priceOC : mode == BarMode.Average ? (priceOC + priceExtrem) / 2 : null;
    console.assert(priceA != null);
    if (priceA == null)
        throw ("priceA==" + priceA);
    let timeA = bar.time.valueOf();
    let k = Up ? 1 : -1;
    let priceB = priceA + priceUnit * size * k;
    //Y *= tf.msec / bars.Tf.msec;
    //let Z = priceA * X * Y;
    let timeB = timeA + tf.msec * size; //(Z-ibar);
    return createGannLevels(new Date(timeA), priceA, new Date(timeB), priceB, levelFlags);
}
// function getGannGridExt(bars :IBars, ibar :number, tf :TF, mode :BarMode, Down :boolean, X :number, Y :number, levelFlags :Readonly<CLevelFlags>) : CGannLevels
// {
// 	let bar= bars[ibar];
// 	let priceOC= Down ? Math.max(bar.open, bar.close) : Math.min(bar.open, bar.close);
// 	let priceExtrem= Down ? bar.high : bar.low;
// 	let priceA= mode==BarMode.High ? priceExtrem : mode==BarMode.OpenClose ? priceOC : mode==BarMode.Average ? (priceOC + priceExtrem)/2 : null;
// 	console.assert(priceA!=null);
// 	let timeA= bar.time.valueOf();
// 	let k= Down ? 1 : -1;
// 	let priceB = priceA - priceA*X*k;
// 	Y *= tf.msec / bars.Tf.msec;
// 	let Z = priceA * X * Y;
// 	let timeB = timeA + tf.msec * (Z-ibar);
//
// 	return createGannLevels(new Date(timeA), priceA, new Date(timeB), priceB, levelFlags);
// }
const __Debug = false;
// Расчёт оптимального размера коробки
function GetOptimalGannBoxSize(date1, price1, date2, price2, tf, config) {
    let priceRange = Math.abs(price2 - price1); //*2;
    let barsRange = Math.ceil((date2.valueOf() - date1.valueOf()) / tf.msec); // *2;
    const maxDivideCount = config.maxDivideCount;
    const maxFillPercent = config.maxFillPercent;
    const scaleRadix = config.scaleRadix;
    if (barsRange == 0) {
        console.error("barsRange=0");
        return null;
    }
    ;
    console.assert(barsRange > 0);
    console.assert(maxDivideCount >= 0);
    if (!maxFillPercent)
        return null;
    let kFill = 100 / maxFillPercent;
    let size = Math.round(price1 * Math.pow(10, lib.GetDblPrecision(price1)));
    function log(value) { return Math.log(value) / Math.log(scaleRadix); }
    // width_bars < size * 10^x
    // width_bars/size < 10^x
    //x > log(width_bars/size) / log (10)
    //size = width_bars / 10^x
    let sizeX = size * scaleRadix ** Math.ceil(log(barsRange / size * kFill));
    if (__Debug)
        console.log("size0=", sizeX);
    /*
    if (size > barsRange*8 && size>=100) size/=4;
    else if (size > barsRange*4 && size>=10) size/=2;
    */
    /*
    if (size > barsRange*kFill*4 && size%4==0) size/=4;
    else if (size > barsRange*kFill*2 && size%2==0) size/=2;
    */
    for (let i = 0; i < maxDivideCount; i++) {
        //if (sizeX > barsRange*kFill*2  &&  sizeX%2==0) sizeX/=2;
        if (sizeX > barsRange * kFill * 2)
            sizeX /= 2;
        else
            break;
    }
    //let len= barsRange;
    //let priceUnit= priceRange/(size/kFill);  if (__Debug) console.log("priceUnit0=",priceUnit);
    // 1.6 * 10^x <=  0.2 * 2;
    // 10^x <= 0.2*2 / 1.6;
    // x <= log(0.2*2 / 1.6);
    let sizeY = price1 * scaleRadix ** Math.ceil(log(priceRange * kFill / price1));
    if (__Debug)
        console.log("sizeY0=", sizeY);
    for (let i = 0; i < maxDivideCount; i++) {
        //if (sizeY > priceRange*kFill*2  &&  sizeY%2==0) sizeY/=2;
        if (sizeY > priceRange * kFill * 2)
            sizeY /= 2;
        else
            break;
    }
    return { sizeX, sizeY };
    /*
    //let minPriceUnit= 1;

    //if (priceUnit<minPriceUnit) { size *= 10** Math.ceil(Math.log10(minPriceUnit / priceUnit));  priceUnit= minPriceUnit;  console.log("replace"); }
    //priceUnit= 10 ** Math.ceil(Math.log(priceRange)/Math.log(size/2));
    priceUnit= 10 ** Math.ceil(Math.log10(priceUnit));
    //priceUnit= scaleRadix ** Math.ceil(log(priceUnit));
    let minRemainder= maxDivideCount>=2 ? 2.5 : maxDivideCount==1 ? 5 : 0;  // Мин.остаток от деления на 2
    if (minRemainder)
        if (priceUnit * size/kFill > priceRange*5) { console.log("!!!");  size= Math.log10(size)%1==0 ? size*minRemainder : size*2;  priceUnit/=10; }

    //else if (priceUnit * size / 2 > priceRange*8)

    //console.log(priceRange, size, priceUnit);
        //10** (Math.ceil(Math.log10(priceUnit)) + 1);
    if (__Debug) {
        console.log("size=", size);
        console.log("priceUnit=", priceUnit);
    }
    return {size, priceUnit};
    */
}
function createGannGridAuto(date1, price1, date2, price2, tf, levels, config) {
    let gridSize = GetOptimalGannBoxSize(date1, price1, date2, price2, tf, config); // maxFillPercent, scaleRadix, maxDivideCount);  //[size, priceUnit]=
    if (!gridSize)
        return null;
    let [sizeX, sizeY] = [gridSize.sizeX, gridSize.sizeY];
    let date3 = new Date(date1.valueOf() + sizeX * tf.msec);
    console.assert((date3 === null || date3 === void 0 ? void 0 : date3.valueOf()) > 0 && !isNaN(date3.valueOf()), date1.valueOf() + " + " + sizeX + " * " + tf.msec + " == " + date3 + "\nConfig: " + JSON.stringify(config));
    let price3 = price1 + sizeY * Math.sign(price2 - price1);
    // let [size, priceUnit]= [gridSize.size, gridSize.priceUnit];
    // let date3= new Date(date1.valueOf() + size * tf.msec);
    // let price3= price1 + size * priceUnit * Math.sign(price2 - price1);
    //console.log(price1, price2, price3);//, size, priceUnit);
    let gridLevels = createGannLevels(date1, price1, date3, price3, levels);
    //console.log(gridLevels);
    return GetGannLines(gridLevels);
}
function __CreateGannGridAutoGraphLines(grid, config, tf, tickSize) {
    let lines = [];
    let up = grid.horizontals.length >= 2 ? grid.horizontals[0].begin.y < grid.horizontals[1].begin.y : true;
    //let [width,height] = width_height ?? [null,null];
    let width = grid.horizontals[0].end.x - grid.horizontals[0].begin.x;
    let height = (grid.verticals[0].end.y - grid.verticals[0].begin.y) * (up ? 1 : -1);
    if (tf)
        width = Math.round(width / tf.msec);
    if (tickSize)
        height = Math.round(height / tickSize) * tickSize;
    let widthStr = lib.DblToStrAuto(width, 8);
    let heightStr = lib.DblToStrAuto(height, 8);
    let color = config.color;
    for (let line of [...grid.horizontals, ...grid.verticals]) {
        let [begin, end] = line.begin.y <= line.end.y ? [line.begin, line.end] : [line.end, line.begin];
        if (line == grid.horizontals[0]) {
            lines.push({ begin: begin, end: end, color: color, text: widthStr + " x " + heightStr, textAlignH: "left", textAlignV: up ? "bottom" : "top", width: 1 });
            continue;
        }
        let text = line.name != "0" ? line.name : null;
        lines.push({ begin: begin, end: end, color: color, text: text != null ? text + " " : undefined, textPosH: "left", textAlignH: "right", width: 1 });
        if (text)
            lines.push({ begin: begin, end: end, color: null, textColor: color, text: " " + text, textPosH: "right", textAlignH: "left", width: 1 });
    }
    let n = 0;
    for (let line of grid.diagonals) {
        let width = n == grid.mainDiagIndexes[0] || n == grid.mainDiagIndexes[1] ? 2 : 1;
        lines.push({ begin: line.begin, end: line.end, color: color, width });
        n++;
    }
    return lines;
}
// Создание автоматически расчитанной сетки
export function CreateGannAutoGraphLines(date1, price1, date2, price2, tf, config, tickSize) {
    let levelFlags = config.levels === "all" ? CLevelFlags.full : config.levels;
    let grid = createGannGridAuto(date1, price1, date2, price2, tf, levelFlags, config); //config.maxFillPercent, config.scaleRadix, config.maxDivideCount);
    if (!grid)
        return [];
    //console.log(grid);
    //let width= (date2.valueOf()-date1.valueOf()) / tf.msec;
    //let height= Math.abs(price2 - price1);
    //if (tickSize) height= Math.round(height/tickSize)*tickSize;
    return __CreateGannGridAutoGraphLines(grid, config, tf, tickSize); //[width, height]);
}
// let lines= CreateGannAutoGraphLines(new Date("2020-1-1"), 100, new Date("2020-1-2"), 200, TF.H1,
// 	{drawMode : "Full", levels :"all", color : "red" as ColorString });
// console.log(lines);
export function CreateGannGraphLines(firstBar, tf, priceUnit, size, barMode, Up, config) {
    let levelFlags = config.levels === "all" ? CLevelFlags.full : config.levels;
    let levels = createGannLevelsBySize(firstBar, barMode, tf, priceUnit, size, Up, levelFlags);
    let grid = GetGannLines(levels);
    return __CreateGannGridAutoGraphLines(grid, config);
}
//
// class GannGridConfig
// {
// 	tf : TF;
// 	widthBars : number;
// 	heightPrice : number;
// 	Down : boolean;
// 	X : number = 0.03125;
// 	Y : number = 1000;
// 	drawMode : "FULL"|"TimeGrid"|"PriceGrid"|"TimeAndPriceGrid";
// }
import * as Tester from "./Tester.js";
import { CSymbol, CQuotesHistory } from "./Tester.js";
import { CATR } from "./Indicator.js";
class CStrategySignaller_LineTrading {
    //protected trendExtrem :number;  // Цена экстремума по тренду
    constructor(line, atrBars = 20) {
        this.signal = null; // // Цена экстремума по тренду
        this.line = line.begin.x < line.end.x ? Object.assign({}, line) : { begin: line.end, end: line.begin, name: line.name };
        this.atr = new CATR(atrBars);
    }
    signalTrailing(signal, bar) { return Tester.StrategySignalTrailing(signal, bar, 0.2 * this.atr.value()); }
    onNewBars(bars) {
        let line = this.line;
        for (let bar of bars) {
            this.atr.push(bar);
            if (bar.time.valueOf() < line.begin.x || bar.time.valueOf() > line.end.x) {
                this.signal = null; // За диапазоном линии
                continue;
            }
            if (this.signal) {
                this.signal = this.signalTrailing(this.signal, bar);
            }
            if (this.signal)
                continue;
            let linePrice = line.begin.y + (line.end.y - line.begin.y) / (line.end.x - line.begin.x) * (bar.time.valueOf() - line.begin.x);
            let atr = this.atr.value();
            const delta_atrFactor = 0.05; //this.delta_atrFactor;
            //let lower= true;
            if (this.isLower == null) {
                if (bar.high - linePrice < delta_atrFactor * atr)
                    this.isLower = true; // Бар ниже линии
                if (bar.low - linePrice > -delta_atrFactor * atr)
                    this.isLower = this.isLower == null ? false : null; // Бар выше линии
            }
            if (this.isLower == null)
                continue;
            let [price, k] = this.isLower ? [bar.high, 1] : [bar.low, -1];
            let breakout = (price - linePrice) * k;
            if (breakout > 0 && breakout <= delta_atrFactor * atr) { //this.signal = {volume: -k, stoploss: price + 0.2*atr*k};
                this.isLower = null;
                this.signal = this.signalTrailing({ volume: -k }, bar); //this.trendExtrem = k==1 ? bar.low : bar.high;
            }
        }
    }
    getSignal() { return this.signal; }
}
// Получить статистику по линиям
async function GetLinesTradeStatistics(lines, bars) {
    var _a, _b, _c;
    let symbol = new CSymbol({
        name: "TesterSymbol",
        fullName: "",
        lotSize: 1,
        comissionPerSide: null,
        priceInfo: null
    }, new CQuotesHistory(bars));
    if (bars.length == 0)
        return 0;
    let config = { startTime: bars.time(0), endTime: bars.lastTime, startBalance: 0 };
    let results = [];
    let sum = 0;
    for (let line of lines) {
        let signaller = new CStrategySignaller_LineTrading(line);
        let result = await Tester.RunSignallerTest(signaller, bars.Tf, symbol, config);
        results.push(result);
        sum += (_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.EquityHistory) === null || _a === void 0 ? void 0 : _a.last) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : 0;
    }
    return sum;
    // // Переворачиваем координаты линий, у которых начало правее конце
    // lines= lines.map((line)=> line.begin.x < line.end.x ? line : {begin: line.end, end: line.begin, name: line.name} );
    // // Находим минимальное и максимальное время
    // let [minTime, maxTime] = lines.reduce(([min, max], line)=>[Math.min(line.begin.x, min), Math.max(line.end.x, max)], [Number.MAX_VALUE, Number.MIN_VALUE]);
    // let ifirst= bars.IndexOf(new Date(minTime), lib.E_MATCH.GREAT_OR_EQUAL);
    // let ilast= bars.IndexOf(new Date(maxTime), lib.E_MATCH.LESS_OR_EQUAL);
    //
    // for(let i=ifirst; i<=ilast; i++)
    // {
    // 	let i = 0;
    // }
}
