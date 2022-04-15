import { TF } from "./Time.js";
import { CBars, CBar } from "./MarketData.js";
//let XMLHttpRequest;
//import(Math.random().toString());
//const XMLHttpRequest = (await import('xmlhttprequest')).XMLHttpRequest;
//import XMLHttpRequest from "xmlhttprequest"
//import * as $ from "./jquery-3.5.1.min"
function print(...args) { console.log(...args); }
//import {createRequire} from 'module';
//import {fileURLToPath as fromPath} from 'url';
//const require = createRequire(fromPath(import.meta.url));
//function __LoadQuotes(tf :TF,  fromDate :const_Date,  toDate :const_Date,  onload : (f :ProgressEvent)=>any,  onerror : (f :ProgressEvent)=>any)
//import ts from "typescript";  ///lib/lib.dom"
function __LoadQuotes(symbol, tf, fromDate, toDate, onload, onerror) {
    if (!fromDate || isNaN(fromDate.valueOf())) {
        console.error("wrong fromDate");
        return;
    }
    if (!toDate || isNaN(fromDate.valueOf())) {
        console.error("wrong toDate");
        return;
    }
    console.log("Requested data: ", symbol, tf.name, fromDate, " - ", toDate);
    //console.log("!");
    // @ts-ignore
    let req = new XMLHttpRequest();
    //console.log("!!");
    function toSec(time) { return Math.trunc(time.valueOf() / 1000); }
    let tfStr = tf.unitCount + tf.unit.sign.toLowerCase();
    let url = 'https://api-sb.mstrade.org/api/v1/quote/' + symbol + '/?account=demo.demo&binsize=' + tfStr + '&from=' + toSec(fromDate) + '&to=' + toSec(toDate) + '&schema=margin1';
    console.log("url: ", url);
    req.open('GET', url); //159757177410d  //console.log(req.responseText);
    req.onload = () => { return (req.status == 200 ? onload(req.responseText) : onerror(req.responseText)); }; //(f)=>this.ghistory(f);
    req.onerror = () => { return onerror(req.responseText); }; //onerror; //(f)=>this.GetHistoryOnerror(f);
    //req.onload= (f)=>print("Loaded ",f);
    //req.onerror= (f)=>print("Error");
    req.send();
    /*
    await $(function(){
        alert('Hello');
    });*/
}
async function LoadQuotesString(symbol, tf, fromDate, toDate) {
    return new Promise((resolve, reject) => __LoadQuotes(symbol, tf, fromDate, toDate, (text) => resolve(text), (text) => reject(text)));
}
//import {ParsedUrlQueryInput} from "querystring";
export async function LoadQuotes(symbol, tf, fromDate, toDate) {
    let str = await LoadQuotesString(symbol, tf, fromDate, toDate);
    //catch(e) { alert("error"); return; }
    let bars = JSON.parse(str);
    let myBars = [];
    for (let bar of bars) {
        if (bar["time"] != undefined && bar["open"] == undefined)
            continue;
        function barvalue(prop) { if (bar[prop] == undefined)
            throw ("Property " + prop + " is not defined in bar data: " + JSON.stringify(bar)); return bar[prop]; }
        let myBar = new CBar(new Date(barvalue("time")), barvalue("open"), barvalue("high"), barvalue("low"), barvalue("close"), barvalue("volume"));
        myBars.push(myBar);
    }
    if (myBars.length > 1 && myBars[0].time > myBars[1].time)
        myBars.splice(0, 1); // Удаляем первый бар
    return myBars;
}
//---------------------------
// Загрузить котировки с конвертацией таймфрейма
export async function LoadQuotesWithConversionTimeframe(symbol, tf, fromDate, toDate) {
    var _a;
    let requestTf = tf < TF.M5 ? TF.M1 : tf < TF.H1 ? TF.M5 : tf < TF.D1 ? TF.H1 : TF.D1;
    let bars = await LoadQuotes(symbol, requestTf, fromDate, toDate);
    //console.log(requestTf,"\n",bars);
    if (bars && tf != requestTf)
        bars = (_a = new CBars(requestTf, bars).toBarsArray(tf)) !== null && _a !== void 0 ? _a : (() => { throw ("Wrong timeframe: " + JSON.stringify(tf)); })();
    //if (bars && tf!=requestTf) console.log("!! ",tf,"\n",bars);
    // bars.length= 5;
    // let s= JSON.stringify(bars);
    // //let src= JSON.parse(s, (k,v)=>console.log("Prop: ",k,": ",Object instanceof Date));
    // //let parsed= CBars.fromJSON(s);
    // //console.log(bars);
    // //console.log(parsed);
    // //let d;
    // //alert(d= new Date().toString());
    // //alert(new Date(d));
    // if (1) {
    // 	let b= new CBars(tf, bars);
    // 	let s= JSON.stringify(b);
    // 	let p= JSON.parse(s);
    // 	let obj= CBars.fromParsedJSON(p);//JSON.parse(s);
    // 	//let new2= new CBars;
    //
    // 	console.log("Parsed!\n:",obj); //, (obj as CBars)[0].time.valueOf());
    // }
    return bars;
}
//lib.dom.d.ts
/*
var promise = Promise.resolve(17469);

let a= await promise;//.then(function(val) {
    console.log(a);
*/
//1m, 5m, 1h, 1D
/*
function func() {
    return $.ajax({
        url: url,
        type: 'post',
        dataType: 'text',
        data: {data},
        success: function (return_data) {
            return String(return_data);
        },
        error: function (xhr, status, error) {
            var err = eval("(" + xhr.responseText + ")");
            console.log(err.Message);
            return err.Message;
        }
    });
}
*/
export async function check() {
    console.log("Start downloading");
    //$.ajax.
    try {
        let time = new Date();
        //let res = await __LoadQuotes(TF.H1, new Date("2020.09.01"), new Date("2020.09.10"), ()=>print("Loaded"), ()=>print("Error"));
        //return res;
        let result = await LoadQuotes("btcusd", TF.H1, new Date("2020-09-01"), new Date("2020-09-10")); //.then(()=>print("!!!! "));
        console.log("ok.  Received:", result.length, "bars.  Elapsed:", (Date.now() - time.valueOf()), " ms");
        console.log(result);
        /*
        let xhr= (result.target as XMLHttpRequest);
        console.log("readyState: ",xhr.readyState);
        console.log("\nstatus: ",xhr.status );
        console.log("\nresponse: ",xhr.response);
        console.log("\nresponseText: ",xhr.responseText);
        */
    }
    catch (e) {
        console.log("Error: ", e);
    }
}
/*
import {createRequire} from 'module';

const require = createRequire(import.meta.url);

let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

await check();
*/
//if(typeof XMLHttpRequest=="undefined") {
//console.log("!!!!");
//let createRequire = (await import('module')).Module.createRequire;
//function f() {
//let createRequire = (import(Math.random().toString()));//.Module.createRequire;
//}
//
//}
//
//await new Promise((resolve, reject)=> setTimeout(resolve, 4000));
