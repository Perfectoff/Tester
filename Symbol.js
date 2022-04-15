import { CQuotesHistory } from "./MarketData.js";
export class CSymbol {
    constructor(info, quotesHistory) { this.info = info; this.quotesHistory = quotesHistory; }
    get name() { return this.info.name; }
    get lastPrice() { var _a, _b, _c; return (_c = (_b = (_a = this.quotesHistory.minTfBars) === null || _a === void 0 ? void 0 : _a.last) === null || _b === void 0 ? void 0 : _b.close) !== null && _c !== void 0 ? _c : null; }
    static fromParsedJSON(data) { return new CSymbol(data.info, CQuotesHistory.fromParsedJSON(data.quotesHistory)); }
}
//type CSymbolData = Readonly<CSymbolData_m>;
function GetByName(array, name) { return array.find((symbol) => symbol.name == name); }
export class CSymbols extends Array {
    getByName(name) { return GetByName(this, name); } //this.find((symbol)=> symbol.name==name); }
    constructor(array = []) { super(...array); }
}
