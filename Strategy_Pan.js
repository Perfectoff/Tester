import { Param, paramType_Bool } from "./Strategy.js";
class CStrategySignaller_Pan {
    constructor(config) {
        this.pHL = 0.0;
        this.isUp = false;
        this.isDn = false;
        this.isShadow = false;
        this.signal = 0;
        this.barsAfterSignal = 0;
        //readonly indicators : readonly IIndicator[];
        this.minRequiredDepthBars = 2;
        this.config = config;
    }
    onNewBars(bars) {
        let config = this.config;
        for (let bar of bars) {
            let T = bar.time;
            let O = bar.open;
            let H = bar.high;
            let L = bar.low;
            let C = bar.close;
            let pHL = (H - L);
            let isUp = (O < C);
            let isDn = (O > C);
            let maxOC = Math.max(O, C);
            let minOC = Math.min(O, C);
            let isShadow = ((H - maxOC) / pHL * 100.0 <= config.maxShadow1_PercHL1) && ((minOC - L) / pHL * 100.0 <= config.maxShadow1_PercHL1);
            let isHL = (pHL / this.pHL * 100.0 >= config.minHL_PercHL1) && (pHL / this.pHL * 100.0 <= config.maxHL_PercHL1);
            let isHShadow = ((H - maxOC) / pHL * 100.0 >= config.minAShadow_PercHL);
            let isLShadow = ((minOC - L) / pHL * 100.0 >= config.minAShadow_PercHL);
            let isBody = ((maxOC - minOC) / pHL * 100.0 <= config.maxBody_PercHL);
            //----------
            let t0 = Math.floor(T.valueOf() / 60000.0 / 60.0) * 60000.0 * 60.0; // Начало часа
            let isT = T.valueOf() - t0 < config.timeDelta_minutes * 60000.0;
            //----------
            let isUpSignal = this.isDn && (config.isUpDn_Bars ? isUp : true) && this.isShadow && isHL && isLShadow && isBody && isT;
            let isDnSignal = this.isUp && (config.isUpDn_Bars ? isDn : true) && this.isShadow && isHL && isHShadow && isBody && isT;
            this.pHL = pHL;
            this.isUp = isUp;
            this.isDn = isDn;
            this.isShadow = isShadow;
            let signal = isUpSignal ? 1 : isDnSignal ? -1 : 0;
            if (signal != 0) {
                this.signal = signal;
                this.barsAfterSignal = 0;
            }
            else
                this.barsAfterSignal++;
        }
        if (this.signal) {
            if (this.barsAfterSignal >= this.config.tradeDuration_bars)
                this.signal = 0;
        }
    }
    getSignal() { return this.signal; }
}
export class CStrategy_Pan {
    constructor() {
        this.name = "2 Bars";
        this.params = [
            Param("maxShadow1_PercHL1", { min: 0 }, 20, { start: 1, end: 100, step: 1 }),
            Param("minHL_PercHL1", { min: 0 }, 90, { start: 1, end: 100, step: 1 }),
            Param("maxHL_PercHL1", { min: 0 }, 150, { start: 1, end: 100, step: 1 }),
            Param("minAShadow_PercHL", { min: 0 }, 50, { start: 1, end: 100, step: 1 }),
            Param("maxBody_PercHL", { min: 0 }, 30, { start: 1, end: 100, step: 1 }),
            Param("isUpDn_Bars", paramType_Bool, true),
            Param("timeDelta_minutes", { min: 0, max: 59, step: 1 }, 30, { start: 0, end: 59, step: 1 }),
            Param("tradeDuration_bars", { min: 1, step: 1 }, 2, { start: 1, end: 100, step: 1 })
        ];
    }
    getSignaller(params) {
        for (let i = 0; i < params.length; i++)
            console.assert(this.params[i].type.isCorrectValue(params[i]), "Wrong param " + i + " value: " + params[i]);
        return new CStrategySignaller_Pan({
            maxShadow1_PercHL1: params[0],
            minHL_PercHL1: params[1],
            maxHL_PercHL1: params[2],
            minAShadow_PercHL: params[3],
            maxBody_PercHL: params[4],
            isUpDn_Bars: params[5] != 0,
            timeDelta_minutes: params[6],
            tradeDuration_bars: params[7]
        });
    }
}
CStrategy_Pan.instance = new CStrategy_Pan();
export const Strategy_Pan = CStrategy_Pan.instance;
