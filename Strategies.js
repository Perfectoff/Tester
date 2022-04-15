import { Strategy_MA } from "./Strategy_MA.js";
import { Strategy_Pan } from "./Strategy_Pan.js";
import { Strategy_Lana, Strategy_Lana3, Strategy_LanaNav } from "./Strategy_Lana.js";
import { Strategy_SigmaChannel } from "./Strategy_SigmaChannel.js";
//import {VirtualItems} from "./Common";
//import {checkSeriesValuesType} from "./Chart/lightweight-charts/src/api/data-validators";
export { Strategy_MA, Strategy_Lana, Strategy_LanaNav, Strategy_Pan, Strategy_SigmaChannel };
export * from "./Strategy.js";
//export {CStrategy_Lana, CStrategySignaller_Lana} from "./Strategy_Lana.js";
class CAllStrategies extends Array {
    constructor(...items) {
        super(...items);
        return new Proxy(this, {
            get: (array, prop) => {
                var _a;
                return (_a = (typeof prop == "string" ? array.find((item) => item.name == prop) : undefined)) !== null && _a !== void 0 ? _a : array[prop];
            }
        });
    }
}
const strategies = [Strategy_MA, Strategy_Pan, Strategy_SigmaChannel, Strategy_Lana, Strategy_LanaNav, Strategy_Lana3];
export const AllStrategies = new CAllStrategies(...strategies);
//export {CStrategySignaller_MA} from "./Strategy_MA.js";
