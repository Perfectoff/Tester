import * as lib from "./Common.js";
import { E_MATCH, MyNumMap } from "./Common.js";
import { IBars, CBars, CBarsMutableBase, CBarsMutable, Period, TF } from "./Bars.js";
//import type {ParsedUrlQueryInputMy} from "./querystringMy";
export * from "./Bars.js";
/*
class CTick
{
    ask : number;
    bid : number;
    last : number;
}
*/
//function f(arg : MyMap<number, string>) { }
//f(new MyNumMap<string>());
//new MyMap<number, string>();
//----------------------------------------
class CBarsInternal extends CBarsMutableBase {
    //referred : boolean = false;
    constructor(tf, bars, tickSize = 0) {
        super(tf, bars, tickSize);
        this.Mutable = true; // private _isMutable : boolean; //get isMutable()         { return this._isMutable; } set isMutable(val : boolean) { this._isMutable= val; }
    }
    set data(bars) { this._data = bars; console.assert(bars != null); }
    get data() { return this._data; } // не убирать парный метод, иначе будет баг (get метод будет возвращать null)!
    set tickSize(value) { this._ticksize = value; }
    get tickSize() { var _a; return (_a = this._ticksize) !== null && _a !== void 0 ? _a : 0; } // не убирать парный метод, иначе будет баг (get метод будет возвращать null)!
    static newFrom(other) { return new CBarsInternal(other.Tf, other.data, other.tickSize); }
}
//-----------------------------
//class CBarsInfoMap extends MyNumMap<TBarsInfo>  { Bars(tf :TF) : IBars { return this[tf.index]} }
export class CQuotesHistory {
    constructor(Datas, name) {
        this._modifyCounter = 0;
        //protected barsMap : MyNumMap<IBars> = new MyNumMap();  //Map<number, CBars>;// : set<CBars>;//[];
        this.barsMainMap = new MyNumMap();
        this.barsInfoMap = new MyNumMap();
        //console.log(Datas.length);
        let datas = (Datas instanceof IBars ? [Datas] : Datas);
        let datasMy = []; // Заполняем иммутабельными элементами
        for (let bars of datas)
            if (bars)
                datasMy.push(bars.Mutable ? CBarsInternal.newFrom(bars) : bars);
        for (let bars of datasMy) {
            this.barsInfoMap[bars.Tf.index] = { bars: bars };
            this.barsMainMap[bars.Tf.index] = bars;
        } //this.barsMap[bars.Tf.index]= bars;   //if (this._minTf==null || bars.Tf<this._minTf) this._minTf= bars.Tf;
        //console.log("!!! ",this.barsInfoMap.Count()); //this.mainDatas);
        //this.barsMainMap= this.barsMap.Clone(); //[...datas];
        if (name)
            this.name = name;
    }
    _GetTickSize() { let val = 0; for (let bars of this.barsMainMap.Values)
        val = lib.MaxCommonDivisor(bars.tickSize, val); return val; }
    //toJSON() { return JSON.stringify(this.barsMainMap.Values);  }
    static fromParsedJSON(data) {
        let d = data;
        let map = Object.assign(new MyNumMap, Object.assign({}, d.barsMainMap)); //typeof d.barsMainMap;
        return new CQuotesHistory(map.Values.map((bars) => CBars.fromParsedJSON(bars)), d.name);
    }
    //readonly id :symbol = Symbol();
    get stateID() { return this._modifyCounter; } // Идентификатор состояния (счётчик модификаций объекта)
    get minTf() { if (!this._minTf)
        this._minTf = TF.min(...this.mainDatas.map(bars => bars.Tf)); return this._minTf; } //return this._minTf; };  // Минимальный таймфрейм
    get minTfBars() { return this.minTf ? this.Bars(this.minTf) : null; }
    get tickSize() { if (!this._ticksize)
        this._ticksize = this._GetTickSize(); return this._ticksize; } // Размер тика
    get mainDatas() { return this.barsMainMap.Values; } // Главные баровые таймсерии (создаваемые пользователем)
    get isMutable() { return false; }
    _OnModify(tf, startTime, endTime, toEnd) {
        var _a;
        let infos = this.barsInfoMap.Values;
        this._modifyCounter++;
        let modifyCount = this._modifyCounter;
        // Перебираем старшие таймфреймы и записываем инфу об изменениях, а также удаляем младшие таймфреймы
        for (let i = infos.length - 1; i >= 0; i--) {
            let info = infos[i];
            let barsTf = info.bars.Tf;
            if (barsTf > tf) // записываем инфу об изменениях в старший таймфрейм
                info.modifyInfo = {
                    time: ((a, b) => (!b || a < b ? a : b))(startTime, (_a = info.modifyInfo) === null || _a === void 0 ? void 0 : _a.time),
                    srcTf: tf,
                    id: modifyCount
                };
            else if (barsTf < tf && info.bars.count > 0) { // удаляем бары с младших таймфреймов
                //console.log(startTime, endTime); //barsTf.name);
                let [barsStartTime, barsEndTime] = toEnd ? [null, new Period(tf).span(startTime).prev().endTime] : [new Period(tf).span(endTime).next().startTime, null];
                if (!barsStartTime || barsStartTime <= info.bars.time(0))
                    if (!barsEndTime || barsEndTime >= info.bars.lastTime)
                        continue;
                let barsArr = info.bars.getArray(barsStartTime, barsEndTime);
                //console.log(new Period(tf).span(endTime).next().startTime);
                //console.log(barsArr);
                let bars = barsArr && barsArr.length > 0 ? new CBars(barsTf, barsArr, info.bars.tickSize) : undefined;
                if (bars) {
                    this.barsInfoMap[barsTf.index].bars = bars;
                    //this.barsMap[barsTf.index]= bars;
                    //console.log(this.barsInfoMap[barsTf.index].bars);
                    this.barsMainMap[barsTf.index] = bars;
                }
                else {
                    this.barsInfoMap.Remove(barsTf.index);
                    //this.barsMap.Remove(barsTf.index);
                    this.barsMainMap.Remove(barsTf.index);
                }
            }
        }
        this._ticksize = 0;
        //this._minTf= null;
        this._minTf = null; //TF.min(this._minTf, tf);
    }
    _AddBars(myBars, newBars, startTime, endtime) {
        //console.log(startTime, endtime);
        if (!newBars)
            return myBars;
        let ibar = myBars.indexOf(startTime, E_MATCH.GREAT_OR_EQUAL);
        if (ibar == -1)
            ibar = myBars.count;
        let newbars = (newBars instanceof Array) ? newBars : [newBars];
        let lastBars = [];
        if (endtime) {
            let ilast = myBars.indexOf(endtime, E_MATCH.LESS_OR_EQUAL) + 1;
            lastBars = myBars.data.slice(ilast, myBars.length);
        } //let ibarEnd= myBars.IndexOf(newbars[newbars.length-1].time, E_MATCH.LESS_OR_EQUAL);
        let resultBars; // //lib.dynamic_cast<CBarsInternal>(myBars);
        if (myBars instanceof CBarsInternal && myBars.Mutable)
            (resultBars = myBars).data.splice(ibar); // удаляем конечные бары, начиная с ibar
        else
            resultBars = new CBarsInternal(myBars.Tf, myBars.data.slice(0, ibar), myBars.tickSize); // копируем начальные бары
        //console.log(newbars.length, lastBars.length);
        //console.log(startTime, ibar);
        //resultBars.data.push(...newbars, ...lastBars); // приводит к переполнению стека
        resultBars.data = resultBars.data.concat(newBars, lastBars);
        return resultBars;
    }
    _CreateUpdatedBars(myBars, updatedBars, startTime) {
        startTime = Period.StartTime(myBars.Tf, startTime);
        let addedBarsArr = updatedBars.getArray(startTime);
        let addedBarsArrConverted = new CBars(updatedBars.Tf, addedBarsArr !== null && addedBarsArr !== void 0 ? addedBarsArr : []).toBarsArray(myBars.Tf);
        return this._AddBars(myBars, addedBarsArrConverted, startTime);
    }
    // Индекс ближайшего меньшего таймфрейма
    _getLessTf(tf) {
        //console.log("tfIndex="+tf?.index,  "indexes="+this.barsInfoMap.sortedKeys.join());
        let i = lib.BSearch(this.barsInfoMap.sortedKeys, tf.index - 1, E_MATCH.LESS_OR_EQUAL);
        return (i >= 0) ? TF.all[this.barsInfoMap.sortedKeys[i]] : null;
    }
    _BuildNewBars(tf) {
        // Находим ближайший меньший таймфрейм для построения    //, .findIndex((key)=> key > tf.index) - 1;
        let lessTf = this._getLessTf(tf);
        //console.log("!!! ",lib.BSearchDefault(this._barsInfoMap.sortedKeys, TF.H6.index-1, E_MATCH.LESS_OR_EQUAL);
        if (lessTf == null)
            return null;
        let info = this.barsInfoMap[lessTf.index];
        //console.log(this._barsInfoMap.sortedKeys);
        let bars = info.modifyInfo ? this._Bars(info.modifyInfo.srcTf) : info.bars;
        //let bars= this.barsMap[this.barsMap.sortedKeys[i]];
        let newbars = bars.toBarsArray(tf);
        if (!newbars) {
            console.log(`Failed to create bars ${tf.name} from ${bars.Tf.name}`);
            return null;
        }
        return new CBarsInternal(tf, newbars, this.tickSize);
    }
    _Bars(tf) { return this.barsInfoMap[tf.index].bars; }
    _GetBars(tf) {
        var _a;
        if (!tf)
            return null;
        let Info = this.barsInfoMap[tf.index];
        let updated = false;
        let bars;
        if (Info) {
            if (Info.modifyInfo) {
                //console.log("Info:\n",Info);
                // let srcTf= Info.modifyInfo.srcTf;
                // bars = this._CreateUpdatedBars(Info.bars, this._Bars(srcTf), Info.modifyInfo.time);
                let srcTf = this._getLessTf(tf);
                //console.log(tf.index,"   ",this.barsMainMap.sortedKeys);
                //console.log("Tfs:",this.mainDatas.map(bars=>bars.Tf.name));
                //console.log(srcTf);
                if (!srcTf)
                    return null;
                bars = this._CreateUpdatedBars(Info.bars, (_a = this._GetBars(srcTf)) !== null && _a !== void 0 ? _a : (() => { throw "null bars!"; })(), Info.modifyInfo.time);
                updated = true;
                //this.OnModify(tf, Info.modifyInfo.time, Info.modifyInfo.id);
                Info.modifyInfo = undefined;
                //console.log("Modified bars:\n",bars);
            }
            else
                bars = Info.bars;
        }
        else {
            bars = this._BuildNewBars(tf);
            if (!bars)
                return null;
            updated = true;
            Info = { bars: bars };
            this.barsInfoMap[tf.index] = Info;
            //this.OnModify(tf, Info.modifyInfo.time, Info.modifyInfo.id);
        }
        if (updated) {
            // Меняем у всех старших таймсерий модифицирующий таймфрейм на текущий (будем строить из него)
            for (let i = this.barsInfoMap.Values.length - 1; i >= 0; i--) {
                let info = this.barsInfoMap.Values[i];
                if (info.bars.Tf <= tf)
                    break;
                if (info.modifyInfo)
                    info.modifyInfo.srcTf = tf;
            }
        }
        if (bars != Info.bars) {
            Info.bars = bars;
            if (this.barsMainMap[tf.index])
                this.barsMainMap[tf.index] = bars;
        } //this.barsMap[tf.index] = bars;
        return bars;
    }
    //-----
    Bars(tf) {
        let bars = this._GetBars(tf);
        if (bars instanceof CBarsInternal)
            bars.Mutable = false; // Получена ссылка на объект
        return bars;
    }
}
//----------------------------------
export class CQuotesHistoryMutable extends CQuotesHistory {
    get isMutable() { return true; }
    constructor(name) {
        super([], name);
    }
    // Добавить бары в конец
    AddEndBars(bars, tf) { return this._AddBarsExt(bars, tf, true); }
    // Добавить бары в начало
    AddStartBars(bars, tf) { return this._AddBarsExt(bars, tf, false); }
    checkBars(bars, tf) {
        let period = new Period(tf);
        for (let i = 1; i < bars.length; i++)
            if (!bars[i]) {
                console.log("Отсутствует бар №" + i);
                return false;
            }
            else if (bars[i].time.valueOf() - bars[i - 1].time.valueOf() < tf.msec && period.span(bars[i].time).index <= period.span(bars[i - 1].time).index) {
                console.log("Некорректное время бара №" + i + ":", bars[i].time, "  Предыдущее время:", bars[i - 1].time);
                return false;
            }
        return true;
    }
    _AddBarsExt(Bars, tf, toEnd) {
        if (!Bars)
            return false;
        let bars = Bars instanceof IBars ? Bars.data : Bars instanceof Array ? Bars : [Bars];
        //console.log(Bars instanceof CBar);
        //let asBars = dynamic_cast<CBar[]>(bars);
        if (bars.length == 0)
            return true; //if (asBars && asBars.length==0) return;
        if (Bars instanceof IBars)
            tf = Bars.Tf;
        else if (!this.checkBars(bars, tf))
            return false;
        if (!tf)
            return false;
        //AddBarsFirst();
        //AddBarsLast()
        let oldBars0 = this._GetBars(tf);
        //console.log(new CBarsInternal(tf).data!=null);
        let oldBars = oldBars0 ? oldBars0 : new CBarsInternal(tf);
        let time = bars[0].time; //asBars ? asBars[0].time : (bars as CBar).time;
        let endtime = bars[bars.length - 1].time;
        if (oldBars.count > 0)
            if (!toEnd) {
                if (oldBars.time(0) < time)
                    time = oldBars.time(0);
            }
            else {
                if (oldBars.lastTime > endtime)
                    endtime = oldBars.lastTime;
            }
        //console.log(time, endtime);
        let resultBars = this._AddBars(oldBars, bars, time, endtime); //new CBarsInternal(tf, this.tickSize, (myBars ? myBars.data : []).concat(bars));
        //console.log("!",resultBars," finish");
        //return;
        if (!resultBars)
            return false;
        if (resultBars != oldBars0) {
            //this.barsMap[tf.index] = resultBars;
            this.barsInfoMap[tf.index] = { bars: resultBars }; //else this._barsInfoMap[tf.index].bars = resultBars;
        }
        this.barsMainMap[tf.index] = resultBars;
        this._OnModify(tf, time, endtime, toEnd);
        return true;
    }
    // Добавить тики в конец
    AddTicks(ticks) {
        if (!ticks || ticks.length == 0)
            return true;
        let time = ticks[0].time;
        let tf = TF.S1;
        let oldBars = this._GetBars(tf);
        let newbarsArr;
        if (oldBars && oldBars.count > 0 && Period.StartTime(tf, time) == oldBars.lastTime)
            newbarsArr = [oldBars.last];
        let newbars = new CBarsMutable(tf, newbarsArr); //oldBars.getArray(Period.StartTime(tf,time), ));
        if (!newbars.AddTicks(ticks))
            return false;
        return this.AddEndBars(newbars);
    }
}
;
//====================================
export class CQuotesHistoryMutable2 extends CQuotesHistory {
    constructor(name) {
        super([], name);
        this._sourceCounter = 0;
    }
    get tickSize() { var _a, _b; return (_b = (_a = this._source) === null || _a === void 0 ? void 0 : _a.tickSize) !== null && _b !== void 0 ? _b : 0; } //protected _GetTickSize() { return this._source.TickSize; }
    get minTf() { var _a, _b; return (_b = (_a = this._source) === null || _a === void 0 ? void 0 : _a.minTf) !== null && _b !== void 0 ? _b : null; }
    get isMutable() { return true; }
    _CreateNewBars(tf) {
        var _a;
        let srcBars = (_a = this._source) === null || _a === void 0 ? void 0 : _a.Bars(tf);
        if (!srcBars)
            return null;
        let istop = this._time ? srcBars.indexOf(this._time, E_MATCH.GREAT_OR_EQUAL) : srcBars.length;
        let slicedBars = srcBars.data.slice(0, istop); // Выбираем istop начальных баров
        return new CBarsInternal(tf, slicedBars);
    }
    // Присвоить бары с другого объекта
    Update(other, endTime) {
        let isUpdate = other == this._source && other.stateID == this._sourceCounter; // endTime>=this._time;
        //for(let bars of this.barsMap.Values) {
        for (let info of this.barsInfoMap.Values) {
            let bars = info.bars;
            let srcBars = other.Bars(bars.Tf);
            if (!srcBars)
                continue;
            let start = 0;
            if (isUpdate && (endTime && this._time ? endTime >= this._time : endTime == this._time))
                start = bars.data.length;
            let stop = endTime ? srcBars.indexOf(endTime, E_MATCH.GREAT_OR_EQUAL) : srcBars.length;
            let newbarsArr = srcBars.data.slice(start, stop);
            let resultbarsArr = start > 0 ? [...bars.data, ...newbarsArr] : newbarsArr;
            let resultBars = new CBars(bars.Tf, resultbarsArr, bars.tickSize);
            //this.barsMap[bars.Tf.index]= resultBars;
            info.bars = resultBars;
            if (this.barsMainMap[bars.Tf.index])
                this.barsMainMap[bars.Tf.index] = resultBars;
        } /*
        if (!isUpdate) {
            this._sourceId = other.id;
            this._minTf= other.minTf;
            this._ticksize= other.tickSize;
        }*/
        this._source = other;
        this._sourceCounter = other.stateID;
        this._time = endTime; //this.minTf= other.minTf;
        this._modifyCounter++;
    }
}
/*
class A {
  value : number;
  constructor(value) { this.value= value; }
}

class B
{
    private a : A;
    constructor(a : A) { this.a= a; }

    value() { return this.a.value; }
}
//function GetEnumKeys(T) : readonly string[] { return Object.keys(T).filter(k => typeof T[k as any] === "number"); }

function main()
{
    let a= new A(1);

    let b= new B(a);

    console.log(b.value());

    a.value= 2

    console.log(b.value());
}

main();
*/ 
