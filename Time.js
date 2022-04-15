///<reference path="./BaseTypes.ts"/>
import * as lib from "./Common.js";
export * from "./Common.js";
var __E_TF;
(function (__E_TF) {
    __E_TF[__E_TF["S1"] = 1] = "S1";
    __E_TF[__E_TF["S2"] = 2] = "S2";
    __E_TF[__E_TF["S3"] = 3] = "S3";
    __E_TF[__E_TF["S4"] = 4] = "S4";
    __E_TF[__E_TF["S5"] = 5] = "S5";
    __E_TF[__E_TF["S6"] = 6] = "S6";
    __E_TF[__E_TF["S10"] = 7] = "S10";
    __E_TF[__E_TF["S12"] = 8] = "S12";
    __E_TF[__E_TF["S15"] = 9] = "S15";
    __E_TF[__E_TF["S20"] = 10] = "S20";
    __E_TF[__E_TF["S30"] = 11] = "S30";
    __E_TF[__E_TF["M1"] = 12] = "M1";
    __E_TF[__E_TF["M2"] = 13] = "M2";
    __E_TF[__E_TF["M3"] = 14] = "M3";
    __E_TF[__E_TF["M4"] = 15] = "M4";
    __E_TF[__E_TF["M5"] = 16] = "M5";
    __E_TF[__E_TF["M6"] = 17] = "M6";
    __E_TF[__E_TF["M10"] = 18] = "M10";
    __E_TF[__E_TF["M12"] = 19] = "M12";
    __E_TF[__E_TF["M15"] = 20] = "M15";
    __E_TF[__E_TF["M20"] = 21] = "M20";
    __E_TF[__E_TF["M30"] = 22] = "M30";
    __E_TF[__E_TF["H1"] = 23] = "H1";
    __E_TF[__E_TF["H2"] = 24] = "H2";
    __E_TF[__E_TF["H3"] = 25] = "H3";
    __E_TF[__E_TF["H4"] = 26] = "H4";
    __E_TF[__E_TF["H6"] = 27] = "H6";
    __E_TF[__E_TF["H8"] = 28] = "H8";
    __E_TF[__E_TF["H12"] = 29] = "H12";
    __E_TF[__E_TF["D1"] = 30] = "D1";
    __E_TF[__E_TF["W1"] = 31] = "W1";
})(__E_TF || (__E_TF = {}));
;
export const H1_S = 3600;
export const D1_S = 3600 * 24;
export const W1_S = D1_S * 7;
export const D1_MS = D1_S * 1000;
export const H1_MS = H1_S * 1000;
export const M1_MS = 60 * 1000;
const __Tf_S = [0, 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60, 120, 180, 240, 300, 360, 600, 720, 900, 1200, 1800, H1_S, H1_S * 2, H1_S * 3, H1_S * 4, H1_S * 6, H1_S * 8, H1_S * 12, D1_S, W1_S];
function getTF(str) { return TF.get(str); }
//-------------------------------------
export class TIME_UNIT {
    constructor(msec, name, shortName) {
        this.index = ++TIME_UNIT._lastIndex;
        this.msec = msec;
        this.sec = Math.floor(msec / 1000);
        this.name = name;
        this.sign = shortName;
    }
}
TIME_UNIT._lastIndex = 0;
TIME_UNIT.MSecond = new TIME_UNIT(1, "millisecond", "MS");
TIME_UNIT.Second = new TIME_UNIT(1000, "second", "S");
TIME_UNIT.Minute = new TIME_UNIT(60 * 1000, "minute", "M");
TIME_UNIT.Hour = new TIME_UNIT(H1_S * 1000, "hour", "H");
TIME_UNIT.Day = new TIME_UNIT(D1_S * 1000, "day", "D");
TIME_UNIT.Week = new TIME_UNIT(D1_S * 1000 * 7, "week", "W");
// /**
//  * Tests if two types are equal
//  */
// export type Equals<T, S> =
// 	[T] extends [S] ? (
// 		[S] extends [T] ? true : false
// 		) : false
// 	;
export class TF {
    constructor(sec, name) {
        this.sec = sec;
        this.name = name;
        this.msec = sec * 1000;
        this.index = __Tf_S.indexOf(sec);
        this.unit = sec % D1_S == 0 ? TIME_UNIT.Day : sec % H1_S == 0 ? TIME_UNIT.Hour : sec % 60 == 0 ? TIME_UNIT.Minute : TIME_UNIT.Second;
        this.unitCount = sec / this.unit.sec;
    }
    valueOf() { return this.msec; }
    // Получение таймфрейма по имени
    static get(name) {
        let key = __E_TF[name];
        if (key)
            return this.all[key];
        return null;
    }
    // Получение таймфрейма по имени
    static fromName(name) { return this.get(name); }
    // Получение таймфрейма из секунд
    static fromSec(value) { return this._mapBySec[value]; }
    static min(...args) {
        let tfs = ((args[0] && !(args[0] instanceof TF)) ? args[0] : args);
        let index = 999;
        for (let tf of tfs)
            if (tf)
                index = Math.min(tf.index, index);
        return index != 999 ? this.all[index] : null;
    }
    static max(...args) {
        let tfs = ((args[0] && !(args[0] instanceof TF)) ? args[0] : args);
        let index = -1;
        for (let tf of tfs)
            if (tf)
                index = Math.max(tf.index, index);
        return index != -1 ? this.all[index] : null;
    }
}
//static fromValue(value : )
TF.all = function () {
    let i = 1;
    let arr = [];
    for (let key of lib.GetEnumKeys(__E_TF)) {
        arr[__E_TF[key]] = new TF(__Tf_S[i], key);
        i++;
    }
    return arr;
}();
TF._mapBySec = function () {
    let map = {};
    for (let i of __Tf_S.keys())
        map[__Tf_S[i]] = TF.all[i];
    return map;
}();
TF.S1 = getTF("S1");
TF.S2 = getTF("S2");
TF.S3 = getTF("S3");
TF.S4 = getTF("S4");
TF.S5 = getTF("S5");
TF.S6 = getTF("S6");
TF.S10 = getTF("S10");
TF.S12 = getTF("S12");
TF.S15 = getTF("S15");
TF.S20 = getTF("S20");
TF.S30 = getTF("S30");
TF.M1 = getTF("M1");
TF.M2 = getTF("M2");
TF.M3 = getTF("M3");
TF.M4 = getTF("M4");
TF.M5 = getTF("M5");
TF.M6 = getTF("M6");
TF.M10 = getTF("M10");
TF.M12 = getTF("M12");
TF.M15 = getTF("M15");
TF.M20 = getTF("M20");
TF.M30 = getTF("M30");
TF.H1 = getTF("H1");
TF.H2 = getTF("H2");
TF.H3 = getTF("H3");
TF.H4 = getTF("H4");
TF.H6 = getTF("H6");
TF.H8 = getTF("H8");
TF.H12 = getTF("H12");
TF.D1 = getTF("D1");
TF.W1 = getTF("W1");
//console.log(TF.min(TF.M5, TF.M2, TF.D1));
//TF.prototype.valueOf= ()=>this.msec;
//console.log("!!!");
//console.log((TF.get("H1") as TF) > (TF.get("M1") as TF));
function TimeAddMilliseconds(time, shift) { return new Date(time.valueOf() + shift); }
class MyDate extends Date {
    constructor(valueMs) { super(valueMs); }
    ToShiftedMsTime(shiftMs) { return TimeAddMilliseconds(this, shiftMs); } // Время, сдвинутое на заданное число миллисекунд
}
//----------------------------------------------
export class PeriodSpan {
    constructor(period, indexOrTime) {
        this.period = period instanceof Period ? period : new Period(period);
        this.index = indexOrTime instanceof Date ? Math.trunc(indexOrTime.valueOf() / 1000 / this.period.tf.sec) : indexOrTime;
    }
    next() { return new PeriodSpan(this.period, this.index + 1); }
    prev() { return new PeriodSpan(this.period, this.index - 1); }
    get startTime() { return Period.StartTimeForIndex(this.period.tf, this.index); }
    get endTime() { return Period.StartTimeForIndex(this.period.tf, this.index + 1).ToShiftedMsTime(-1); }
}
//---------------------------------
//interface MMM { (zzz?: number): any[]; }
export class Period {
    //fff() { Array(0); }
    constructor(tf) { this.tf = tf; return new Proxy(this, lib.ArrayItemHandler((obj, i) => new PeriodSpan(obj.tf, i))); }
    get sec() { return this.tf.sec; }
    get msec() { return this.tf.msec; }
    get name() { return this.tf.name; }
    valueOf() { return this.msec; }
    span(time) { return new PeriodSpan(this.tf, time); }
    static Seconds(tf) { return tf.sec; }
    static Name(tf) { return tf.name; }
    static StartTimeForIndex(tf, index) { let tfmsec = Period.Seconds(tf) * 1000; return new MyDate(index * tfmsec); }
    static StartTime(tf, currentTime) { let tfmsec = Period.Seconds(tf) * 1000; return new MyDate(Math.floor(currentTime.valueOf() / tfmsec) * tfmsec); }
    static EndTime(tf, currentTime) { return Period.StartTime(tf, currentTime).ToShiftedMsTime(tf.sec * 1000 - 1); }
}
function str2(n) { return n <= 9 ? '0' + n : '' + n; }
function str3(n) { return (n <= 9 ? '00' : n <= 99 ? '0' : '') + n; }
export function timeToStr_hhmmss_ms(date) { return str2(date.getUTCHours()) + ":" + str2(date.getUTCMinutes()) + ":" + str2(date.getUTCSeconds()) + "." + str3(date.getUTCMilliseconds()); }
export function timeToStr_hhmmss(date) { return str2(date.getUTCHours()) + ":" + str2(date.getUTCMinutes()) + ":" + str2(date.getUTCSeconds()); }
export function timeToStr_yyyymmdd_hhmm(date) { return date.getUTCFullYear() + "-" + str2(date.getUTCMonth() + 1) + "-" + str2(date.getUTCDate()) + " " + str2(date.getUTCHours()) + ":" + str2(date.getUTCMinutes()); }
export function timeToStr_yyyymmdd_hhmmss(date) { return timeToStr_yyyymmdd_hhmm(date) + ":" + str2(date.getUTCSeconds()); }
export function timeToStr_yyyymmdd_hhmmss_ms(date) { return timeToStr_yyyymmdd_hhmmss(date) + "." + str3(date.getUTCMilliseconds()); }
export function timeLocalToStr_yyyymmdd_hhmm(date) { return date.getFullYear() + "-" + str2(date.getMonth() + 1) + "-" + str2(date.getDate()) + " " + str2(date.getHours()) + ":" + str2(date.getMinutes()); }
export function timeLocalToStr_yyyymmdd_hhmmss(date) { return timeLocalToStr_yyyymmdd_hhmm(date) + ":" + str2(date.getSeconds()); }
export function timeLocalToStr_yyyymmdd_hhmmss_ms(date) { return timeLocalToStr_yyyymmdd_hhmmss(date) + "." + str3(date.getMilliseconds()); }
Date.prototype.toString = function () { let offset = this.getTimezoneOffset(); return timeLocalToStr_yyyymmdd_hhmmss(this) + " GMT" + (offset < 0 ? '+' : '') + (-offset / 60); }; //" GMT+0300 " +
//console.log(TF.all);
//console.log(TF.get("H6"));
export function durationToStr(duration_ms) {
    if (duration_ms == null)
        return null;
    let units = [[D1_MS, "д"], [H1_MS, "ч"], [M1_MS, "м"], [1000, "c"], [1, "мс"]];
    let lastUnit = null; //let passedDuration=0;
    let str = "";
    for (let unit of units) {
        let unitCountFloat = duration_ms / unit[0];
        if (unitCountFloat < 1.1 && lastUnit == null)
            continue;
        let unitCount;
        if (lastUnit || unitCountFloat > 10) {
            unitCount = Math.round(unitCountFloat);
            lastUnit = unit;
        }
        else
            unitCount = Math.floor(unitCountFloat);
        str += unitCount + unit[1] + " "; //passedDuration += unitCount * unit[0];
        if (lastUnit)
            break;
        duration_ms %= unit[0];
        lastUnit = unit;
    }
    return str;
    //let unit= period > Time.D1_MS*2 ?  Time.TIME_UNIT.Day :  period > Time.H1_MS*2 ?  Time.TIME_UNIT.Hour :  period>Time.M1_MS*2 ? Time.TIME_UNIT.Minute :
}
export function durationToStr_h_mm_ss(duration_ms) {
    let time = new Date(duration_ms);
    return Math.trunc(duration_ms / H1_MS) + ":" + str2(time.getUTCMinutes()) + ":" + str2(time.getUTCSeconds());
}
export function durationToStr_h_mm_ss_ms(duration_ms) { return durationToStr_h_mm_ss(duration_ms) + "." + str3(Math.trunc(duration_ms % 1000)); }
async function sleepAsync(msec) {
    return new Promise((resolve, reject) => { setTimeout(resolve, msec); });
}
// Задерживатель времени
export class CDelayer {
    constructor() {
        this.remainPause = 0;
    }
    async sleepAsync(pause_ms_getter) {
        let passed_ms = 0;
        let startRemainPause = this.remainPause;
        while (true) {
            let pause = pause_ms_getter();
            if (pause == null || pause < 0)
                return;
            this.remainPause = Math.max(startRemainPause + pause - passed_ms, 0);
            pause = Math.min(this.remainPause, 100);
            //break;
            if (pause > 15) {
                let oldTime = Date.now();
                await sleepAsync(pause);
                let duration = Date.now() - oldTime;
                passed_ms += duration;
                this.remainPause -= duration;
            }
            else
                break;
        }
    }
}
