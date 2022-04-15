import * as lib from "./Common.js";
import { TF } from "./Time.js";
import { ArrayItemHandler } from "./Common.js";
class Base {
}
export class ValueInfo extends Base {
    static isCorrect(info) { return (info.min == null || info.max == null || info.min <= info.max) && (info.step == null || info.step > 0); }
    static isCorrectValue(value, info) {
        return !isNaN(value) && (info.min == null || value >= info.min) && (info.max == null || value <= info.max)
            && (!info.step || Math.abs(Math.round(value / info.step) - value / info.step) < 0.0001); // Math.pow(0.1, lib.GetDblPrecision(step)+8))
    }
}
export class ValueEnum extends Base {
}
export class ParamType extends Base {
    valueToString(value) { return this.isCorrectValue(value) ? this._valueToString(value) : null; }
    stringToValue(string) { return this.isCorrectValue(string) ? this._stringToValue(string) : null; }
    isCorrectValue(valueOrString) {
        if (typeof valueOrString == "string")
            if (this.stringToValue(valueOrString) == null)
                return false;
        let info = this.valuesInfo;
        let value = +valueOrString;
        let enums = info.values;
        if (enums)
            return enums.includes(value);
        return ValueInfo.isCorrectValue(value, info);
    }
}
export class ParamType_Numeric extends ParamType {
    constructor(info) { super(); if (info instanceof ValueInfo)
        console.assert(ValueInfo.isCorrect(info)); this.valuesInfo = info; }
    _valueToString(value) { return value.toString(); }
    _stringToValue(string) {
        let step = this.valuesInfo.step;
        let val = step && step == Math.round(step) ? Number.parseInt(string) : Number.parseFloat(string);
        return !isNaN(val) ? val : null;
    }
}
export class ParamType_Bool extends ParamType {
    constructor() {
        super(...arguments);
        this.valuesInfo = { min: 0, max: 1, step: 1 };
    }
    _valueToString(value) { return value == 1 ? "true" : value == 0 ? "false" : null; }
    _stringToValue(string) { return (string == "true" || string == "1") ? 1 : (string == "false" || string == "0") ? 0 : null; }
}
class ParamType_Period extends ParamType {
    constructor() {
        super(...arguments);
        this.valuesInfo = { min: 1, step: 1, progressive: true };
    }
    isCorrectValue(valueOrString) { return Number.isInteger(+valueOrString) && +valueOrString > 1; }
    _valueToString(value) { return value.toString(); }
    _stringToValue(string) { return +string; }
}
export class ParamType_Time extends ParamType {
    constructor() {
        super(...arguments);
        this.valuesInfo = { min: 0, step: 1 }; //: ParamType["valuesInfo"]|null = null;
        //constructor() { }
    }
    _valueToString(value) { return new Date(value).toUTCString(); }
    _stringToValue(string) { return new Date(string).valueOf(); }
}
export class ParamType_TimeOfDay extends ParamType {
    constructor() {
        super(...arguments);
        this.valuesInfo = { min: 0, max: TF.D1.msec - 1, step: 1 };
    }
    _valueToString(value) { return new Date(value).toTimeString(); }
    _stringToValue(string) { return new Date(string).valueOf() % TF.D1.msec; }
}
export const paramType_Period = new ParamType_Period; // период (напр. период скользящей средней)
export const paramType_Time = new ParamType_Time; // время (вместе с датой)
export const paramType_TimeOfDay = new ParamType_TimeOfDay; // время дня
export const paramType_Bool = new ParamType_Bool;
export class ParamInfo {
}
/*
class ParamInfo extends Base {
    name : string;
    min : number;
    max : number;
    step : number;
    progressive? : boolean;
    values : [number]; //get values() : [number] { }
    //constructor(name, min)
}
*/
// function Param(name :string,  info :{ min :number, max :number, step :number, progressive? :boolean}) : ParamInfo {
// 	return {name: name,  type: new ParamType_Numeric(info) };//, name: name }; //{ name: name, min: info.min, max :info.max};
// }
export function Param(name, info, defaultValue, defaultRange) {
    var _a;
    let isStatic = (_a = defaultRange) === null || _a === void 0 ? void 0 : _a.static;
    let defRange = defaultRange;
    if ((defRange === null || defRange === void 0 ? void 0 : defRange.start) == null || (defRange === null || defRange === void 0 ? void 0 : defRange.end) == null)
        defRange = undefined;
    let defValue = defaultValue != null ? Number(defaultValue) : undefined;
    return { name, type: (info instanceof ParamType) ? info : new ParamType_Numeric(info), defaultValue: defValue, defaultRange: defRange, static: isStatic }; //, name: name }; //{ name: name, min: info.min, max :info.max};
}
export class CParamStepper {
    constructor(start, end, step) {
        if (!step)
            step = 1;
        this.start = +start;
        this.end = +end;
        this.step = +step; //[ this.start, this.end, this.step ] = { start, end, step };
        //let start= this.start, end= this.end, step= this.step;
        let toStr = () => "start=" + start + "  end=" + end + "  step=" + step;
        if ((end - start) / step < 0)
            throw "Wrong values: " + toStr();
        //if (Math.abs(start - step*Math.round(start/step)) > 0.00000001) throw "Wrong values: "+toStr();
        //if (Math.abs(end - step*Math.round(end/step)) > 0.00000001) throw "Wrong values: "+toStr();
        this.length = Math.round((end - start) / step + 1);
        return new Proxy(this, ArrayItemHandler((obj, i) => obj.start + i * obj.step));
    }
    [Symbol.iterator]() {
        let i = -1;
        let total = this.length; //(this.end - this.start) / this.step + 1;
        let obj = this;
        //let value= obj.start - obj.step;
        return {
            next() {
                //value += obj.step;
                i++;
                let val = obj.start + i * obj.step; //Math.round(value / obj.step) * obj.step;
                if (i < total) {
                    return { value: val, done: false };
                }
                return { value: 0, done: true };
            }
        };
    }
}
export var E_MATCH_END;
(function (E_MATCH_END) {
    E_MATCH_END[E_MATCH_END["LESS_OR_EXACT"] = 10] = "LESS_OR_EXACT";
    E_MATCH_END[E_MATCH_END["GREAT_OR_EXACT"] = 11] = "GREAT_OR_EXACT";
    E_MATCH_END[E_MATCH_END["PREV_OR_EXACT"] = 12] = "PREV_OR_EXACT";
    E_MATCH_END[E_MATCH_END["NEXT_OR_EXACT"] = 13] = "NEXT_OR_EXACT";
    E_MATCH_END[E_MATCH_END["EXACT"] = 14] = "EXACT";
    E_MATCH_END[E_MATCH_END["CLOSER"] = 15] = "CLOSER";
    E_MATCH_END[E_MATCH_END["FIT"] = 16] = "FIT";
})(E_MATCH_END || (E_MATCH_END = {}));
;
function Print(...args) { console.log(args); }
//--------- Создание ряда значений по заданном диапазону, шагу и коэффициенту прогрессии шага ------------------------------------------------------------
export function CreateUniqueValues_start_end_step_stepX_endMatch(startvalue, endvalue, step, stepX, endMatch, throwOnError = false) {
    if (step == 0)
        return [startvalue];
    let values = [];
    if (stepX == 0)
        stepX = 1;
    if (stepX < 1) {
        console.error("Некорректный stepX:", stepX);
        if (throwOnError)
            throw ("Некорректный коэф.прогрессии");
        return null;
    }
    let ranges = (endvalue - startvalue) / step;
    if (ranges < 0) {
        console.error("Некорректные параметры: startvalue=" + startvalue, "endvalue=" + endvalue, "step=" + step);
        if (throwOnError)
            throw ("Некорректные параметры");
        return null;
    }
    let count = Math.ceil(ranges) + 1;
    if (count == 0)
        return [];
    let positive = step > 0;
    let step0 = step;
    let digits = lib.GetDblPrecision(step0, 9);
    if (digits < 9 && stepX > 1 && lib.MaxCommonDivisor(startvalue, step, digits) < step) {
        console.error("Некратные значения: startvalue=" + startvalue, "step=" + step);
        if (throwOnError)
            throw ("Некратные значения: " + startvalue + " " + step);
        return null;
    }
    values.length = count + 1; // с запасом
    let value = startvalue;
    let i;
    for (i = 0;; i++) {
        if (digits < 9)
            value = lib.NormalizeDouble(value, 8);
        values[i] = value;
        if (positive ? value >= endvalue : value <= endvalue)
            break;
        step *= stepX;
        if (i > 0 && value == values[i - 1])
            i--; //if (positive ? step>0.5 : step<-0.5)  i--;  else { i--;  break; }
        value += step;
        if (stepX > 1)
            value = Math.round(value / step0) * step0;
    }
    //Alert(i);
    if (endMatch == E_MATCH_END.PREV_OR_EXACT)
        endMatch = positive ? E_MATCH_END.GREAT_OR_EXACT : E_MATCH_END.LESS_OR_EXACT;
    else if (endMatch == E_MATCH_END.NEXT_OR_EXACT)
        endMatch = positive ? E_MATCH_END.LESS_OR_EXACT : E_MATCH_END.GREAT_OR_EXACT;
    switch (endMatch) {
        case E_MATCH_END.GREAT_OR_EXACT:
            if (value < endvalue)
                i = -1;
            break;
        case E_MATCH_END.LESS_OR_EXACT:
            if (value > endvalue)
                i--;
            break;
        case E_MATCH_END.FIT:
        case E_MATCH_END.CLOSER:
            if (positive ? value > endvalue : endvalue < value) {
                if (Math.abs(value - endvalue) > Math.abs(values[i - 1] - endvalue))
                    i--;
                else if (endMatch == E_MATCH_END.FIT)
                    values[i] = endvalue;
                break;
            } // Иначе переходим к EXACT
        case E_MATCH_END.EXACT:
            if (value != endvalue)
                i = -1;
            break;
        default:
            console.error("Некорректное значение endMatch=" + endMatch);
            i = -1;
            if (throwOnError)
                throw ("Некорректное значение endMatch=" + endMatch);
    }
    ;
    values.length = i + 1;
    if (i != -1)
        i++;
    return values;
}
//
// let ppp= [
//
// Param("start balance", {min: 1, step: 1, progressive: true }, 100, {start: 100, end: 1000000, static: true}),
// 	Param("минимальный шаг, %", {min:0, max:90, step: 0.5, progressive: true }, 10),
// 	//Param("минимальный шаг, % ATR D2", {min:0, max:1000, step: 0.01}, 0),
// 	Param("степень",{min:0.5, max:2, step: 0.5}, 1),
// 	Param("ATR_bars",{min:0, step: 1, progressive: true}, 0, {start: 0, end: 100} ),
// ];
//
//
// import type {IParams, IParam2, IParamNum} from "../and/CParams"
//
//
// function ConvertParamAny(name: string, val : IParam2|IParam2[]|number|number[]|string|string[]) : ParamInfo[] {
//
// }
//
// function nameFromPath(path :readonly (string|number)[]) { return path.join(" -> "); }
//
// //class CPath extends Array<string|number> { toString() { return this.join(" ->"); } }
// class CPath {
// 	private _keyPath = new Array<string|number>();
// 	private _namePath = new Array<string|number>();
// 	toString() { return this._namePath.join("->"); }
// 	concat1(key :string|number) { return this.concat2(key, key); }
// 	concat2(key : string|number, name: string|number) { let obj= new CPath;  obj._keyPath= this._keyPath.concat(key);  obj._namePath= this._namePath.concat(name);  return obj; }
// }
//
//
// function* ConvertParam(val : IParam2, path :CPath) : Generator<[ParamInfo, (string|number)[], ((testerVal:number)=>(number|string))?]> {
// 	function create(info :ParamInfo, key? :string|number, convertFunc? :((testerVal:number)=>(number|string))) {
// 		info.name= path.
// 		path= path.concat2(key ?? info.name, info.name);
// 		return [info, path.concat(suffix ?? [...[]]), convertFunc];
// 	}
// 	if (typeof val=="boolean") return create(Param(path+"", paramType_Bool, val));
// 	let zzz : keyof IParamNum;
// 	let params : ParamInfo[] = [];
// 	if (typeof val=="object") {
// 		if (val.enabled!=null)
// 			yield [Param(path+" Enable", paramType_Bool, val.enabled), path.concat("enabled")];
// 		if (val instanceof Array) {
// 			for(let [i, item] of val.entries())
// 				yield* ConvertParam(item, path.concat(i));
// 			return params;
// 		}
// 		let name= val.name;
// 		let value= val.value;
// 		if (typeof value=="boolean") return [Param(path.concat(name ?? key)+"", paramType_Bool, value), path];
// 		//let func : ((testerVal:number)=>(number|string))|undefined;
// 		//let range= val.range;
// 		//if (val.range instanceof Array) { range= { min: 0, max: val.range.length-1, step: 1};  func= (testerVal :number)=> (val.range as Array<any>)[testerVal]; }
// 		let range= val.range instanceof Array ? { min: 0, max: val.range.length-1, step: 1} : val.range;
// 		let func = val.range instanceof Array ? (testerVal :number)=> (val.range as Array<any>)[testerVal] : undefined;
// 		if (typeof value=="number") return [Param(key, range!, value)];
// 		if (value instanceof Array)
// 			for(let [i, item] of value.entries())
// 				if (typeof item=="object")
// 					yield [ConvertParam(key+"."+)]
// 				params.push(Param(key+" #"+i, range, item));
//
// 		return ConvertParam(key, val.value);
// 		//let value= val.value;
// 		if (typeof value=="boolean") return
// 	}
// }
//
//
//
// // zig = { name: "Зигзаги", value: {zig1: true, zig2: true, zig3: true, zig4: true, zig5: true, zig6: true } };
// //
// // fibo = { name: "Fibo", value: new CParamFibo(), enabled: true };
// //
// // twoBars= {
// // 	name: "2 bars",
// // 	value: {
// // 		//коэфициенты для рассчета горизонтальных линий относительно текущего зигзага
// // 		koefStart: { value: 0.0, range: { min:0, max:1, step:0.01 } },
// // 		koefEnd: { value: 0.22, range: { min:0, max:1, step:0.01 } },
// // 		//количество секций участвующих в расчете горизонтальных линий
// // 		kolZigToLinec: { value: 3, range: {min: 2, max: 10, step: 1} }
// // 	},
//
// function ConvertParams(srcParams : IParams) {
// 	let params : unknown[] = [];
// 	for(let key in srcParams) {
// 		let param= ConvertParam(key, srcParams[key]);
// 		params.push(param);
// 	}
// }
