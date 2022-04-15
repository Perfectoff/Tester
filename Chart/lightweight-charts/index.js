//import * as LightweightCharts from "./typings.js";
export * from "./typings.js";
//import type LightweightCharts from "lightweight-charts"
import { LightweightCharts } from "./lightweight-charts.standalone.development.js";
//import LightweightCharts from "./lightweight-charts.standalone.development.js";
//let s : { LineStyles; };
/*
declare interface ILightweightCharts
{
    readonly LineStyle : typeof typings.LineStyle;
    readonly LineType : typeof typings.LineType;
    readonly CrosshairMode : typeof typings.CrosshairMode;
    readonly PriceScaleMode : typeof typings.PriceScaleMode;
    readonly PriceLineSource : typeof typings.PriceLineSource;
    readonly TickMarkType : typeof typings.TickMarkType;
    readonly isBusinessDay : typeof typings.isBusinessDay;
    readonly isUTCTimestamp : typeof typings.isUTCTimestamp;
    readonly createChart : typeof typings.createChart;
    //readonly version : typeof typings.version;
    readonly zzz;
}
*/
export const LineStyle = LightweightCharts.LineStyle;
export const LineType = LightweightCharts.LineType;
export const CrosshairMode = LightweightCharts.CrosshairMode;
export const PriceScaleMode = LightweightCharts.PriceScaleMode;
export const PriceLineSource = LightweightCharts.PriceLineSource;
export const TickMarkType = LightweightCharts.TickMarkType;
//export const createChart : typeof typings.createChart = LightweightCharts.createChart;
export function createChart(container, options) { return LightweightCharts.createChart(container, options); }
export function isBusinessDay(time) { return LightweightCharts.isBusinessDay(time); }
export function isUTCTimestamp(time) { return LightweightCharts.isUTCTimestamp(time); }
export function version() { return LightweightCharts.version(); }
//export const createChart2 = LightweightCharts.createChart;
//class X extends keyof LightweightCharts { }
//LightweightCharts : typings;
//let d : ILightweightCharts = LightweightCharts;
//let d : LightweightCharts = LightweightCharts;
//export default this; // as ILightweightCharts;
