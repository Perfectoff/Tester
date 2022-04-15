//if (0) console.log();
//import 'source-map-support/register.js';
/*
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install({
    hookRequire: true,
    //handleUncaughtExceptions: true
    environment: 'node'
});
*/
//declare function require(name: string);
//require('source-map-support').install();
//"module" : "ES6"
//jjk
//lkp
//-r source-map-support/register
//--loader ts-node/esm.mjs
//Object.prototype.valueOf = () => { console.trace(); throw ("function 'valueOf' is not defined!!!"); };
//delete Object.valueOf;
//export function hi() { }
// Проверка ошибки:
//class A { val; private valueOfs() { return this.val; }  constructor(value) { this.val= value; } }
//console.log(new A(1) > new A(0));
export async function sleepAsync(msec) {
    return new Promise((resolve, reject) => { setTimeout(resolve, msec); });
}
export class CBase {
} //protected valueOf() { } }
//export function dynamic_cast<T>(object, type?: {new(...args: any[]):T}, ) : T  { return (object instanceof new type)  ? (object as T)  : null; }
export function GetEnumKeys(T) { return Object.keys(T).filter(k => isNaN(k)); }
export function GetEnumValues(T) { let arr = []; for (let k of Object.keys(T))
    if (isNaN(k))
        arr.push(T[k]); return arr; }
//function GetEnumValueToKeyMap(T) : readonly any[] { let arr : any[] =[];  for(let k of Object.keys(T)) return GetEnumKeys(T).map( (key)=> [T[key], key]); }
/*
enum E { A, B , C, D="VALUE"};

if (0)
    for(let a of GetEnumKeys(E))
        console.log(a); //E[C]); //a," -> ",typeof E[a]);
if (0)
    for(let a of GetEnumValues(E))
        console.log(a); //E[C]); //a," -> ",typeof E[a]);
//function GetEnumKeys(type) { const keys = Object.keys(type).filter(k => typeof type[k as any] in {number:0,string:1});  return keys;  }
*/
export var E_SORTMODE;
(function (E_SORTMODE) {
    E_SORTMODE[E_SORTMODE["DESCEND"] = 0] = "DESCEND";
    E_SORTMODE[E_SORTMODE["ASCEND"] = 1] = "ASCEND";
})(E_SORTMODE || (E_SORTMODE = {}));
;
export var E_MATCH;
(function (E_MATCH) {
    E_MATCH[E_MATCH["LESS_OR_EQUAL"] = -1] = "LESS_OR_EQUAL";
    E_MATCH[E_MATCH["EQUAL"] = 0] = "EQUAL";
    E_MATCH[E_MATCH["GREAT_OR_EQUAL"] = 1] = "GREAT_OR_EQUAL";
})(E_MATCH || (E_MATCH = {}));
/**
 * Бинарный поиск: <br>
 * BSearch(array, value, match, sortMode)  или <br>
 * BSearch(array, value, comparer, match, sortMode)
 */
