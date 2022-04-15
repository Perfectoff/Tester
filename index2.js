/// <reference lib="dom" />
import { DrawCandleChart, scrollChartToTime, CreateMyChartArea } from "./Chart/Chart.js";
import * as lib from "./Common.js";
//import {FBinanceSymbols, FBinanceLoad} from "../and/LoadHistoryBinance.js"
/** @type{MyTester_type}
 */
import * as MyTester from "./MyTester.js";
import { SetChartAutoResize, SymbolQuotesGetter, PriceChartColor, EquityChartColor, } from "./MyTester.js";
import { CHistoryCacheable_Binance, CHistoryCacheable_MsTrade } from "./HistoryLoader.js";
//await lib.sleepAsync(100);
//alert("!");//fff());
import { CTesterConfig, CTesterInfo, createStrategyObject, GetSumEquity, LoadSymbolQuotesForTesterInfo } from "./TesterAPI.js";
//import { Strategy_MA, Strategy_Pan, Strategy_Lana, Strategy_Lana2, AllStrategies } from "./Strategies.js";
import { AllStrategies } from "./Strategies.js";
import * as Param from "./Param.js";
/** @type{Time_type}
 */
import * as Time from "./Time.js"; //Time= await import("./Time.js");   // Такой вариант, иначе PHPStorm не видит его
import { TF } from "./Time.js";
//MyTester= _MyTester;
//import type * as MyTester from "./MyTester"
//import * as Tester from "./TesterAPI.js";
//import {RunSignallerTest} from "./Tester.js";
//alert("??????? exit");
import { SetAutoStepForElement } from "./index_helper.js";
import { getCookie, setCookie } from "./Cookie.js";
import { TradeStatistics } from "./TradeStatistics.js";
import { colorStringToRGBA } from "./Common.js";
let g = length;
//MyTester;
//import { Period } from "./Time";
//moduleFunc();
//async function moduleFunc()
//let MyTester= MyTester;
//let c = MyTester.CTesterSpeed;
//import * as MSTrade from "./Data_MSTrade.js";
//type JQueryMy<T> = JQuery<T> & { val() : string; };
//function ff(element : string) { return JQueryStatic. }
//declare function $(html: JQuery.htmlString,  ownerDocument_attributes?: Document | JQuery.PlainObject):  { val : ()=>string; } & JQuery<HTMLElement>;
/**
 * Creates DOM elements on the fly from the provided string of raw HTML.
 * @param html _&#x40;param_ `html`
 * <br>
 * * `html (ownerDocument)` — A string of HTML to create on the fly. Note that this parses HTML, not XML. <br>
 * * `html (attributes)` — A string defining a single, standalone, HTML element (e.g. &lt;div/&gt; or &lt;div&gt;&lt;/div&gt;).
 * @param ownerDocument_attributes _&#x40;param_ `ownerDocument_attributes`
*/
function $1(html, ownerDocument_attributes) {
    return $(html, ownerDocument_attributes);
}
//const $1 = $ as <T>(html: JQuery.htmlString,  ownerDocument_attributes?: Document | JQuery.PlainObject) => { val : ()=>string; } & JQuery<T>
class CParamValueInfo {
}
;
function ShowPreloaderImage(destination) {
    let html = '<img class="preloaderIcon" src="./preloader_1495_256x256.gif" width="128" height="128" style="z-index: 999; left: 50%; margin-left:-64px; margin-top:64px; position: absolute" alt="running">';
    let el = document.createElement("div");
    //el.style.marginLeft="auto";
    el.innerHTML = html;
    destination.insertBefore(el, destination.firstChild);
    $(el).show();
    return el;
}
//const Exchanges : readonly Exchange[] = ["MsTrade","Binance"];
const Exchanges = ["Binance", "MsTrade"];
const SymbolsByExchange = {};
export async function Run({ ClearStrategyParameterTable, AddStrategyParameterToTable, ClearOptimizTable, AddResultToOptimizTable, InitTradeTable, AddTradesToTable, GetGeneticConfig, SetExchanges, SetSymbols, AddQuotesChart, AddEquityChart, ClearUserCharts, AddNewStatisticTableFromBody, SetLegendToChart, AddLegendItemToChart }) {
    const historyMsTrade = new CHistoryCacheable_MsTrade;
    const historyBinance = new CHistoryCacheable_Binance;
    function exchange() { return $exchange.val(); }
    function historySource(exchange) { return exchange == "Binance" ? historyBinance : exchange == "MsTrade" ? historyMsTrade : null; }
    function historySourceMy() { return historySource(exchange()); }
    function GetSymbolQuotesGetter(symbol, tickSize, quoteCurrency) {
        let source = historySource(exchange());
        return source ? SymbolQuotesGetter(symbol, tickSize, quoteCurrency, source) : null;
    }
    //SymbolsByExchange["MsTrade"] = ["BTCUSD", "ETHUSD", "LTCUSD", "XRPUSD"];
    const $exchange = $1("#exchange");
    async function onChangeExchange() {
        var _a, _b;
        let exchange = $exchange.val();
        SetSymbols((_a = SymbolsByExchange[exchange]) !== null && _a !== void 0 ? _a : []);
        let newSymbols = await ((_b = historySource(exchange)) === null || _b === void 0 ? void 0 : _b.getSymbols());
        if (newSymbols)
            SetSymbols(SymbolsByExchange[exchange] = newSymbols);
        LoadSymbolBars();
    }
    $exchange[0].onchange = async () => {
        onChangeExchange();
    };
    //await lib.sleepAsync(500);
    SetExchanges(Exchanges);
    onChangeExchange();
    const $symbols = $("#symbol");
    function selectedSymbols() { let val = $symbols.val(); return (val instanceof Array ? val : [val]); }
    const $strategy = $1("#strategy");
    const $tf = $1("#tf");
    const $startDate = $1("#startDate");
    const $endDate = $1("#endDate");
    const $priceChart = $("#quotesChart");
    const $priceChartName = $("#quotesChartName");
    const $equityChart = $("#equityChart");
    //let _loadBarsCounter = 0;
    async function LoadSymbolBars() {
        var _a;
        if ($priceChart[0].parentElement.style.display == 'none')
            return;
        if (selectedSymbols().length > 1)
            return;
        //alert(111);  return;
        //$("#quotesChartName")[0].innerText = "fuck";  return;
        let symbol = selectedSymbols()[0]; //$symbols.val();
        let tfName = $tf.val();
        let tf = TF.get(tfName);
        if (!symbol || !tf)
            return false;
        //let counter= ++_loadBarsCounter;
        let preloadImg = ShowPreloaderImage($priceChart[0]);
        let bars = await ((_a = historySourceMy()) === null || _a === void 0 ? void 0 : _a.getBars(symbol, tf, new Date(Date.now() - 1000 * tf.msec), new Date).finally(() => preloadImg.remove()));
        if (_testing)
            return;
        //if (counter!=_loadBarsCounter) return;  // Отрисовываем только последний запрос
        $priceChart.empty();
        if (1)
            if (bars)
                DrawCandleChart(bars, $priceChart[0], PriceChartColor); //
        $priceChartName[0].innerText = symbol + ", " + tfName;
        $priceChartName[0].style.color = 'white';
        $priceChartName[0].style.fontSize = "small";
        //SetLegendToChart($priceChart[0], "Items", (element)=>alert(element.value));
        // console.log("Ignoring: ",EquityChartColor," -> ",lib.colorStringToRGBA(EquityChartColor))
        // let i=0;
        // for(let clr of lib.colorGenerator())
        // 	if (++i<30) {
        // 		console.log("!!",clr);
        // 	}
        // 	else break;
        // let generator= lib.colorGenerator();
        // //console.log(generator.next().value);
        // //console.log(generator.next().value);
        // //let xxx = generator.next().value;
        // for(let n=0; n<30 ;n++) {
        // 	let [r,g,b] = generator.next().value;
        // 	if (lib.isSimilarColors([r,g,b], EquityChartColor)) continue;
        // 	AddLegendItemToChart($priceChart[0], (n*100)+"", true, "rgb("+r+","+g+","+b+")");
        // }
        //for(let value of ["101", "200", "300", "400", "500"])
        //AddLegendItemToChart($priceChart[0], value, true, 'rgb(254,176,0')//;[]((r, g, b)=>"rgb("+r+","+g+","+b+")")(...generator.next().value));}
    }
    $symbols[0].onchange = LoadSymbolBars; // .addEventListener('change', LoadSymbolBars);
    $tf[0].onchange = LoadSymbolBars; ////.addEventListener('change', LoadSymbolBars);
    //LoadSymbolBars();
    //$(document).on('change', '#tf', function(e){ alert("!"); }
    const $paramTableBody = $("#paramTableBody");
    /**
     * @param { IStrategy } strategy
     * @param { CParamValueInfo[] } valuesConfigs - Конфигурации параметров
     */
    function _SetStrategyParams(strategy, valuesConfigs) {
        var _a, _b, _c, _d, _e;
        let params = strategy.params;
        ClearStrategyParameterTable();
        //let state= stategyParamTableState.get(strategy.name);
        //if (state) { $pramTableBody[0].innerHTML= state;  return; }
        for (let [i, param] of params.entries()) {
            //let checked=false;
            let config = valuesConfigs ? valuesConfigs[i] : null;
            let info = param.type.valuesInfo;
            let defaultValue = param.defaultValue;
            let defaultRange = param.defaultRange;
            let infoVal = info;
            //if (!info) [info,checked]= state ? state[i]: null;
            if (!config && defaultRange)
                config = Object.assign(Object.assign({}, defaultRange), { step: (_a = defaultRange.step) !== null && _a !== void 0 ? _a : infoVal.step, progres: infoVal.progressive ? 1.1 : 1, single: defaultValue !== null && defaultValue !== void 0 ? defaultValue : defaultRange.start });
            if (!config) {
                //console.log(param);
                let start = (_c = (_b = infoVal.min) !== null && _b !== void 0 ? _b : defaultValue) !== null && _c !== void 0 ? _c : (() => { throw (strategy.name + "  Параметр " + i + ": Не заданы значения для min и defaultValue"); })();
                let end = (_d = infoVal.max) !== null && _d !== void 0 ? _d : defaultValue;
                let step = start != null && end != null ? ((_e = infoVal.step) !== null && _e !== void 0 ? _e : (end - start) / 10) : null;
                let single = defaultValue !== null && defaultValue !== void 0 ? defaultValue : start;
                if (step)
                    config = { start, end, step, single, progres: infoVal.progressive ? 1.1 : 1 };
                else
                    throw (strategy.name + "  Параметр " + i + ": некорректные значения");
            }
            if (config.checked == undefined && param.static)
                config = Object.assign(Object.assign({}, config), { checked: false });
            //console.log(strategy.name, param.name, config);
            AddStrategyParameterToTable(param.name, config, param.type.valuesInfo); //info?.single, info?.start, info?.end, info?.step, info?.progres);
            //AddStrategyParameterToTable('1st MA period', 10,  1, 20, 1, 1.1);
            //AddStrategyParameterToTable('2nd MA period', 20,  5, 100, 5, 1.1);
        }
        //$(".inputParamProgres").each((index,element)=>SetAutoStepForElement(element as HTMLInputElement, 0.1));
        //$(".inputParamNumber").each((index,element)=>SetAutoStepForElement(element as HTMLInputElement));
    }
    // Хэшмэп состояния таблицы параметров по названию стратегии
    //const stategyParamTableState = new Map<string, string>();
    const stategyParamTableState = new Map();
    // /** Хэшмэп состояния параметров по названию стратегии
    //  * @type {Map< string, { info :CParamValueInfo, checked :boolean }[] >}
    //  */
    // let stratParamStates= new Map;
    let currentStrategyName;
    let currentStrategy;
    /** Хэшмэп стратегий по имени
     * @type {Map<string, IStrategy>}
     */
    //const stategiesMap = new Map<string, IStrategy>();
    const stategiesMap = {};
    let $paramTable = $("#parameters");
    function SaveCurrentStrategyParamsToMap() {
        //let checkboxesStates = $(".inputParamCheckBox").map((i, el)=>el.checked);
        //stategyParamTableState.set(currentStrategyName, $paramTable[0].innerHTML); //[$paramTable[0].innerHTML, checkboxesStates]);
        stategyParamTableState.set(currentStrategyName, GetParamInfos());
    }
    /**@param{string} strategyName
     */
    function RecoverStrategyParamsFromMap(strategyName) {
        //let [innerHtml, checkboxStates] = stategyParamTableState.get(currentStrategyName);
        //console.log("!!!",stategyParamTableState.get(strategyName));
        //$paramTable[0].innerHTML= stategyParamTableState.get(strategyName);
        _SetStrategyParams(stategiesMap[strategyName], stategyParamTableState.get(strategyName));
        //console.log("Recover: ",stategyParamTableState.get(strategyName));
        //function isVisible(el :HTMLElement) { return el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0; }//window.getComputedStyle(el).visibility!=="hidden" && el.style.display!=="none"; }
        //$(".inputParamCheckBox").each((i, el: HTMLInputElement)=> { el.checked= isVisible($(".inputParamStart")[i]); });
    }
    /**
     * @param {IStrategy} strategy
     * @param {CParamValueInfo[]} valuesConfigs
     */
    function AddStrategy(strategy, valuesConfigs) {
        SaveCurrentStrategyParamsToMap();
        let name = strategy.name;
        $strategy.append('<option value="' + name + '">' + name + '</option>');
        //$strategy[0].selectIndex= $strategy[0].length-1;
        $strategy[0].value = name;
        //alert($strategy[0].selectIndex);
        _SetStrategyParams(strategy, valuesConfigs);
        currentStrategyName = name;
        currentStrategy = strategy;
        stategiesMap[name] = strategy;
    }
    for (let strategy of AllStrategies)
        AddStrategy(strategy);
    // if (1)
    // 	AddStrategy(Strategy_MA,
    // 		[
    // 			{ single: 10,  start: 1, end: 50, step: 1, progres: 1.1 },
    // 			{ single: 20,  start: 2, end: 100, step: 2, progres: 1.1 },
    // 			//{ single: 0,  start: 0, end: 1, step: 1, progres: 1 }
    // 		]
    // 	);
    // if (1)
    // 	AddStrategy(Strategy_Pan);
    //
    // if (1)
    // 	AddStrategy(Strategy_Lana//,
    // 		// [
    // 		// 	{ single: 10,  start: 1, end: 50, step: 1, progres: 1.1 },
    // 		// 	{ single: 20,  start: 2, end: 100, step: 2, progres: 1.1 },
    // 		// 	//{ single: 0,  start: 0, end: 1, step: 1, progres: 1 }
    // 		// ]
    // 	);
    //
    // if (1)
    // 	AddStrategy(Strategy_Lana2);
    function OnSetParams() {
        // Пересчитываем и отображаем число комбинаций при изменении любого параметра
        $("#parameters :input").on("change", () => ShowAmountOfCombinations());
        ShowAmountOfCombinations();
        SetOnClickComboCountEvent();
        $(".inputParamNumber").not(".inputParamProgres").each((index, element) => SetAutoStepForElement(element));
        $(".inputParamProgres").each((index, element) => SetAutoStepForElement(element, 0.1));
        $("#loadParams")[0].disabled = !getCookie(currentStrategyName);
    }
    $strategy.on("change", () => {
        //alert($strategy.val());
        SaveCurrentStrategyParamsToMap();
        currentStrategyName = $strategy.val();
        currentStrategy = stategiesMap[currentStrategyName];
        //console.log("Save: ",$paramTable[0]);
        RecoverStrategyParamsFromMap(currentStrategyName);
        OnSetParams();
    });
    OnSetParams();
    function SaveParams() {
        try {
            let infos = GetParamInfos().map(function (info, i) { return Object.assign({ name: currentStrategy.params[i].name }, info); });
            setCookie(currentStrategyName, JSON.stringify(infos));
        }
        catch (e) {
            alert(e);
            throw (e);
        }
    }
    function LoadParams() {
        try {
            let str = getCookie(currentStrategyName);
            if (!str)
                throw ("Cookie for " + currentStrategyName + " is not defined");
            let params = JSON.parse(str);
            for (let [i, paramInfo] of currentStrategy.params.entries()) { //for(let [i,param] of params.entries()) }
                let param = params[i];
                if (param && param.name != paramInfo.name)
                    throw "Загружено не совпадающее имя параметра #" + i + ": " + param.name;
                function goodVal(val) { return typeof val == "number" && !isNaN(val); }
                if (!param || !goodVal(param.start) || !goodVal(param.end) || !goodVal(param.step) || !goodVal(param.single))
                    throw "Loaded invalid info for parameter #" + i + ": " + JSON.stringify(param);
                _SetStrategyParams(currentStrategy, params);
            }
        }
        catch (e) {
            alert(e);
            throw (e);
        }
    }
    $("#saveParams")[0].onclick = () => { SaveParams(); showPopupMessage(null, "Параметры сохранены", 1000); $("#loadParams")[0].disabled = false; };
    $("#loadParams")[0].onclick = () => { LoadParams(); showPopupMessage(null, "Параметры загружены", 1000); };
    $("#resetParams")[0].onclick = () => { _SetStrategyParams(currentStrategy); showPopupMessage(null, "Параметры сброшены", 1000); };
    let _testing = false;
    let _paused = false;
    let testerSpeedMutable = new MyTester.CTesterSpeed;
    const $startBtn = $('#startBtn');
    const $pauseBtn = $('#pauseBtn');
    const $visualCheckbox = $('#visualModeCB');
    const $speedRange = $('#speed');
    const $onlyPositiveResultsCheckBox = $("#onlyPositiveResults_checkBox");
    //$('#Speed')[0].addEventListener('input', alert("!"));
    //$('#Speed')[0].addEventListener('change', ()=>alert("!"));
    $speedRange.on('input', () => {
        let value = Number($speedRange[0].value);
        if (!_paused)
            testerSpeedMutable.value = value; //=  ()=>alert($('#speed')[0].value));
    });
    $speedRange.on('change', () => {
        let value = Number($speedRange[0].value);
        console.log("Set testing speed=", value);
        if (!_paused)
            testerSpeedMutable.value = value; //=  ()=>alert($('#speed')[0].value));
    });
    //alert($('#visualModeCB')[0].checked);
    //const pauseChar= "\u23F8\uFE0E";//\uFE0E'; //U+23F8;
    //const playChar= '\u23F5\uFE0E';
    ////const playChar= '\u25B6'; //U+25B6; //'&#x25B6';
    if ($visualCheckbox[0].checked)
        $speedRange.trigger("change");
    /** @param{boolean} paused */
    function SetPaused(paused) {
        if (paused)
            testerSpeedMutable.value = 0;
        else
            testerSpeedMutable.value = Number($speedRange[0].value);
        _paused = paused;
        //$pauseBtn[0].value = paused ? playChar : pauseChar; //
        $pauseBtn[0].className = paused ? "fa fa-play" : "fa fa-pause";
        $pauseBtn[0].title = paused ? "Продолжить" : "Пауза";
    }
    $pauseBtn[0].onclick = () => SetPaused(!_paused);
    SetPaused(false); //'&#x25B6';
    // Показать общее число комбинаций
    function ShowAmountOfCombinations() {
        let errors = [];
        let infos = GetParamsOptimizArrays(function onErr(i, msg) { errors[i] = msg; });
        $('.cellParamComboCount').each((i, el) => {
            var _a;
            el.innerHTML = infos && infos[i] ? "[" + ((_a = infos[i]) === null || _a === void 0 ? void 0 : _a.length) + "]" : errors[i] ? "<span style='color:red'>" + errors[i] + "</span>" : "";
            //if (!infos || !infos[i]) console.log($('#parameters tbody tr')[i]); tr.getElementsByClassName('')[0].checked
            let border = (infos && infos[i]) ? "1px solid" : "2px red solid";
            $($('#parameters tbody tr')[i]).find("td:has(input[type=number])").css("border", border); //"").style.border= "2px red";  // :HTMLElement
        });
        $("#paramComboCount")[0].innerHTML = "" + (infos === null || infos === void 0 ? void 0 : infos.reduce((prev, curr) => { var _a; return prev * ((_a = curr === null || curr === void 0 ? void 0 : curr.length) !== null && _a !== void 0 ? _a : 0); }, 1));
    }
    /**@param{HTMLElement} e
     */
    function isHover(e) { var _a; return ((_a = e.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector(':hover')) === e; } //element.matches(':hover') или [element]:hover
    let __lastClickTarget;
    function SetOnClickComboCountEvent() {
        // События клика на числе комбинаций отдельного параметра
        $(".cellParamComboCount").on("click", (event) => {
            var _a;
            //tr.getElementsByClassName("cellParamComboCount")[0].onclick= (event)=> {
            let el = event.target;
            removePopupMessage();
            if (el == __lastClickTarget) {
                __lastClickTarget = null;
                return;
            }
            __lastClickTarget = null;
            let iParam = $(".cellParamComboCount").index(el);
            let paramDatas = GetParamsOptimizArrays();
            let text = paramDatas && iParam >= 0 ? "Значения:<br>" + [...((_a = paramDatas[iParam]) !== null && _a !== void 0 ? _a : ["???"])].join("<br>") : "";
            if (text === "")
                return;
            showPopupMessage(el, text, 0, true, false);
            __lastClickTarget = el; //if (isHover($(".popup"))) alert(113); }// { if (! isHover($(".popuptext")[0])) $(".popup")[0].remove(); }
        });
    }
    //SetParamsOnClickComboCount();
    //document.onclick= (e)=> { if (__lastClickTarget && e.target!=__lastClickTarget && e.target!=currentPopup()) { removePopupMessage();  __lastClickTarget= null; }}
    // комиссия
    let $fee = $1("#fee");
    SetAutoStepForElement($fee[0]);
    $(document).on('submit', 'form', function (e) {
        e.preventDefault(); // Предотвращаем отправку данных формы
        OnClickStartBtn();
    });
    let cancelToken = new lib.CancelToken();
    /**@type{JQuery<HTMLInputElement>}
     */
    const $geneticCheckBox = $("#genetic_checkBox");
    /**@type{JQuery<HTMLInputElement>}
     */
    const $threadsCountInput = $("#threadsCountInput");
    /**@param{boolean} isOptimiz
     */
    async function OnClickStartBtn(isOptimiz) {
        if (_testing) {
            testerSpeedMutable.value = -1;
            cancelToken.cancel();
            return;
        }
        let isOptimization = isOptimiz !== null && isOptimiz !== void 0 ? isOptimiz : $("#tabContentOptimization").is(":visible");
        let startBtn = isOptimization ? $("#startOptimizBtn") : $startBtn;
        startBtn[0].value = "Стоп";
        let disabling_elements = [$("[name='tab-btn']"), $('.header :input, .header select')]; //: JQuery<HTMLElement>[] = [, ];
        if (isOptimization) {
            disabling_elements.push(...[$onlyPositiveResultsCheckBox, $threadsCountInput, $geneticCheckBox, $("#geneticConfig :input")]);
        }
        else {
            disabling_elements.push($visualCheckbox);
            //$visualCheckbox.prop("disabled", true);
            $pauseBtn.prop('disabled', false);
            if (!$visualCheckbox[0].checked)
                testerSpeedMutable.value = Number.MAX_VALUE;
        }
        // Отключаем элементы
        for (let $el of disabling_elements)
            $el.prop("disabled", true);
        //$(disabling_elements).prop("disabled", true);  // не работает!
        _testing = true;
        cancelToken = new lib.CancelToken();
        $("#btnErrorText").remove();
        try {
            if (isOptimization)
                await _Optimizate();
            else
                await _Test();
        }
        catch (e) {
            startBtn.parent().append("<div id='btnErrorText' style='color:red'>Ошибка!</div>");
            throw (e);
        }
        finally {
            startBtn[0].value = "Старт";
            //$('#startBtn').prop( "disabled", false );
            for (let $el of disabling_elements)
                $el.prop("disabled", false);
            //$(disabling_elements).prop("disabled", false); // не работает!
            if (isOptimization) {
            }
            else {
                $pauseBtn.prop('disabled', true);
                SetPaused(false);
            }
            _testing = false;
            let audio = new Audio('./expert.wav');
            audio.play();
        }
    }
    //document.OnClickStartBtn= OnClickStartBtn;
    // async function OnClickOptimizButton()
    // {
    // 	$("#startOptimizBtn")[0].value= "Стоп";
    // 	$(".tabs").prop("disabled",true);
    // 	_Optimizate();
    // 	$("#startOptimizBtn")[0].value= "Старт";
    // 	$(".tabs").prop("disabled",false);
    // }
    function GetParamInfos() { return GetParamInfosPartial((i, msg) => { throw ("Param " + i + ": " + msg); }); }
    function GetParamInfosPartial(onError) {
        let paramsRows = $('#parameters')[0].getElementsByTagName('tbody')[0].getElementsByTagName("tr");
        function ensureValid(i, val, name) { if (isNaN(val)) {
            console.error(`Parameter "${i}" ("${name}"): wrong value: ` + val);
            if (onError)
                onError(i, "Wrong value " + val);
            return false;
        } return true; }
        function parse(value) { return parseFloat(value + ""); }
        let params = [];
        for (let i = 0; i < paramsRows.length; i++) {
            function getItemValue(elem, name) { let num = parse(elem.val()); return ensureValid(i, num, name) ? num : undefined; }
            let $paramRow = $(paramsRows[i]);
            function getItemValue_(selector_element) { var _a; return getItemValue((_a = $paramRow.find(selector_element)) !== null && _a !== void 0 ? _a : (() => { throw "Unknown element: " + selector_element; })(), $paramRow.find(".cellParamName")[0].innerHTML); }
            let value = getItemValue_('.inputParamValue');
            let start = getItemValue_('.inputParamStart');
            let end = getItemValue_('.inputParamEnd');
            let step = getItemValue_('.inputParamStep');
            let progres = getItemValue_('.inputParamProgres');
            let checked = $paramRow.find('.inputParamCheckBox')[0].checked;
            params.push({ start, end, step, progres, checked, single: value });
        }
        return params;
    }
    /** Получаем массивы оптимизируемых параметров*/
    function GetParamsOptimizArrays(onError = (i, msg) => { throw ("Param " + i + ": " + msg); }) {
        let paramInfos = GetParamInfosPartial(onError);
        let allParams = []; //CParamStepper
        for (let [i, param] of paramInfos.entries()) {
            let isOpt = param.checked;
            let value = param.single;
            //if (i===0) { console.log("Задаём первый параметр как оптимизируемый!!");  isOpt=true; }
            let [start, end, step, progres] = isOpt ? [param.start, param.end, param.step, param.progres] : [value, value, 1, 1];
            if (start == null || end == null || step == null || progres == null) {
                allParams.push(null);
                continue;
            }
            try {
                let values;
                if (progres === 1)
                    values = new MyTester.CParamStepper(start, end, step);
                else
                    values = Param.CreateUniqueValues_start_end_step_stepX_endMatch(start, end, step, progres, Param.E_MATCH_END.FIT, true);
                allParams.push(values);
            }
            catch (msg) {
                if (onError)
                    onError(i, msg);
                allParams.push(null);
            } //allParams.push(new Error(msg));  if (onError) onError(i, msg); }
        }
        return allParams;
    }
    async function _Optimizate() {
        var _a;
        console.log("Optimizate");
        ClearOptimizTable();
        let symbol = selectedSymbols()[0];
        if (!symbol)
            return; //$symbols.val();
        let strategy = $strategy.val();
        let startDate = $startDate.val();
        let endDate = $endDate.val();
        let tfName = $tf.val();
        let comission = { value: parseFloat($fee.val()), unit: $1("#feeType").val() };
        let strategyObj = stategiesMap[strategy]; //Strategy_MA;
        if (!strategyObj)
            throw ("Неизвестная стратегия: " + strategy);
        let params = GetParamsOptimizArrays();
        console.assert(params.every((param) => param != null));
        //symInfo.tickSize= 1;
        //symInfo.quoteCurrency= "USD";
        let tickSize = 1; //symInfo.tickSize= 1;
        let quoteCurrency = "USD"; ////symInfo.quoteCurrency= "USD";
        let priceInfo = (_a = GetSymbolQuotesGetter(symbol, tickSize, quoteCurrency)) !== null && _a !== void 0 ? _a : (() => { throw ("Failed to get quotes getter"); })(); //MyTester.MsTradeSymbolQuotes(symbol, tickSize, quoteCurrency);
        let symInfo = {
            name: symbol,
            lotSize: 1,
            comissionPerSide: comission,
            priceInfo
        };
        let config = new CTesterConfig(new Date(startDate), new Date(endDate), 0);
        let tf = TF.get(tfName);
        console.assert(tf != null);
        //config.defaultTf= TF.get(tfName);
        //alert(config.defaultTF.name);
        let startTimeMs = Date.now();
        let combosTotal = params.reduce((prev, curr) => { var _a; return prev * ((_a = curr === null || curr === void 0 ? void 0 : curr.length) !== null && _a !== void 0 ? _a : 1); }, 1);
        let combosComputed = 0;
        let isGenetic = $geneticCheckBox[0].checked;
        let geneticConfig = isGenetic ? GetGeneticConfig() : null;
        function onOptimizTimer(stopped = false) {
            $("#optimizStatus")[0].style.visibility = "visible";
            let percent = combosComputed * 100 / combosTotal;
            $("#optimProgressBar")[0].value = percent + "";
            let elapsedMs = Date.now() - startTimeMs;
            let timeStr = combosTotal < 100 && elapsedMs < 10000 ? Time.durationToStr_h_mm_ss_ms(elapsedMs) : Time.durationToStr_h_mm_ss(elapsedMs);
            //$("#optimizStatus")[0].innerHTML = combosComputed+"/"+combosTotal+" ("+Math.round(combosComputed*100/combosTotal)+"%)   "+timeStr;
            $("#optimizStatusText")[0].innerHTML = timeStr + "\nВыполнено:  " + combosComputed + "/" + combosTotal + " (" + Math.round(percent) + "%)"
                + "\nСкорость:  " + lib.DblToStrAuto(combosComputed / elapsedMs * 1000, -1) + " прох./сек"
                + (!stopped && combosComputed > 0 && elapsedMs > 2000 && !isGenetic ? "\nОсталось: ~" + Time.durationToStr((combosTotal - combosComputed) / combosComputed * elapsedMs) : "");
        }
        let timerId = setInterval(onOptimizTimer, 50);
        /**@type{{paramValue,profit}[][]}
         */
        let profitsByParamValue = [];
        let threadCount = Number($threadsCountInput.val());
        //console.log(geneticConfig);  return;
        //alert(threadCount);  return;
        let localTimeMs = 0;
        try {
            await MyTester.Optimizate({ symbolInfo: symInfo, strategy: strategyObj }, tf, params, config, threadCount, geneticConfig, OnGetResult, cancelToken); //, testerSpeedMutable);
        }
        finally {
            clearInterval(timerId);
        }
        onOptimizTimer(true);
        // Показать кнопки в таблице результатов
        $(".optResultButtonCell").show(); //$("#optimizTableBody button").show();
        /**@param {number[]} params
         * @param {ITradeStatistics} result
         * @param {number[]} equityValues
         */
        async function OnGetResult(params, result, equityValues) {
            combosComputed++;
            console.log("got result:");
            console.log("params: " + [...params].join(",") + "\nprofit: " + (result === null || result === void 0 ? void 0 : result.resultProfit));
            if (result.resultProfit > 0 || !$onlyPositiveResultsCheckBox[0].checked)
                if (result)
                    AddResultToOptimizTable(params, result, equityValues);
            for (let i = 0; i < params.length; i++) {
                if (!profitsByParamValue[i])
                    profitsByParamValue[i] = [];
                profitsByParamValue[i].push({ paramValue: params[i], profit: result.resultProfit });
            }
            //await lib.sleepAsync(0);
            if (0)
                if (Date.now() - localTimeMs > 50) {
                    await lib.sleepAsync(0);
                    //$('.tsort').tsort();
                    // $("#optimizTable").tablesorter();
                    localTimeMs = Date.now();
                }
        }
        // Сортируем значения каждого параметра по прибыли
        for (let paramData of profitsByParamValue)
            paramData.sort((a, b) => a.profit - b.profit);
        let div = $("#optimizParamRangesDiv");
        div.empty();
        for (let i = 0; i < params.length; i++) {
            let paramName = strategyObj.params[i].name;
            let valueId = "rangeVal" + i;
            let rangeId = "optimizInputRange" + i;
            div.append(`
						<div><label>${paramName}
						<div>
							<div id="${valueId}" class="rangeVal"></div>
							<input id="${rangeId}" class="optimizInputRange" type="range">
						</div>
						</label></div>
					`);
            let rangeElem = $("#" + rangeId)[0];
            rangeElem.oninput = () => {
                let paramDatas = profitsByParamValue[i];
                if (!paramDatas || paramDatas.length === 0)
                    return;
                const value = +rangeElem.value;
                const min = rangeElem.min || 0;
                const max = rangeElem.max || 100;
                const ratio = (value - min) / (max - min);
                let iData = Math.round(ratio * (paramDatas.length - 1));
                iData = paramDatas.length - 1 - iData; // В обратном порядке, т.к. убытки у нас справа, а прибыли слева
                displayRangeValue(rangeElem, $("#" + valueId)[0], paramDatas[iData].paramValue + "");
            };
            //<input class="optimizInputRange" type="range" oninput="displayValue(this, document.getElementById('${spanId}'))">
        }
    }
    async function _Test() {
        var _a;
        //$('#startBtn').prop( "disabled", true );
        console.log("Test");
        let strategyName = $strategy.val();
        let startDate = $startDate.val();
        let endDate = $endDate.val();
        let tfName = $tf.val();
        let comission = { value: parseFloat($fee.val()), unit: $1("#feeType").val() };
        // src="./Tester.js">
        //import * as aaa from "./Tester.js";
        //alert("!");
        //console.log(stategiesMap.keys());
        let strategy = stategiesMap[strategyName]; //Strategy_MA;
        if (!strategy)
            throw ("Неизвестная стратегия: " + strategyName);
        let paramElements = $('#parameters tbody .inputParamValue');
        if (paramElements.length !== strategy.params.length) {
            throw ("Wrong parameters count: " + paramElements.length + " != " + strategy.params.length);
        }
        //alert(paramElements.length);
        let params = [];
        for (let i = 0; i < paramElements.length; i++) {
            let val = parseFloat(paramElements[i].value + "");
            if (isNaN(val)) {
                alert("Parameter " + i + ": wrong value: " + val);
                return;
            }
            params.push(val);
        }
        let config = new CTesterConfig(new Date(startDate), new Date(endDate), 0);
        let symbols = selectedSymbols();
        let $mainQuotesChartParent = $1("#quotesChartParent");
        let $equityChartName = $("#equityChartName");
        let isMultiSym = symbols.length > 1;
        if (isMultiSym)
            $mainQuotesChartParent.hide();
        else
            $mainQuotesChartParent.show();
        $equityChartName[0].innerText = isMultiSym ? "Equity Total" // for "+symbols.length+" symbols"
            : "Equity for " + symbols[0] + ", " + tfName + ", " + strategyName;
        let tradesTable_useSymbolColumn = selectedSymbols().length > 1;
        InitTradeTable(tradesTable_useSymbolColumn);
        ClearUserCharts();
        $priceChart.empty(); //innerHTML= "";
        $equityChart.empty(); //.innerHTML= "";
        let colorGenerator = lib.colorGenerator();
        let equityColors = [EquityChartColor];
        let multiEquityChart;
        if (isMultiSym) {
            equityColors = symbols.map((symbol) => {
                for (let rgb; (rgb = colorGenerator.next().value) != null;)
                    if (!lib.isSimilarColors(rgb, EquityChartColor) && !lib.isSimilarColors(rgb, [0, 0, 0]))
                        return (([r, g, b]) => "rgb(" + r + "," + g + "," + b + ")")(rgb);
                throw "color is not defined";
            });
            SetLegendToChart($equityChart[0], "Symbols", (element) => alert(element.value));
            //for(let symbol of symbols)
            //AddLegendItemToChart($equityChart[0], symbol, false, equityColors[i]);
            multiEquityChart = CreateMyChartArea($equityChart[0]);
            SetChartAutoResize(multiEquityChart, $("#chartsDiv")[0]);
        }
        let _mainChartSeries;
        //const $statisticTableBody = $("#statisticsTableBody");
        //$statisticTableBody.empty();
        function addStatisticsTable(stats, scrollChartFunc) {
            AddNewStatisticTableFromBody(createStatisticsTableBody(stats, scrollChartFunc));
        }
        function ClearStatisticsTables() { $("#statisticsTables").empty(); }
        ClearStatisticsTables();
        const mainStatsTable = isMultiSym ? AddNewStatisticTableFromBody(null) : undefined;
        const $testProgressBar = $("#testProgressBar");
        $testProgressBar[0].value = 0;
        //setInterval(()=>testProgressBar)
        // Функция отображения прогресса выполнения
        function setTesterProgress(percent) { $testProgressBar[0].value = percent; }
        let percents = [];
        function onSymbolTesterProgress(iSymbol, percent) {
            var _a;
            let delta = percent - ((_a = percents[iSymbol]) !== null && _a !== void 0 ? _a : 0);
            percents[iSymbol] = percent;
            $testProgressBar[0].value += delta / selectedSymbols().length;
        }
        let symTradeArrays = [];
        let symScrollers = [];
        //function addSymbolTradesToTable(iSymbol :number, trades :readonly TradeData[], scroller :(time :string)=>void) {
        function SaveSymbolTrades(iSymbol, trades, scroller) {
            var _a;
            let symTrades = (_a = symTradeArrays[iSymbol]) !== null && _a !== void 0 ? _a : (symTradeArrays[iSymbol] = []);
            symTrades.push(...trades);
            //symTrades.push(...trades);
            symScrollers[iSymbol] = scroller;
            //AddTradesToTable(trades.map((trade)=>({...trade, symbol: symbols[iSymbol]})), scroller);
            //SyncTrades();
        }
        function SyncTrades() {
            let [minTime, minTimeArray, index] = [null, null, -1];
            let tradesTotal = 0;
            for (let [i, trades] of symTradeArrays.entries())
                if (!(trades === null || trades === void 0 ? void 0 : trades.length))
                    if (trades != null)
                        return; // пока нет сделок по символу
                    else
                        continue; // иначе символ уже не используется
                else {
                    tradesTotal += trades.length;
                    if (trades[0] && (!minTime || toTime(trades[0].time) <= minTime))
                        [minTime, minTimeArray, index] = [toTime(trades[0].time), trades, i];
                }
            if (!minTimeArray)
                return;
            let [firstTrade] = minTimeArray.splice(0, 1);
            AddTradesToTable([Object.assign(Object.assign({}, firstTrade), { symbol: symbols[index] })], symScrollers[index]);
            if (tradesTotal > 1)
                SyncTrades();
        }
        //let sumEquity : CTradeBar[] = [];
        let results = [];
        console.log("Запускаем тестирование по", symbols.length, "символам: ", symbols.join(", "));
        let preloadImage = !$visualCheckbox[0].checked ? ShowPreloaderImage($equityChart[0]) : null; //.parent()[0]);
        //for(let syminfo of )
        try {
            let testerInfos = [];
            for (let [iSymbol, symbol] of symbols.entries()) {
                //let symbol = symbols[0]; //$symbols.val();
                let tickSize = 1; //symInfo.tickSize= 1;
                let quoteCurrency = "USD"; ////symInfo.quoteCurrency= "USD";
                let priceInfo = (_a = GetSymbolQuotesGetter(symbol, tickSize, quoteCurrency)) !== null && _a !== void 0 ? _a : (() => { throw "Failed to get QuotesGetter"; })();
                let symInfo = {
                    name: symbol,
                    lotSize: 1,
                    comissionPerSide: comission,
                    priceInfo
                };
                let stratInfo = createStrategyObject(strategy, params, TF.get(tfName));
                let testerInfo = new CTesterInfo(symInfo, stratInfo, config);
                testerInfos.push(testerInfo);
            }
            // предварительно подгружаем историю по всем символам
            if (isMultiSym) {
                $equityChartName[0].innerText = "Подгрузка истории по " + symbols.length + " символам";
                await Promise.all(testerInfos.map((info) => LoadSymbolQuotesForTesterInfo(info)));
                $equityChartName[0].innerText = "Тестирование по " + symbols.length + " символам";
            }
            for (let [iSymbol, symbol] of symbols.entries()) {
                let testerInfo = testerInfos[iSymbol];
                //defaultSymbol : null,
                //defaultTF : tf
                /** Функция добавления сделки в таблицу
                 * @param{TradeData[]} trades
                 * @param{function(time :string)} scroller  // функция прокрутки к выбранной дате на графике
                 */
                function addTradesToTable(trades, scroller) {
                    SaveSymbolTrades(iSymbol, trades, scroller);
                    // _scrollChartFunc= scroller;
                    // AddTradesToTable(trades, scroller);
                }
                function onTesterProgress(percent) { onSymbolTesterProgress(iSymbol, percent); }
                let [priceChartElement, equityChartElement] = symbols.length == 1 ? [$priceChart[0], $equityChart[0]]
                    : [AddQuotesChart(symbol + ", " + tfName), AddEquityChart(symbol + ", " + tfName + ", " + strategyName)];
                if (priceChartElement != $priceChart[0])
                    priceChartElement.style.marginTop = "30px";
                else
                    $priceChartName[0].innerText = symbol + ", " + tfName;
                let preloadImg = equityChartElement != $equityChart[0] ? ShowPreloaderImage(equityChartElement) : null;
                //let [result, equity];
                function getSpeed() { return testerSpeedMutable.value; }
                //=== Функция тестирования //====
                let result = await MyTester.Test(testerInfo, priceChartElement, equityChartElement, addTradesToTable, getSpeed, onTesterProgress)
                    .finally(() => preloadImg === null || preloadImg === void 0 ? void 0 : preloadImg.remove());
                await lib.sleepAsync(0);
                results.push(result);
                console.log("Statistics:", result ? result[0] : undefined);
                if (result)
                    addStatisticsTable(result[0], symScrollers[iSymbol]);
                if (isMultiSym && result) {
                    let color = equityColors[iSymbol];
                    let series;
                    AddLegendItemToChart($equityChart[0], symbol, false, equityColors[iSymbol], (el) => {
                        if (series)
                            multiEquityChart.removeSeries(series);
                        series = null;
                        if (el.checked) {
                            //if (series) series.remove();
                            series = multiEquityChart.addLineSeries({
                                color: color,
                                lineWidth: 1,
                            });
                            let equity = result[1];
                            //let range = { from: Number.MAX_VALUE, to: Number.MIN_VALUE, ...multiEquityChart.timeScale().getVisibleRange() };
                            series.setData(equity.map((bar) => function () { return { time: bar.time, value: bar.close }; }()));
                            if (equity.length > 0 && results.length == 1) // расчитываем только при первом элементе
                                multiEquityChart.timeScale().setVisibleRange({ from: equity[0].time, to: equity[equity.length - 1].time }
                                //{from: Math.min(range.from.valueOf(), equity[0].time.valueOf()), to: Math.max(range.to.valueOf(), equity[equity.length-1].time.valueOf())}
                                );
                        }
                    });
                    DrawSumEquity(false); //$testProgressBar[0].value); //percents[iSymbol]);
                }
                if (!_testing || testerSpeedMutable.value == -1)
                    break;
                //symTradeArrays[iSymbol] = null;
                //sumEquity.push(...equity);
            }
        }
        finally {
            preloadImage === null || preloadImage === void 0 ? void 0 : preloadImage.remove();
        }
        // Сортируем сделки от символов и выводим в таблицу
        let allTrades = [];
        for (let [i, trades] of symTradeArrays.entries())
            for (let trade of trades !== null && trades !== void 0 ? trades : [])
                allTrades.push(Object.assign(Object.assign({}, trade), { symbol: symbols[i], symIndex: i }));
        function toTime(t) { return typeof t == "string" ? new Date(t) : t; }
        //for(let [i,trades] of symTradeArrays.entries()) allTrades.push([...trades?.map((trade)=>({{...trade}, symbol: symbols[i], symIndex: i}))]);
        allTrades.sort((a, b) => toTime(a.time) > toTime(b.time) ? 1 : toTime(a.time) < toTime(b.time) ? -1 : 0); //a.symIndex - b.symIndex );
        if (symbols.length == 1)
            AddTradesToTable(allTrades, symScrollers[0]);
        else
            for (let trade of allTrades)
                AddTradesToTable([trade], symScrollers[trade.symIndex]);
        //SyncTrades();
        //console.log("allTrades:",allTrades);
        function DrawSumEquity(finished = false) {
            let barsArrays = results.map((result) => result[1]);
            let sumEquity = isMultiSym ? GetSumEquity(barsArrays) : barsArrays[0];
            //let chart= DrawCandleChart(sumEquity, $equityChart[0])[0];
            let [r, g, b] = colorStringToRGBA(EquityChartColor);
            let alpha = finished ? 1 : (results.length / symbols.length) ** 2;
            let color = "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
            //console.log("percent= "+percent,"  alpha="+alpha);
            //let finished = percent==100;
            if (_mainChartSeries)
                multiEquityChart.removeSeries(_mainChartSeries);
            let series = multiEquityChart.addLineSeries({
                color: color,
                lineWidth: isMultiSym ? 2 : 1,
                //lineStyle: finished ? "Solid" : "Dotted"
            });
            _mainChartSeries = series;
            series.setData(sumEquity.map((bar) => function () { return { time: bar.time, value: bar.close }; }()));
            if (sumEquity.length)
                multiEquityChart.timeScale().setVisibleRange({ from: sumEquity[0].time, to: sumEquity[sumEquity.length - 1].time });
            $equityChartName[0].innerText =
                results.length == symbols.length
                    ? "Equity Total for " + symbols.length + " symbols"
                    : "Equity Total for " + results.length + "/" + symbols.length + " symbols";
            // SetLegendToChart($equityChart[0], "Symbols", (element)=>alert(element.value));
            // for(let symbol of symbols)
            // 	AddLegendItemToChart($equityChart[0], symbol, false, equityColors[0]);
            return sumEquity;
        }
        let sumEquity = isMultiSym ? DrawSumEquity(true) : results[0][1];
        let sumStats = isMultiSym ? new TradeStatistics(sumEquity) : results[0][0];
        if (isMultiSym)
            console.log("TotalEquity:", [sumEquity.map(function (bar) { return { time: bar.time, close: bar.close, volume: bar.volume, comission: bar.comission }; })]);
        let scrollChartFunc = symScrollers[0];
        if (isMultiSym)
            scrollChartFunc = (time) => scrollChartToTime(multiEquityChart, new Date(time + " GMT"));
        //console.log(mainStatsTable!=null);
        mainStatsTable === null || mainStatsTable === void 0 ? void 0 : mainStatsTable.append(createStatisticsTableBody(sumStats, scrollChartFunc));
        console.log("finish");
        //addStatisticsTable(sumStats, scrollChartFunc ? (time)=>scrollChartFunc!(time) : undefined);
        // if (symbols.length>1)
        // 	for(let [i, symbol] of symbols.entries())
        // 		if (results[i])
        // 			addStatisticsTable(results[i][0], symScrollers[i]);
        // 		else break;
        //document.getElementById(quotesChartName).innerText= symbol;
        //document.getElementById(quotesChartName).innerHTML= symbol;
        // $quotesChartName[0].innerText = symbol+", "+tfName;
        // $("#equityChartName")[0].innerText= "Equity for "+symbol+", "+tfName+", "+strategy;
        //alert($("#quotesChartName").text());
        //alert("!");
        //alert(params);
        //let signaller= strategyInfo.getSignaller(params);
        //Tester.RunSignallerTest(signaller, params, 5);
        //alert(symbol+"  "+strategy+"  "+startDate);
    }
}
//Test();
/**
 * @param{HTMLInputNumberElement} rangeElement
 * @param{HTMLElement} valueElement
 * @param{string} valueStr
 */
function displayRangeValue(rangeElement, valueElement, valueStr) {
    var _a, _b;
    const inp = rangeElement;
    const value = +inp.value;
    const min = (_a = inp.min) !== null && _a !== void 0 ? _a : 0;
    const max = (_b = inp.max) !== null && _b !== void 0 ? _b : 100;
    const width = inp.offsetWidth;
    const offset = -20;
    const percent = (value - min) / (max - min);
    const pos = percent * (width + offset); // - 40;
    //const pos = percent * (width);
    valueElement.innerHTML = valueStr !== null && valueStr !== void 0 ? valueStr : value + "";
    //console.log("percent="+percent,"width="+width, "offset="+offset," pos="+pos)
    valueElement.style.marginLeft = pos + 'px';
}
function str(n) { return n <= 9 ? '0' + n : '' + n; }
/**
 * @param{Date} date
 * @returns {string}
 */
function timeToStr_yyyymmdd_hhmm(date) { return date.getUTCFullYear() + "-" + str(date.getUTCMonth() + 1) + "-" + str(date.getUTCDate()) + " " + str(date.getUTCHours()) + ":" + str(date.getUTCMinutes()); }
function createStatisticsTableBody(stats, scrollChartFunc) {
    let statBody = document.createElement("tbody");
    setStatisticsTableToBody($(statBody), stats, scrollChartFunc ? (time) => scrollChartFunc(time) : undefined);
    return statBody;
}
// /** @param {TradeStatistics} stat
//  * @param {(Date)=>void} onClickTime
//  */
function setStatisticsTableToBody(tableBody, stat, onClickTime) {
    tableBody.empty();
    if (!stat)
        return;
    function push(name, value, value2, unit) {
        if (unit)
            unit = " " + unit;
        else
            unit = "";
        function valToStr(val) { return val instanceof Date ? timeToStr_yyyymmdd_hhmm(val) : typeof val == "number" ? lib.DblToStrAuto(val, -4) + unit : val; }
        let valStr = valToStr(value);
        let tr = document.createElement("tr");
        if (value == undefined)
            valStr = "-";
        else if (value2 != undefined)
            valStr += " &nbsp;(" + "<a style='font-size:small'>" + valToStr(value2) + "</a>" + ")";
        tr.innerHTML = `<td>${name}</td> <td>${valStr}</td>`;
        if (value2 instanceof Date) {
            let el = $(tr).children()[1];
            el.style.cursor = "pointer";
            if (onClickTime)
                el.onclick = () => onClickTime(value2); //_scrollChartFunc(value2.toString());
        }
        tableBody.append(tr);
        return $(tr).children()[1];
    }
    function push$(name, value, value2) { return push(name, value, value2, "$"); }
    push$("Прибыль", stat.resultProfit);
    push$("Максимум прибыли", stat.maxProfit, stat.maxProfitTime);
    push$("Минимум прибыли", stat.minProfit, stat.minProfitTime);
    push$("Макс. просадка ", stat.maxDrawdown, stat.maxDrawdownTime);
    push("Всего сделок", stat.trades);
    push("Число покупок", stat.buys);
    push("Число продаж", stat.sells);
    push("Всего лотов", stat.totalVolumes);
    push("Лотов на покупку", stat.buyVolumes);
    push("Лотов на продажу", stat.sellVolumes);
    push$("Комиссии", stat.comissions);
    push$("Сред. профит на сделку", stat.avrgProfitPerTrade);
    push$("Сред. профит на лот", stat.avrgProfitPerVolume);
    push("Сред. длительность позиции", Time.durationToStr(stat.avrgTradeDuration_ms));
    push("Фактор восстановления", stat.recoveryFactor);
    push("Коэффициент Шарпа", stat.sharpCoef);
}
function removePopupMessage(popupElement) { var _a; (_a = (popupElement !== null && popupElement !== void 0 ? popupElement : currentPopup())) === null || _a === void 0 ? void 0 : _a.parentElement.parentElement.remove(); } //$(".popup")?.remove(); }
function showPopupMessage(element, text, timeout_ms = 0, hideOnClickOutside = true, hideOnClickElement = true) {
    var _a, _b;
    removePopupMessage();
    let span = document.createElement('span');
    span.classList.add("popupParent");
    let e = window.event;
    if (!element) {
        let posX = (_a = e === null || e === void 0 ? void 0 : e.pageX) !== null && _a !== void 0 ? _a : 0;
        let posY = (_b = e === null || e === void 0 ? void 0 : e.pageY) !== null && _b !== void 0 ? _b : 0;
        element = document.body;
        span.style.left = posX + "px";
        span.style.top = posY + "px";
        span.style.position = "absolute";
        //console.log(posX, posY)
    }
    span.innerHTML = '<div class="popup" style="top:3pt;"><div class="popuptext" id="myPopup" style="width:max-content;margin-left:-20pt;padding:5px">' + text + '</div></div>';
    element.appendChild(span); //'<div className="popuptext" id="myPopup">A Simple Popup!</div>');
    let myPopup = $("#myPopup")[0];
    myPopup.classList.toggle("show");
    if (timeout_ms)
        setTimeout(() => removePopupMessage(myPopup), timeout_ms);
    myPopup.hideOnClickOutside = hideOnClickOutside;
    myPopup.ignoreClickElement = hideOnClickElement ? undefined : element;
    myPopup.event = e;
    return myPopup;
}
function currentPopup() { var _a; return (_a = $("#myPopup")) === null || _a === void 0 ? void 0 : _a.get(0); }
document.onclick = (e) => {
    let popup = currentPopup();
    //console.log(popup.event==window.event
    if (popup && e.target != popup && popup.hideOnClickOutside && e.target != popup.ignoreClickElement && popup.event != e)
        removePopupMessage();
};
