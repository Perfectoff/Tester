export class CIndicator {
}
export class CMA extends CIndicator {
    constructor(period, weighing = false) {
        super();
        this._array = [];
        this._sum = 0;
        this.period = period;
        console.assert(period > 0, "wrong MA period: " + period);
        this.name = "MA (" + period + ")";
        if (weighing) {
            this._sumWeight = (1 + period) * period / 2;
            this.name = "W" + this.name;
        }
        else
            this._sumWeight = period;
        this._weighing = weighing;
    }
    push(value) {
        this._array.push(value);
        let [period, length] = [this.period, this._array.length];
        if (!this._weighing) {
            if (!this._sum)
                this._sum = 0;
            this._sum += value;
            if (length > period)
                this._sum -= this._array[length - period - 1];
        }
        else
            this._sum = undefined;
        if (length == period + 1000)
            this._array.splice(0, 1000);
    }
    _getSum() {
        if (this._sum != null)
            return this._sum;
        let sum = 0;
        for (let n = 1, i = this._array.length - this.period; n <= this.period; n++, i++) {
            sum += this._array[i] * n; // this._array.reduce((prev,curr,index)=>prev+index*curr, 0)}
            //console.log("n="+n,"i="+i,"value=",this._array[i],"sum="+sum)
        }
        //console.log("Sum/SumWeight=",sum/this._sumWeight);
        //console.assert(false);
        return this._sum = sum;
    }
    value() { return this._array.length >= this.period ? this._getSum() / this._sumWeight : null; }
}
export class CATR extends CIndicator {
    // isRelative - вычисление относительного ATR, иначе абсолютного
    constructor(period, isRelative = false) { super(); this.ma = new CMA(period); this.name = "ATR (" + period + ")"; this.isRelative = isRelative; }
    push(bar) {
        var _a;
        let lastClose = (_a = this.lastClose) !== null && _a !== void 0 ? _a : bar.open;
        let delta = Math.max(bar.high, lastClose) - Math.min(bar.low, lastClose);
        if (this.isRelative) {
            console.assert(lastClose != 0);
            delta = delta / lastClose;
        }
        this.ma.push(delta);
        this.lastClose = bar.close;
    }
    value() { var _a; return (_a = this.ma.value()) !== null && _a !== void 0 ? _a : 0; }
}