export function BSearch(array, value, arg3, ...args) {
    return typeof arg3 == typeof array[0] ? BSearchDefault(array, value, ...args) : __BSearch(array, value, arg3, ...args);
}
// Бинарный поиск  BSearchDefault(array, value, match, mode)
//
export function BSearchDefault(array, value, match, mode) {
    return __BSearch(array, value, (a, b) => Math.sign(a.valueOf() - b.valueOf()), match, mode);
}
// Бинарный поиск  BSearch(array, value, comparer, match, mode)
//
function __BSearch(array, value, comparer, match, mode) {
    let k = (mode === E_SORTMODE.DESCEND ? -1 : 1);
    let start = 0;
    let count = array.length;
    let end = start + count - 1;
    let left = start;
    let right = end;
    let i = left;
    while (left <= right) {
        i = (left + right) >> 1;
        let cmp = comparer(array[i], value) * k;
        if (cmp > 0) {
            right = i - 1;
            continue;
        }
        if (cmp < 0) {
            left = i + 1;
            continue;
        }
        return i;
    }
    if (match == E_MATCH.LESS_OR_EQUAL) {
        i = right;
        if (i < start)
            i = -1;
    } // if (i < start) i=-1; }
    else if (match == E_MATCH.GREAT_OR_EQUAL) {
        i = left;
        if (i > end)
            i = -1;
    } //  if (i > end) i=-1; }
    else
        i = -1;
    return i;
}
BSearch.EQUAL = E_MATCH.EQUAL;
BSearch.LESS_OR_EQUAL = E_MATCH.LESS_OR_EQUAL;
BSearch.GREAT_OR_EQUAL = E_MATCH.GREAT_OR_EQUAL;
//export function MathMin<T extends { valueOf() : number}> (a :T,  b :T)  { let x= a.valueOf(), y= b.valueOf();  return x }
export function NormalizeDouble(value, digits) { let factor = 10 ** digits; return Math.round(value * factor) / factor; }
function fabs(value) { return Math.abs(value); }
function round(value) { return Math.round(value); }
function __GetMaxCommonDivisor(a, b, digits) {
    let precis = 0.1 ** (digits) / 2;
    while (true) { //b= NormalizeDouble(b, digits);
        if (b < precis)
            return NormalizeDouble(a, digits); // b= NormalizeDouble(b, digits);  if (b==0) return a;
        a = fabs(a - round(a / b) * b); //a= NormalizeDouble(a, digits);
        if (a < precis)
            return NormalizeDouble(b, digits);
        b = fabs(b - round(b / a) * a);
    }
}
function __GetMaxCommonDivisorInteger(a, b) {
    while (true) {
        if (b < 1)
            return a;
        a = a % b;
        if (a < 1)
            return b;
        b = b % a;
    }
}
/** Наибольший общий делитель двух чисел
*/
export function MaxCommonDivisor(a, b, digits = 8) {
    if (a == undefined || b == undefined) {
        console.trace();
        throw ("!!! Undefined value in MaxCommonDivisor");
    } // console.trace(); }//  return undefined; }
    a = fabs(a);
    b = fabs(b);
    if (Number.isInteger(a) && Number.isInteger(b))
        if (a > b)
            return __GetMaxCommonDivisorInteger(a, b);
        else
            return __GetMaxCommonDivisorInteger(b, a);
    if (a > b)
        return __GetMaxCommonDivisor(a, b, digits);
    else
        return __GetMaxCommonDivisor(b, a, digits);
}
//console.log(MaxCommonDivisor(0, 301.84, 1));
/** Наибольший общий делитель массива чисел
 */
export function MaxCommonDivisorOnArray(values, precisDigits = 8) {
    let divis = 0;
    for (let value of values) //let i=0;  i<values.length;  i++)
        divis = MaxCommonDivisor(value, divis, precisDigits);
    return divis;
}
/** Определение точности числа (число цифр после запятой)
 * @param value
 * @param mindigits - Минимальная точность
 * @param maxdigits - Максимальная точность
 */
function GetDblPrecision2(value, mindigits, maxdigits) {
    maxdigits = Math.min(maxdigits, 16);
    let epsilon = Math.pow(0.1, maxdigits);
    let d;
    for (d = mindigits; d < maxdigits; d++)
        if (fabs(value - NormalizeDouble(value, d)) < epsilon)
            break;
    if (d < 0 || d >= 100)
        alert(value + "  " + mindigits + "  " + maxdigits);
    return d;
}
;
/** Определение точности числа (число цифр после запятой)
 * @param value
 * @param maxdigits - Максимальная точность
 */
export function GetDblPrecision(value, maxdigits = 8) { return GetDblPrecision2(value, 0, maxdigits); }
//-------------------------------------------------------
/** Преобразование числа в стринг с автоматической точностью
 * @param value
 * @param minprecis - Минимальная точность (число цифр после запятой)
 * @param maxprecis - Максимальная точность (число цифр после запятой)
 */
function DblToStrAuto2(value, minprecis, maxprecis) { return value === null || value === void 0 ? void 0 : value.toFixed(GetDblPrecision2(value, minprecis, maxprecis)); }
/** Преобразование числа в стринг с автоматической точностью
 * @param value
 * @param maxprecis - Максимальная точность (число цифр после запятой)
 */
