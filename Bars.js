///<reference path="./BaseTypes.ts"/>
// /// <reference no-default-lib="false"/>
// ///<reference types="../BaseTypes"/>
import * as lib from "./Common.js";
import { BSearch, VirtualItems } from "./Common.js";
import { D1_MS, Period, TF } from "./Time.js";
//import {ParsedUrlQueryInput} from "querystring";
export * from "./Time.js";
export class OHLC {
    constructor(open, high, low, close) { return { open, high, low, close }; }
}
export class CBarBase // класс бара
 {
    constructor(time, open, high, low, close, volume = 0) {
        //[this.time, this.open, this.high, this.low, this.close, this.volume]= [time, open, high, low, close, volume];
        this.time = time;
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.volume = volume;
        //return {time, open, high, low, close, volume};
    }
}
export class CBar extends CBarBase {
    constructor(time, open, high, low, close, volume = 0) { super(time, open, high, low, close, volume); }
    static new(time, ohlc, volume = 0) {
        return new CBar(time, ohlc.open, ohlc.high, ohlc.low, ohlc.close, volume);
    }
    static fromParsedJSON(data) { return new CBar(new Date(data.time), data.open, data.high, data.low, data.close, data.volume); }
}
export class CTick {
    constructor(time, price, volume) { this.time = time; this.price = price; this.volume = volume; }
    ;
}
/*
interface CItems
{
    constructor();
}
*/
function getDraftTickSize(bars) { return bars instanceof CBarsBase ? bars._tickSize : bars.tickSize; }
export class IBars {
    constructor(tf) {
        //this._data= isImmutable && (bars instanceof Array)  ? bars  : [...bars];
        this.Tf = tf;
        console.assert(tf.msec <= TF.D1.msec); // Делаем такую проверку, т.к. функция closeTime пока не считает для W1 или MN1
        return new Proxy(this, lib.ArrayItemHandler((obj, i) => obj.data[i]));
    }
    [Symbol.iterator]() { return this.data[Symbol.iterator](); } //  let x = this.data[Symbol.iterator]();  }  //убираем отсюда, иначе невозможно будет неявное преобразование: IBars -> IBars
    //abstract get isMutable() : boolean;  // { return false; }
    // Получить иммутабельный объект
    toImmutable() { return this.Mutable ? new CBars(this.Tf, this.data, getDraftTickSize(this)) : this; }
    // число баров
    get count() { var _a, _b; return (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0; }
    // число баров
    get length() { return this.count; }
    // последний бар
    get last() { return this.count > 0 ? this.data[this.count - 1] : null; }
    // Получение бара по индексу задом наперёд
    backwardBar(i) { return this.data[this.length - 1 - i]; }
    time(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.time) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    open(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.open) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    high(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.high) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    low(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.low) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    close(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.close) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    volume(i) { var _a, _b; return (_b = (_a = this.data[i]) === null || _a === void 0 ? void 0 : _a.volume) !== null && _b !== void 0 ? _b : (() => { throw ("Wrong bar index: i=" + i + " barsTotal=" + this.count); })(); }
    closeTime(i) { return new Date(this.time(i).valueOf() + this.Tf.msec - 1); }
    // Время последнего бара
    get lastTime() { return this.count > 0 ? this.data[this.count - 1].time : null; }
    get lastCloseTime() { return this.count > 0 ? this.closeTime(this.count - 1) : null; }
    // Массив значений баров по заданному геттеру значения
    Values(getter) { return new VirtualItems((i) => getter(this.data[i]), () => this.data.length); }
    // виртуальные массивы значений баров:
    get times() { return this.Values((bar) => bar.time); } // массив времени   // return new VirtualItems((i)=>this._data[i].time, ()=>this._data.length); }
    get opens() { return this.Values((bar) => bar.open); } // массив цен открытия
    get highs() { return this.Values((bar) => bar.high); }
    get lows() { return this.Values((bar) => bar.low); }
    get closes() { return this.Values((bar) => bar.close); }
    get volumes() { return this.Values((bar) => bar.volume); }
    entries() { return this.data.entries(); }
    //*times2()  { for (let bar of this.data) yield bar.time; }  // Итератор времени
    //*closes()  { for (let bar of this._data) yield bar.close; } // Итератор цен закрытия
    //*volumes()  { for (let bar of this._data) yield bar.volume; } // Итератор объёмов
    // Индекс бара по времени (match - тип соответствия времени:  меньше/равно, равно, больше/равно). Проверяется попадание искомого времени в бар!
    indexOf(time, match) {
        time = Period.StartTime(this.Tf, time);
        return lib.BSearch(this.data, time, (bar, time) => bar.time.valueOf() - time.valueOf(), match ? match : BSearch.EQUAL);
    }
    // Индекс совпадающего или более раннего бара
    indexOfLessOrEqual(time) { return this.indexOf(time, "lessOrEqual"); }
    // Создать объект с добавленными барами в конце (текущий объект не меняется)
    concat(newBars) {
        let bars = newBars instanceof Array ? newBars : [newBars];
        let time = bars && bars.length > 0 && this.count > 0 ? bars[0].time : null;
        if (time && time <= this.lastTime) {
            console.error("Wrong bar start time:  " + time.toString() + " <= " + this.lastTime.toString());
            return null;
        }
        return new CBars(this.Tf, this.data.concat(bars), this.tickSize);
    }
    // Создать объект баров в диапазоне
    slice(startIndex, stopIndex) { let result = this.data.slice(startIndex, stopIndex); return new CBars(this.Tf, result, this.tickSize); }
    // Получение массива баров в диапазоне времени
    getArray(startTime, lastTime) {
        //if (startTime != Period.StartTime(this.Tf, startTime)) startTime= new PeriodSpan(this.Tf, startTime).next().StartTime();
        //if (lastTime != Period.EndTime(this.Tf, startTime)) startTime= new PeriodSpan(this.Tf, startTime).next().StartTime();
        let istart = startTime ? this.indexOf(startTime, BSearch.GREAT_OR_EQUAL) : 0;
        let ilast = lastTime ? this.indexOf(lastTime, BSearch.LESS_OR_EQUAL) : this.data.length - 1;
        //console.log(istart,ilast);
        //console.log("!!!",this.data);
        if (istart == -1 || istart > ilast)
            return null;
        return this.data.slice(istart, ilast + 1);
    }
    // Получение новых баров с выбранным таймфреймом
    toBars(tf, endDayTime_s) {
        let bars = this.toBarsArray(tf, endDayTime_s);
        return bars ? new CBarsMutable(tf, bars, this instanceof CBarsBase ? this._tickSize : this.tickSize) : null;
    }
    // Получение новых баров с выбранным таймфреймом
    toBarsArray(dstTf, endDayTime_s) {
        const src = this;
        if (src.Tf == dstTf && !endDayTime_s) {
            return [...src.data]; //src._data; //dst= [...src._data];
        }
        console.assert(dstTf.sec > 0); // if (dstTf.sec==0) { return null;
        let count = src.count;
        let dst = new Array(count);
        //if (!_Resize(bars)) return false;
        let mainTime = count > 0 ? src.time(0) : new Date(0);
        let period = new Period(dstTf); //TPeriodSpan periodspan(period, time);
        let nextPeriodTime = period.span(mainTime).next().startTime; //  (++periodspan).StartTime();
        //if (enddaytime==0) enddaytime= TIME_D1-1;
        //static bool modes[8];  for (BARVALUEMODE m=0; m<8; m++) modes[m]= src.IsModeUsing(m);
        //ArrayCopy(_ModeUsing, modes);
        //if (period!=src.PeriodSeconds() && modes[BAR_CLOSE]) { _ModeUsing[BAR_HIGH]=true;  _ModeUsing[BAR_OPEN]=true;  _ModeUsing[BAR_LOW]=true; }
        let istart = 0;
        let ilast = 0;
        let n = 0;
        for (let i = 1; i <= count; i++) {
            let bartime = i < count ? src.time(i) : new Date(2100, 1, 1); //INT_MAX / TIME_D1 * TIME_D1;
            if (endDayTime_s && bartime.valueOf() % D1_MS >= endDayTime_s * 1000 % D1_MS)
                continue;
            if (bartime >= nextPeriodTime) ///period > time/period)
             {
                let close = src.close(ilast);
                let time = period.span(mainTime).startTime;
                //console.log(bartime,"->",time,"  mainTime=",mainTime, period.name);
                let high = src._getHighestHigh(istart, ilast);
                let low = src._getLowestLow(istart, ilast);
                let open = src.open(istart);
                let volume = src.getSumVolume(istart, ilast); // _SetVolume(n, volume); }
                //if (_ModeUsing[BAR_SPREAD]) _SetSpread(n, src.GetAvrgSpread(istart, (INDEX)ilast));
                dst[n] = new CBar(time, open, high, low, close, volume);
                mainTime = bartime;
                istart = i;
                n++;
                nextPeriodTime = period.span(mainTime).next().startTime;
            }
            ilast = i;
        }
        dst.length = n; //splice(n, dst.length-n);  // Удаляем элементы в конце
        return dst;
    }
    _getHighestHigh(i0, i1) { let a = -Number.MAX_VALUE; for (let i = i0; i <= i1; i++)
        a = Math.max(a, this.high(i)); return a; }
    //GetHighestClose(i0 :number, i1 :number) { let a=-Number.MAX_VALUE;  for (let i=i0; i<=i1; i++) a= Math.max(a, this.close(i));  return a; }
    _getLowestLow(i0, i1) { let a = Number.MAX_VALUE; for (let i = i0; i <= i1; i++)
        a = Math.min(a, this.low(i)); return a; }
    // reduce2<T>(getter :(bar :CBar, index? :number)=>T, comparer :(val1 :T, val2 :T)=>boolean, iFirst :number|undefined, iLast :number|undefined) {
    // }
    getBest(comparer, iFirst, iLast) {
        iFirst !== null && iFirst !== void 0 ? iFirst : (iFirst = 0);
        iLast !== null && iLast !== void 0 ? iLast : (iLast = this.count - 1);
        if (iFirst > iLast)
            return [undefined, undefined]; //throw "iFirst > iLast";
        let n = iFirst, bestBar = this.data[iFirst];
        for (let i = iFirst + 1; i <= iLast; i++) {
            let bar = this.data[i];
            if (comparer(bestBar, bar) == true)
                [n, bestBar] = [i, bar];
        }
        return [n, bestBar];
    }
    getFirstHighest(iFirst, iLast) { return this.getBest((old, current) => current.high > old.high, iFirst, iLast); }
    getFirstLowest(iFirst, iLast) { return this.getBest((old, current) => current.low < old.low, iFirst, iLast); }
    getSumVolume(i0, i1) { let sum = 0; for (let i = i0; i <= i1; i++)
        sum += this.volume(i); return sum; } //return i0<=i1 ? VOLUME(sum/(i1-i0+1)) : 0; }
}
export class IBarsExt extends IBars {
    constructor() {
        super(...arguments);
        this.lastBarClosed = false;
    }
    static createCopy(bars, lastBarClosed) {
        let obj = CBars.createCopy(bars);
        obj.lastBarClosed = lastBarClosed;
        return obj;
    }
}
//function ffff(bars : IBars) { for(let a of bars);   let gg : IBars;  gg= bars; }
export class CBarsBase extends IBars {
    constructor(tf, bars, tickSize) {
        var _a;
        //this._data= isImmutable && (bars instanceof Array)  ? bars  : [...bars];
        super(tf); //this.Tf= tf;
        this._ticksize = tickSize ? tickSize : 0;
        if (bars == null)
            bars = [];
        if (bars instanceof IBars) {
            if (tf != bars.Tf)
                this._data = (_a = bars.toBarsArray(tf)) !== null && _a !== void 0 ? _a : [];
            else
                this._data = !bars.Mutable ? bars.data : [...bars];
        }
        else
            this._data = [...bars];
        //console.assert(this._data!=null);
        //console.assert(this.data!=null);
    }
    get _tickSize() { return this._ticksize; }
    //[Symbol.iterator]() { return this.data[Symbol.iterator](); }
    get data() { return this._data; }
    get tickSize() { if (!this._ticksize)
        this._ticksize = lib.MaxCommonDivisorOnArray(this.closes); return this._ticksize; }
    _Add(bars) { this._data = this._data.concat(bars); }
    static fromParsedJSON(data) {
        /*
        let dst= {}; //new CBars(TF.M1, []);
        Object.setPrototypeOf(dst, CBars.prototype);
        let src= JSON.parse(str, (key,val)=>
            (val instanceof Array ?  val.map((el)=>new CBar(new Date(el.time), el.open, el.high, el.low, el.close, el.volume))
                : key==Object.keys({IBars.prototype.Tf})[0] ? TF.get(val.name) : val));
        console.log(src);
        alert(src.Tf instanceof TF);
        return Object.assign(dst, src);
        */
        //let data= JSON.parse(str);
        //console.log("!!!! ",data.bars.Tf);
        let d = data; //{[key in keyof CBars]};  // Задаём тип CBars, чтобы обращаться к именам свойств
        let tf = TF.fromSec(d.Tf.sec);
        if (!tf) {
            console.assert(tf != null);
            throw ("wrong TF");
        }
        let obj = new CBars(tf, d._data.map((el) => CBar.fromParsedJSON(el))); //new CBar(new Date(el.time as any), el.open, el.high, el.low, el.close, el.volume)));
        return obj;
    }
}
//------------------------------------------------
export class CBars extends CBarsBase {
    constructor(tf, bars, tickSize) {
        super(tf, bars !== null && bars !== void 0 ? bars : [], tickSize);
        this.Mutable = false;
    }
    static createCopy(bars) { return new CBars(bars.Tf, bars.data, bars.tickSize); }
}
//----------------------------------------
export class CBarsMutableBase extends CBarsBase {
    constructor(tf, bars, tickSize) { super(tf, bars !== null && bars !== void 0 ? bars : [], tickSize); this._tickSizeAuto = !tickSize; }
    get data() { return this._data; }
    //constructor(tf :TF,  tickSize? :number);                          //{ super(tf, bars, tickSize);  this._tickSizeAuto= !tickSize; }
    //constructor(tf :TF,  paramOne? :readonly CBar[]|number,  paramTwo? :number)  { super(tf, typeof paramOne!="number" ? bars, tickSize);  this._tickSizeAuto= !tickSize; }
    // Виртуальное свойство мутабельности
    //readonly Mutable = true;
    // Добавление баров в конец
    Add(Bars) {
        let bars = Bars instanceof Array ? Bars : [Bars];
        if (!bars || bars.length == 0)
            return;
        let time = bars[0].time;
        if (this.count > 0 && time <= this.lastTime)
            throw "Wrong bar start time:  " + time + " <= " + this.lastTime;
        if (!this.data)
            this._data = [];
        this.data.push(...bars); //this._Add(bars);
        if (this._tickSizeAuto)
            this._ticksize = 0;
    } //{ this._data = this._data.concat(bars); } //= [...this._data, ...bars]; }
    // Добавить тик в конец
    AddTick(tick) {
        if (!tick)
            return false;
        if (this.count > 0 && tick.time < this.lastTime) {
            console.error("Wrong tick time:  " + tick.time + " < " + this.lastTime);
            return false;
        }
        let barTime = Period.StartTime(this.Tf, tick.time);
        let bar;
        let price = tick.price;
        let i = this.count;
        if (this.count > 0 && barTime.valueOf() == this.lastTime.valueOf()) {
            bar = this.last;
            i--;
            bar = new CBar(barTime, bar.open, Math.max(bar.high, price), Math.min(bar.low, price), price, bar.volume + tick.volume);
        }
        else
            bar = new CBar(barTime, price, price, price, price, tick.volume);
        //console.log(i, barTime==this.lastTime);
        if (!this._data)
            this._data = [];
        this.data[i] = bar;
        return true;
    }
    // Добавить тики в конец
    AddTicks(ticks) { for (let tick of ticks)
        if (!this.AddTick(tick))
            return false; return true; }
}
export class CBarsMutable extends CBarsMutableBase {
    constructor() {
        super(...arguments);
        // Виртуальное свойство мутабельности
        this.Mutable = true;
    }
}
// Создание рандомных баров
export function CreateRandomBars(tf, startTime, endTimeOrCount, startPrice = 0, volatility = 1.0, tickSize = 0.01) {
    if (!tf || tf.msec == 0)
        return null;
    console.log("Creating bars with parameters: ", arguments);
    //let endTime : const_Date;
    let count;
    if (typeof endTimeOrCount == "number")
        count = endTimeOrCount;
    //endTime = new Period(tf).span()
    else
        count = (endTimeOrCount.valueOf() - startTime.valueOf()) / tf.msec + 1;
    let bars = new Array(count);
    let price = startPrice;
    let time = startTime;
    function norm(value) { return Math.round(value / tickSize) * tickSize; } // lib.NormalizeDouble(value, )}
    for (let i = 0; i < count; i++) {
        let open = norm(price + (Math.random() * 2 - 1) * volatility / 10);
        let high = norm(open + Math.random() * volatility);
        let low = norm(open - Math.random() * volatility);
        let close = norm(low + Math.random() * (high - low));
        let bar = new CBar(time, open, high, low, close, tf.sec);
        bars[i] = bar;
        time = new Date(time.valueOf() + tf.msec);
        price = close;
    }
    return new CBars(tf, bars);
}
//import {Immutable, Readonly} from "./BaseTypes";
export class CTimeSeriesBase {
    time(i) { return this.points[i].time; }
    value(i) { return this.points[i].value; }
    get last() { return this.points[this.points.length - 1]; }
    get times() { return new lib.VirtualItems((i) => this.time(i), () => this.length); }
    get values() { return new lib.VirtualItems((i) => this.value(i), () => this.length); }
    get length() { return this.points.length; }
    IndexOf(time, match) { return BSearch(this.times, time, match); } // { lib.BSearch();}
    constructor() {
        return new Proxy(this, lib.ArrayItemHandler((obj, i) => obj.points[i]));
    }
    [Symbol.iterator]() { return this.points[Symbol.iterator](); }
}
export class CTimeSeries extends CTimeSeriesBase {
    constructor(name, points) {
        super();
        this.points = [];
        this.name = name;
        this.points = points ? [...points] : [];
    }
    static fromParsedJSON(data) {
        if (!data)
            return data;
        let obj = new CTimeSeries();
        console.assert(data.points != null); //if (!data.points) return null; //console.log(data);
        //obj.points[0]= { time : new Date, value: data.points[0].value as TT };
        //let fff = obj.points[0].value;
        obj.name = data.name;
        obj.points = data.points.map((pnt) => { return { time: new Date(pnt.time), value: pnt.value }; });
        return obj;
    }
    write(stream, arg) {
        var _a;
        let valueWriter = (typeof arg == "function") ? arg : (stream, value) => stream.pushNumber(value, arg);
        function _writePoint(stream, pair) { return stream.pushInt64(pair.time.valueOf()) != null && valueWriter(stream, pair.value) != false; }
        return stream.pushUnicode((_a = this.name) !== null && _a !== void 0 ? _a : null).pushArrayByFunc(this.points, _writePoint) != null;
    }
    static read(stream, arg) {
        let valueGetter = (typeof arg == "function") ? arg : (stream) => stream.readNumber(arg);
        let name = stream.readUnicode();
        let points = stream.readArray((stream) => ({ time: new Date(stream.readUint64()), value: valueGetter(stream) }));
        return new CTimeSeries(name !== null && name !== void 0 ? name : undefined, points);
    }
}
function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = typeof (val1) == "object" && typeof (val2) == "object";
        if (areObjects ? !deepEqual(val1, val2) : val1 !== val2)
            return false;
    }
    return true;
}
function _findBars(srcBars, barsToFind, mode) {
    let len = barsToFind.length;
    if (srcBars.length < len || len == -1)
        return -1;
    let start = 0;
    let end = len - 1;
    let iStart = BSearch(srcBars, barsToFind[start].time, (bar, time) => bar.time.valueOf() - time.valueOf());
    let iEnd = BSearch(srcBars, barsToFind[end].time, (bar, time) => bar.time.valueOf() - time.valueOf());
    //console.log(iStart, iEnd, iEnd-iStart+1, len);
    if (iStart < 0 || iEnd < 0 || iEnd - iStart + 1 != len)
        return -1;
    let delta = start - iStart;
    if (mode == "deep") {
        for (let i = iStart; i <= iEnd; i++)
            if (!deepEqual(srcBars[i], barsToFind[i + delta]))
                return -1;
    }
    else
        for (let i = iStart; i <= iEnd; i++)
            if (srcBars[i] != barsToFind[i + delta])
                return -1;
    return iStart;
}
function findBarsDeep(srcBars, barsToFind) {
    return _findBars(srcBars, barsToFind, "deep");
}
//let z= new CTimeSeries<number>();
export function findBarsShallow(srcBars, barsToFind) {
    return _findBars(srcBars, barsToFind, "shallow");
}
