export * from "./MarketData.js";
import { CSymbols } from "./Symbol.js";
export * from "./Symbol.js";
/*
declare global {
    interface Array<T> {
        protected getByName(name: string);// : CSymbol { return this.find((symbol)=> symbol.name==name); }}
    }

Array.prototype.getByName = function(name: string) { return this.find((symbol)=> symbol.name==name); }
*/
export class CMarketData {
    constructor() {
        this.symbols = new CSymbols(); //  readonly CSymbol[]
    }
}
export class CTradeData {
    constructor() {
        this.orders = [];
        this.trades = [];
        this.requests = [];
    }
}
class CSymTradeData {
    constructor(symbol) {
        this.position = 0; // число лотов
        this.symbol = symbol;
    }
}
class CSymTradeDataExt extends CSymTradeData {
}
export class CAccount extends CTradeData {
    constructor() {
        super(...arguments);
        //symDatas : { [key : string] : CTradeData; };
        this.symDatas = [];
        this.balance = 0;
        this.equity = 0;
        this.margin = 0;
    }
    symData(symbol) { return this.symDatas.find((data) => data.symbol == symbol); }
    // market скорее всего не нужен здесь
    UpdateFromOrders(requests, market) {
        var _a;
        for (let request of requests) {
            let symbol = request.symbol;
            let data = this.symData(symbol);
            if (!data) {
                let symdata = market.symbols.getByName(symbol);
                if (!symdata) {
                    throw ("Wrong symbol " + symbol);
                }
                data = new CSymTradeDataExt(symbol);
                data.currentPrice = (_a = symdata.lastPrice) !== null && _a !== void 0 ? _a : undefined;
            }
            //data.
        }
    }
    UpdateFromMarket(market) {
        var _a;
        for (let data of this.symDatas) {
            let price = (_a = market.symbols.getByName(data.symbol)) === null || _a === void 0 ? void 0 : _a.lastPrice;
            if (!price)
                continue;
            if (data.currentPrice != null)
                this.equity += (price - data.currentPrice) * data.position;
            data.currentPrice = price;
        }
    }
}
class COrderResult {
}