export function DblToStrAuto(value, maxprecis = 8) {
    let digits = maxprecis;
    if (digits < 0)
        if (value != 0)
            maxprecis = Math.trunc(Math.max(0, -digits - Math.log10(fabs(value))));
        else
            maxprecis = 0;
    return DblToStrAuto2(value, 0, maxprecis);
}
export function ArrayItemHandler(getter, setter) {
    return {
        get: function (target, prop) {
            //console.log("! ", prop);
            if (prop in target) {
                return target[prop];
            }
            //let num= Number.parseInt(prop);
            //if (num!=undefined && !isNaN(prop)) return getter(target, prop);  // значение по индексу
            let num = typeof prop == "number" ? prop : typeof (prop) == "string" ? Number.parseInt(prop) : undefined;
            if (num != undefined && !isNaN(num))
                return getter(target, prop);
            //if (Number.isSafeInteger(prop)) return getter(target, prop);
            //console.error("!! ArrayItemHandler:  unknown property for get: ", prop);
            return target[prop];
        },
        set: !setter ? undefined :
            function (target, prop, value, receiver) {
                //console.log("! ", prop);
                if (prop in target) {
                    target[prop] = value;
                    return true;
                }
                let num = typeof (prop) == "number" ? prop : typeof (prop) == "string" ? Number.parseInt(prop) : undefined;
                //console.log(prop);
                //let num= Number.parseInt(prop);
                if (num != undefined && !isNaN(num)) {
                    let ok = setter(target, prop, value);
                    if (ok == undefined)
                        ok = true;
                    return ok;
                } // значение по индексу
                //if (Number.isSafeInteger(prop)) { let ok= setter(target, prop, value);  if (ok==undefined) ok=true;  return ok as boolean; }
                //let z : T;
                //console.error(`!! ArrayItemHandler:  unknown property for set: `, prop);
                //console.trace(); //throw "error";
                target[prop] = value;
                return true;
            }
    };
}
//export function Min(...dates :Date[]) { return dates.length>=2 ? dates[0]<dates[1] ? dates[0] : dates[1]; }
//type Keyable<T> = { valueOf():number; }; //constructor(key :number) : T;
export class __MyMap {
    constructor() {
        this.map = {};
    }
    //protected strToKey(strKey) { return this.map[strKey].key; }
    createArrays() {
        let thisKeys = this.keys = [];
        let thisValues = this.values = [];
        for (let key of Object.keys(this.map))
            if (!isNaN(key)) {
                let pair = this.map[key];
                thisKeys.push(pair.key);
                thisValues.push(pair.value);
            }
    }
    OnModify(key) { }
    Set(key, value) { this.map[key.valueOf()] = { key, value }; this.keys = null; this.OnModify(key); } //this.pairs=null; }// this.keys= null;  this.values=null; }
    Get(key) { let pair = this.map[key.valueOf()]; return pair ? pair.value : undefined; }
    Contains(key) { return this.map[key.valueOf()] != undefined; }
    TryAdd(key, value) { if (!this.Contains(key))
        return false; this.Set(key, value); return true; }
    Add(key, value) { if (!this.TryAdd(key, value))
        throw `Key ${key} is already exists for ${typeof value}`; }
    Remove(key) { delete (this.map[key.valueOf()]); this.keys = null; this.OnModify(key); }
    Count() { return this.sortedKeys.length; }
    get sortedKeys() { if (!this.keys)
        this.createArrays(); return this.keys; } //{ this.keys=[]; for(let key in Object.keys(this.map)) if (!isNaN(key as any)) this.keys.push(this.strToKey(key));  return this.keys; }
    //get sortedKeys() :K[] { if (!this.keys) this.keys= Object.keys(this.map).filter((key)=>!isNaN(key as any)) as any[];  return this.keys; }
    get Values() { if (!this.keys)
        this.createArrays(); return this.values; } //{ this.values=[];  for(let key of this.sortedKeys) this.values.push(this.map[key.valueOf()].value); }  return this.values; }
}
//-------------------------------
export class MyMap extends __MyMap //(K extends {valueOf():number} ? lib.CBase : lib.CBase)
 {
    Clone() { let newobj = new MyMap(); newobj.map = Object.assign({}, this.map); newobj.keys = this.keys; newobj.values = this.values; return newobj; }
}
//------------------------
export class MyNumMap extends __MyMap {
    constructor() {
        super();
        let handler = ArrayItemHandler((obj, key) => obj.Get(key), (obj, key, value) => obj.Set(key, value));
        return new Proxy(this, handler);
    }
    Clone() { let newobj = new MyNumMap(); newobj.map = Object.assign({}, this.map); newobj.keys = this.keys; newobj.values = this.values; return newobj; }
}
;
export class ArrayMap {
    constructor() {
        this._data = {};
    }
    set(key, value) {
        if (!(key === null || key === void 0 ? void 0 : key.length))
            throw "passed empty array as key";
        let obj = this._data;
        for (let i = 0; i < key.length - 1; i++) { //item of key) {
            let item = key[i];
            let gotObj = obj[item];
            if (gotObj == null)
                gotObj = obj[item] = {};
            obj = gotObj;
        }
        obj[key[key.length - 1]] = value;
    }
    get(key) {
        if (key.length == 0)
            return null;
        let obj = this._data;
        for (let item of key) {
            obj = obj[item];
            if (!obj)
                return null;
        }
        return obj;
    }
}
/*
export abstract class CItemsWrap<T> implements IItems<T>
{
    readonly [i : number]: T;
    readonly length : number;
    [Symbol.iterator]() : Iterator<T>;
}
*/
export class VirtualItems {
    constructor(itemGetter, lengthGetter) {
        this.getLength = lengthGetter;
        this.getValue = itemGetter;
        return new Proxy(this, ArrayItemHandler((obj, i) => obj.getValue(i)));
    }
    get length() { return this.getLength(); }
    *[Symbol.iterator]() { let len = this.length; for (let i = 0; i < len; i++)
        yield this.getValue(i); }
}
export class CancelToken {
    constructor() {
        this._cancel = false;
        //static fromFunc(func : ()=>boolean)) : ICancelToken { return { isCancelled() { return }  }
    }
    isCancelled() { return this._cancel; }
    cancel() { this._cancel = true; }
}
export class CancelablePromise extends Promise {
    constructor(executor, onCancel) {
        super((resolve, reject) => { CancelablePromise._rejectTmp = reject; executor(resolve, reject); });
        this._reject = null;
        this._onCancel = null;
        this._reject = CancelablePromise._rejectTmp;
        this._onCancel = onCancel;
    }
    cancel(msg) { if (this._onCancel)
        this._onCancel(); return this._reject(msg); } //if (this.oncancel)
    static resolve(value) { return new CancelablePromise((resolve, reject) => Promise.resolve(value).then(resolve, reject)); }
}
// Таймер с проверкой условия (если OnTick возвращает ложь, то таймер останавливается (промис завершается с реджектом!)
export function createCancellableTimer(interval_ms, onTimer, onStop) {
    let timer;
    function stop() { clearInterval(timer); if (onStop)
        onStop(); }
    let executor = (resolve, reject) => {
        timer = setInterval(() => { if (onTimer() == false) {
            stop();
            reject("Stopped");
        } }, interval_ms);
    };
    return new CancelablePromise(executor, () => stop()); //.finally(()=>clearInterval(timer));
}
export class MyTimerInterval {
    constructor(period_ms, onTimer, onStop) { this._timer = setInterval(onTimer, period_ms); this._onstop = onStop; }
    stop() { clearInterval(this._timer); if (this._onstop)
        this._onstop(); }
}
export class Mutex {
    constructor() {
        this.mutex = Promise.resolve();
    }
    lock() {
        let begin = unlock => { };
        this.mutex = this.mutex.then(() => {
            return new Promise(begin);
        });
        return new Promise(res => {
            begin = res;
        });
    }
    async dispatch(fn) {
        const unlock = await this.lock();
        try {
            return await Promise.resolve(fn());
        }
        finally {
            unlock();
        }
    }
}
