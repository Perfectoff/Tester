export class TradeStatistics {
    constructor(equityBars) {
        let length = equityBars.length;
        let maxDrawdown = 0;
        let maxDrawdownTime = undefined;
        let maxValue = Number.MIN_VALUE;
        let minValue = Number.MAX_VALUE;
        let minValueTime = undefined;
        let maxValueTime = undefined;
        let lastVolume = 0;
        let lastValue = 0;
        let lastTime = length > 0 ? equityBars[0].time : undefined;
        let nettoVolume = 0;
        let buyVolumes = 0, sellVolumes = 0;
        let buys = 0, sells = 0;
        //let trades = 0;
        let profitSqrtSum = 0;
        let sumVolumeDuration = 0;
        let comissions = 0;
        let i = -1;
        //alert(comissionPerSide.unit=="%");
        for (let bar of equityBars) {
            i++;
            if (bar.high >= maxValue) {
                maxValue = bar.high;
                maxValueTime = bar.time;
            } //maxValue= Math.max(bar.high, maxValue);
            if (bar.low <= minValue) {
                minValue = bar.low;
                minValueTime = bar.time;
            } //minValue= Math.min(bar.low, minValue);
            let drawdown = maxValue - bar.low;
            if (drawdown >= maxDrawdown) {
                maxDrawdown = drawdown;
                maxDrawdownTime = bar.time;
            } // maxDrawdawn= Math.max(maxValue - bar.low,  maxDrawdawn);
            let volume = bar.volume;
            if (volume > 0) {
                buyVolumes += volume;
                buys++;
            }
            else if (volume < 0) {
                sellVolumes += -volume;
                sells++;
            }
            //if (volume) trades++; //this.tradesCount++;
            let value = bar.close;
            profitSqrtSum += (value - lastValue) ** 2;
            lastValue = value;
            sumVolumeDuration += Math.abs(nettoVolume) * (bar.time.valueOf() - lastTime.valueOf());
            nettoVolume += volume;
            lastTime = bar.time;
            //if (comissions==0) alert(value+"  "+volume+"  "+comissionPerSide.value * Math.abs(volume) * (comissionPerSide.unit=="%" ? value/100 : 1));
            comissions += equityBars[i].comission; // comissionOnBars[i]; //comissionPerSide.value * Math.abs(volume) * (comissionPerSide.unit=="%" ? value/100 : 1);
        }
        let trades = buys + sells;
        let resultProfit = lastValue; //equityBars[length-1].close;
        this.resultProfit = resultProfit;
        this.maxProfit = maxValue != Number.MIN_VALUE ? maxValue : undefined;
        this.minProfit = minValue != Number.MAX_VALUE ? minValue : undefined;
        this.maxProfitTime = maxValueTime;
        this.minProfitTime = minValueTime;
        this.buyVolumes = buyVolumes;
        this.sellVolumes = sellVolumes;
        this.buys = buys;
        this.sells = sells;
        this.trades = trades;
        this.maxDrawdown = maxDrawdown;
        this.maxDrawdownTime = maxDrawdownTime;
        this.sharpCoef = profitSqrtSum ? resultProfit / Math.sqrt(profitSqrtSum) : undefined;
        this.recoveryFactor = maxDrawdown ? resultProfit / maxDrawdown : undefined;
        this.avrgProfitPerTrade = trades ? resultProfit / trades : undefined;
        this.avrgProfitPerVolume = this.totalVolumes ? resultProfit / this.totalVolumes : undefined;
        let holdedVolumes = this.totalVolumes - Math.abs(nettoVolume);
        this.avrgTradeDuration_ms = holdedVolumes ? sumVolumeDuration / holdedVolumes : 0;
        this.comissions = comissions; //this.totalVolumes * comissionPerSide;
    }
    get totalVolumes() { return this.buyVolumes + this.sellVolumes; }
    static getSharpCoef(equityBars) {
        let lastValue = 0;
        let profitSqrtSum = 0;
        for (let bar of equityBars) {
            let value = bar.close;
            profitSqrtSum += (value - lastValue) ** 2;
            lastValue = value;
        }
        let resultProfit = lastValue; //equityBars[length-1].close;
        return profitSqrtSum ? resultProfit / Math.sqrt(profitSqrtSum) : undefined;
    }
    static getRecoveryFactor(equityBars) {
        let maxDrawdown = 0;
        let maxValue = Number.MIN_VALUE;
        let lastValue = 0;
        for (let bar of equityBars) {
            if (bar.high >= maxValue) {
                maxValue = bar.high;
            }
            let drawdown = maxValue - bar.low;
            if (drawdown >= maxDrawdown) {
                maxDrawdown = drawdown;
            }
            lastValue = bar.close;
        }
        let resultProfit = lastValue; //equityBars[length-1].close;
        return maxDrawdown ? resultProfit / maxDrawdown : undefined;
    }
}
