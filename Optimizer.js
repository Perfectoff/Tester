import { CancelablePromise } from "./Trader.js";
import { getSignaller } from "./Strategy.js";
import * as lib from "./Common.js";
//import { Genetic } from 'async-genetic';
import { Genetic } from './async-genetic_my/genetic.js';
import { ByteStreamR } from "./ByteStream.js";
import { CTesterWorker, CTradeHistory, RunSignallerTest, RunTest } from "./Tester.js";
import { TradeStatistics } from "./TradeStatistics.js";
export * from "./Tester.js";
//import {Strategy_MA} from "./Strategy_MA";
//console.log(S1,"  ",v);
export { CMyWorker } from "./MyWorker.js";
export { JSON_clone } from "./MyWorker.js";
//function promiseReverse<T>(promise : Promise<T>) : Promise<T> { return new Promise((resolve, reject) => Promise.resolve(promise).then(reject, resolve)); }
function promiseReverse(promise) { return new Promise((resolve, reject) => promise.then(reject, resolve)); }
function PromiseAny(promises) { return promiseReverse(Promise.all([...promises].map(promiseReverse))); }
function PromiseAnyWithIndex(promises) {
    return PromiseAny([...promises].map((promise, i) => new Promise((resolve, reject) => promise.then((value) => resolve([value, i]), reject))));
}
let __FreeWorkers = new Set;
class CTesterAgent {
    constructor(id = 0) {
        var _a, _b;
        this.worker = ((_b = (_a = __FreeWorkers.values()) === null || _a === void 0 ? void 0 : _a.next()) === null || _b === void 0 ? void 0 : _b.value) || new CTesterWorker();
        this.tasks = [];
        this.id = id;
    } // this.worker= __FreeWorkers.values()?.next()?.value || new CMyWorker('tester.js'); }
    //private _taskCount = 0;
    get taskCount() { return this.tasks.length; } // this._taskCount; }
    async RunTest(strategy, params, tf, symbol, testerConfig) {
        //let localTime= Date.now();
        //let worker= new CMyWorker('tester.js');
        let worker = this.worker;
        if (!worker)
            throw ("Worker is not defined"); //{ console.log("Worker is not defined");  return null; }
        //console.log("Worker creation duration: ",Date.now()-localTime);
        //let tf= TF.H1;
        //let sym= cloneFull(symbol); //.name);  (symbol).quotesHistory.minTf.name;
        //console.log(sym);
        //alert(sym.name);
        //let symJSON= JSON.stringify(symbol);
        let taskInfo = { symbol: symbol, strategyName: strategy === null || strategy === void 0 ? void 0 : strategy.name, strategyParams: params, tfName: tf.name, testerConfig: testerConfig };
        //console.log(sym.name);
        //return await worker.send({strategy, symbol, testerConfig}) as Promise<CTradeHistory>;
        //print("First");
        //console.log("@@@@ Agent",this.id,"waiting");
        let time = Date.now();
        console.log("==== Sending to worker #" + this.id + "... Time=", time);
        //task.strategyName= this.id+"";
        //taskInfo["sentTime"]= Date.now();
        //task= { symbol: null,  strategyName: null,  strategyParams: params,  testerConfig : null };
        //await worker.send(task);
        //return true;
        let task = CancelablePromise.resolve(worker.send(taskInfo));
        this.tasks.push(task); //this._taskCount++;
        let resultData = await task.finally(() => { this.tasks.splice(this.tasks.indexOf(task), 1); }); // Удаляем первую задачу из списка по завершении  //this._taskCount--;
        let result;
        if (resultData.isBinary) {
            let buffer = resultData.data;
            let rstream = new ByteStreamR(buffer);
            result = rstream.readNullable(CTradeHistory);
        }
        else {
            let json = resultData.data;
            result = CTradeHistory.fromParsedJSON(json);
        }
        let elapsed = Date.now() - time;
        //as Promise<CTradeHistory>;
        //let json= await worker.send(taskInfo) as ParsedUrlQueryInputMy;
        //json= JSON_clone(new CTradeHistory);
        //print("==== Receive from worker #"+this.id+". Time=",Date.now(),"  Full duration:",Date.now()-time);
        //console.log("@@@@ Agent",this.id,"continue");
        //console.log("Second");
        //return json;
        //print({...json});
        //print(result);
        ///console.log("@@@@ ok",this.id);
        return { task: taskInfo, tradeHistory: result, agent: this, testingDuration: resultData.duration, fullDuration: elapsed };
    }
    deinit() {
        //__FreeWorkers.add(this.worker);  this.worker=null;
        this.worker.terminate();
        for (let task of this.tasks)
            task.cancel("Cancel");
        //this.tasks.length = 0;
    }
}
//declare type Promise<T>; // = Promise<T>; // { }
class CTesterAgents {
    constructor(maxAgents = 2) {
        this.agents = [];
        this.tasks = [];
        //private _freeAgent : CTesterAgent; // _freeIndex : number;
        this.freeAgentsSet = new Set;
        this._ipass = 0;
        this.maxAgentsCount = maxAgents;
        console.assert(maxAgents >= 0);
    } // this._freeIndex=-1; }
    getAgentWithMinimumTasks() {
        let taskCount = Number.MAX_VALUE;
        let agent;
        for (let ag of this.agents)
            if (ag.taskCount <= taskCount) {
                agent = ag;
                taskCount = ag.taskCount;
            }
        return agent;
    }
    agentMinTaskCount() { if (this.agents.length < this.maxAgentsCount)
        return 0; return this.getAgentWithMinimumTasks().taskCount; }
    tasksCount() { return this.tasks.length; }
    pushTask(strategy, params, tf, symbol, testerConfig, onResult) {
        //let index= this._freeIndex;
        //let agent : CTesterAgent;
        //if (index==-1) index= this.agents.push(agent= new CTesterAgent) - 1;
        //else agent= this.agents[index];
        //if ()
        //let agent= this._freeAgent;
        //if (! agent) { agent= new CTesterAgent; }
        //this._freeAgent= null;
        let agent;
        let isNew = false;
        if (1) { // Выбираем агента с минимальным числом заданий, либо нового агента в пределах maxAgentsCount
            let bestAgent = this.getAgentWithMinimumTasks();
            if (!bestAgent || (this.agents.length < this.maxAgentsCount && bestAgent.taskCount > 0)) {
                this.agents.push(bestAgent = new CTesterAgent(this.agents.length));
                isNew = true;
            }
            agent = bestAgent;
        }
        else if (0) { // Выбираем свободного агента, иначе нового агента
            if (this.freeAgentsSet.size == 0) {
                agent = new CTesterAgent(this.agents.length);
                this.agents.push(agent);
                isNew = true;
            }
            else {
                agent = this.freeAgentsSet.values().next().value;
                this.freeAgentsSet.delete(agent);
            }
        }
        else { // Выбираем следующего агента по кругу
            let i = this._ipass % this.maxAgentsCount;
            console.log("Выбираем агента #" + i);
            agent = this.agents[i];
            if (!agent) {
                agent = this.agents[i] = new CTesterAgent(i);
                isNew = true;
            }
        }
        let [agentSymbol, agentStrategy, agentTesterConfig] = isNew ? [symbol, strategy, testerConfig] : [null, null, null];
        //if (!isNew) { strategy=null; symbol=null; testerConfig=null; }
        let task = agent.RunTest(agentStrategy, params, tf, agentSymbol, agentTesterConfig);
        let passId = this._ipass;
        //console.log("Ok");
        //alert("!");
        if (onResult)
            task = task.then((result) => {
                //if (! result) return null;
                printDebug("Finished task #" + passId, " Duration full:", result.fullDuration, " Duration of test:", result.testingDuration);
                //print("tasks remain:  total=",this.tasks.length,"  byAgents: ",this.agents.map((agent)=>agent.taskCount).join(", "));
                onResult(result);
                return result;
            }); //, ()=>console.log("Task failed"));
        this._ipass++;
        //this.tasks[index]= task;
        this.tasks.push(task);
        //return task;
    }
    async popResult() {
        //let tasks= this.agents.map((agent)=>agent.)
        //if (this.tasks.length < this.maxAgentsCount)
        //return this.tasks.length;
        //let result= await PromiseAny(this.tasks);
        try {
            console.log("Waiting for any task to complete");
            let [result, index] = await PromiseAnyWithIndex(this.tasks);
            //console.log(!!this.tasks[0]);
            //this.tasks
            //let [result, index] = [await PromiseAny(this.tasks), 0];
            //console.log("Agent", result ? result.agent.id :"?", "result: ",result,"\ntask index: ",index);
            console.log("Remove task #" + index, " (agent #" + (result ? result.agent.id : "?") + ")");
            if (1)
                if (index != null) {
                    this.tasks[index] = this.tasks[this.tasks.length - 1];
                    let popped = this.tasks.pop();
                    //this.tasks.splice(index, 1);
                }
            this.freeAgentsSet.add(result.agent);
            return result;
        }
        catch (e) {
            console.log("catch: ", e);
            console.log("Task count:", this.tasks.length);
            throw (e);
        }
        //for(let i=0; i<this.tasks.length; i++) if (this.tasks[i].)
        //let z : JQueryPromise<CTradeHistory>;
        //z= this.tasks[1];
        //for (let i=0; i<this.maxAgentsCount; i++) if (this.tasks[i].state()=='resolved') return i;
        //return -1;
    }
    ////console.log("startWait ",this.tasks.length,"tasks"); console.log("endWait");
    async waitAll() { await Promise.all(this.tasks); this.tasks = []; for (let agent of this.agents)
        this.freeAgentsSet.add(agent); }
    clear() { for (let agent of this.agents)
        agent.deinit(); this.agents = []; this.tasks = []; this.freeAgentsSet.clear(); }
}
/*
class CTesterAgents2
{
    protected _agents = new CTesterAgents();

    pushTask(strategy :IStrategy, params :readonly number[], symbol :CSymbol, testerConfig :CTesterConfig, onResult :(CTaskResult)=>any) {
        this._agents.pushTask(strategy, params, symbol, testerConfig).then();
    }

    waitForTasksCount(count: number) { }

    waitForAll()
}
*/
/*
export async function Test()
{
    let workers= [];
    let tasks = [];
    let time= Date.now();
    let threadCount= 4;
    let isParallel= 0;
    console.log(isParallel ? "Параллельное вычисление: "+threadCount+" потоков" : "Одиночное вычисление");
    let sum=0;

    for (let n=0; n<240/threadCount; n++)
        if (! isParallel)
            sum += Calculate(threadCount);
        else {
            for (let i = 0; i < threadCount; i++) {
                let worker = n == 0 ? new CMyWorker("testWorker.js") : workers[i];
                if (n == 0) workers.push(worker);
                let task = worker.send(null);
                tasks.push(task);
                //if (i==0) console.log(n);
            }
            sum = (await Promise.all(tasks)).reduce((prev, curr)=>prev+curr);
        }
    console.log("Elapsed total:",Date.now()-time,"ms,  Sum=",sum);
}

onmessage = async function(ev : MessageEvent<any>) {
    let result = Calculate(1);
    postMessage(result);
}
*/
// Generate all combinations of array elements:  (cartesian)
function* __getCombinations(head, ...tail) {
    if (!head)
        return null;
    let remainder = tail.length ? __getCombinations(...tail) : [[]];
    for (let r of remainder)
        for (let h of head)
            yield [h, ...r];
}
function* getCombinations(head, ...tail) { yield* __getCombinations(head, ...tail); }
// test:
if (0)
    for (let c of getCombinations([0, 1], [0, 1, 2, 3], [0, 1, 2])) {
        console.log(...c);
    }
//function Optimizate1(paramDatas : IParamValues[]) : CTestResult[]
function Optimizate(item, paramDatas, testerConfig, marketData) {
    var _a;
    if (paramDatas.length != item.strategy.params.length) {
        console.error("Wrong parameters amount: ", paramDatas.length, "  Required: ", item.strategy.params.length);
        return null;
    }
    let combosTotal = 1;
    for (let paramData of paramDatas)
        combosTotal *= paramData.length;
    console.log("Total combinations: ", combosTotal);
    //console.log(paramDatas);
    //if (paramDatas.length>0)
    let combos = __getCombinations(...paramDatas);
    if (!paramDatas.length)
        combos = [[]];
    let results = new Array();
    if (!item.strategy.getTrader)
        throw ("Trader for " + item.strategy.name + " is not defined");
    let tf = (_a = testerConfig.tf) !== null && _a !== void 0 ? _a : (() => { throw "tf is undefined"; })();
    for (let params of combos) {
        console.log(...params);
        let trader = item.strategy.getTrader({ params, tf });
        if (!trader)
            continue;
        let result = RunTest(trader, testerConfig, marketData);
        if (!result)
            continue;
        results.push(result);
    }
    return results;
}
//Optimizate1( [[1,2,3],[4,5,6]]);
//Optimizate1( undefined, [[1,2,3],[4,5,6]], undefined);
/*
function Optimizate(items : [{symbol : CSymbol,  strategy : IStrategy}],  testerConfig : CTesterConfig) : CTestResult[]
{
    let allResults = new Array<CTestResult>();
    for(let item of items) {
        let results = Optimizate1(item, testerConfig);
        allResults = allResults.concat(results);
    }
    return allResults;
}
*/
//const print= console.log;
const oldLog = console.log;
function print(...args) { oldLog(...args); }
// @ts-ignore
print = oldLog;
function printDebug(...args) { console.log(...args); }
// @ts-ignore
printDebug = console.log;
class GeneticBaseParams {
    constructor() {
        this.populationSize = 250;
        this.crossoverProbability = 0.9;
        this.mutationProbability = 0.2;
    }
}
function myGeneticAlgorithm(gensDatas, fitnessFunction, geneticParams, fittestNSurvives = 1, threadCount) {
    // Создаём мэпы позиций значений генов
    let posMaps = [];
    for (let i = 0; i < gensDatas.length; i++) {
        posMaps[i] = new Map;
        for (let j = 0; j < gensDatas[i].length; j++)
            posMaps[i].set(gensDatas[i][j], j);
    }
    function crossoverFunction(mother, father) {
        // two-point crossover
        let son = [], daughter = [];
        for (let i = 0; i < mother.length; i++) {
            let [parent1, parent2] = (Math.random() >= 0.5) ? [father, mother] : [mother, father];
            son.push(parent1[i]);
            daughter.push(parent2[i]);
        }
        return [son, daughter];
    }
    function mutationFunction(srcGens) {
        // chromosomal drift
        let newGens = [];
        for (let i = 0; i < srcGens.length; i++)
            if (Math.random() < 0.5) { //geneticParams.mutationProbability) {
                let gen = srcGens[i];
                let pos = posMaps[i].get(gen); // позиция в исходном массиве значений данного гена
                let len = gensDatas[i].length;
                let odds = Math.random() - 0.5; // Перевес (от -0.5 до 0.5)
                odds *= Math.random(); // квадрат вероятности, чтобы приблизиться к нормальному распределению
                let limit = odds >= 0 ? len - 1 : 0;
                let newpos = pos + Math.round(Math.abs(limit - pos) * odds / 0.5);
                newGens[i] = gensDatas[i][newpos];
                if (newGens[i] == null) { // ! (newGens[i]>0)) {
                    console.error("i=" + i, "gen=" + gen, "pos=" + pos, "odds=" + odds, "newpos=", newpos, "allGens=", gensDatas[i]);
                    throw ("!!!");
                }
                //newGens[i]= gensDatas[i][Math.floor(Math.random() * gensDatas[i].length)];
            }
            else
                newGens[i] = srcGens[i];
        return newGens;
    }
    function randomFunction() {
        let gens = [];
        for (let i = 0; i < gensDatas.length; i++)
            gens[i] = gensDatas[i][Math.floor(Math.random() * gensDatas[i].length)];
        return gens;
    }
    return new Genetic({
        mutationFunction,
        crossoverFunction,
        fitnessFunction,
        randomFunction,
        populationSize: geneticParams.populationSize,
        crossoverProbability: geneticParams.crossoverProbability,
        mutateProbability: geneticParams.mutationProbability,
        fittestNSurvives,
        threads: threadCount
    });
}
async function myGeneticSolve(genetic, maxBadExpochs = 5) {
    const GENERATIONS = Number.MAX_VALUE;
    const popSize = genetic.options.populationSize;
    genetic.seed();
    let _worseResult;
    let badEpochs = 0;
    let oldPopulation;
    for (let i = 0; i <= GENERATIONS; i++) {
        console.group("Generation", i + ":  populationSize=", i > 0 ? genetic.currentPopulation.length : genetic.options.populationSize);
        await genetic.estimate(); // Расчёт поколения
        //if (cancelToken?.isCancelled()) break;
        let worseResult = genetic.stats.minimum; //genetic.currentPopulation[genetic.currentPopulation.length-1].fitness;
        let avrgResult = genetic.stats.mean;
        print("best result:", genetic.stats.maximum);
        print("average result:", avrgResult);
        print("worst result:", worseResult);
        function isArraysEqual(array1, array2) {
            return array1.length == array2.length && array1.every((x, index) => x == array2[index]);
        }
        if (oldPopulation)
            if (true) { //genetic.currentPopulation.find((value,index)=> value.fitness < oldPopulation[index].fitness)) {
                //print("Результаты ухудшились. Возвращаем прошлое поколение");
                let newPop = [...oldPopulation, ...genetic.currentPopulation].sort((a, b) => -Math.sign(a.fitness - b.fitness));
                let ndublicates = 0;
                if (0)
                    for (let n = newPop.length - 2; n >= 0; n--)
                        if (isArraysEqual(newPop[n].entity, newPop[n + 1].entity)) {
                            newPop.splice(n + 1, 1);
                            ndublicates++;
                        }
                if (ndublicates > 0)
                    console.log("Removed " + ndublicates + " dublicates");
                genetic.currentPopulation = newPop.slice(0, popSize); //Math.max(newPop.length-popSize, 0)); //newPop.length/2);
                //worseResult= _worseResult;
            }
        oldPopulation = [...genetic.currentPopulation];
        worseResult = oldPopulation[oldPopulation.length - 1].fitness;
        genetic.breed(); // Кроссоверы и мутации
        console.groupEnd();
        //if (_worseResult!=null) console.assert(worseResult>=_worseResult);
        if (worseResult <= (_worseResult !== null && _worseResult !== void 0 ? _worseResult : Number.MIN_VALUE))
            if (badEpochs < maxBadExpochs) {
                badEpochs++;
                continue;
            }
            else
                break;
        badEpochs = 0;
        _worseResult = worseResult;
    }
    //console.log("Results:\n",genetic.currentPopulation); //genetic.best(100));
}
export class CMyGeneticParams {
    constructor() {
        this.populationSize = 0;
        this.crossoverProbability = 0;
        this.mutationProbability = 0;
        this.badEpochs = 0;
        this.minTradesCount = 0;
        this.criterio = "profit";
    }
}
export function getCriterioFunction(criterio) {
    if (criterio == "profit")
        return ((data) => data.length > 0 ? data[data.length - 1].close : 0);
    if (criterio == "sharpCoef")
        return ((data) => TradeStatistics.getSharpCoef(data));
    if (criterio == "recoveryFactor")
        return ((data) => TradeStatistics.getRecoveryFactor(data));
    throw ("Unknown criterio: " + JSON.stringify(criterio));
}
/*
let t= Date.now();
let workers= [new CMyWorker('tester.js'), new CMyWorker('tester.js')];
let tasks =[];
for (let i=0; i<100; i++) {
    if (1) if (i>1) { let [result,index]= await PromiseAnyWithIndex(tasks);  tasks.splice(index,1); }
    tasks[i] = workers[i % 2].send("aaa").then(() => console.log("Task", i, " finished"));
}
await Promise.all(tasks);//.catch(()=>alert('catch'));
console.log(Date.now()-t);
alert("Finish");
return;
*/
export async function OptimizateSimple(item, paramDatas, testerConfig, threadCount, useGenetic, onResult, cancelToken) {
    //await Test();  return true;
    var _a, _b, _c;
    if (paramDatas.length != item.strategy.params.length) {
        console.error("Wrong parameters amount: ", paramDatas.length, "  Required: ", item.strategy.params.length);
        return false;
    }
    let combosTotal = 1;
    for (let paramData of paramDatas)
        combosTotal *= paramData.length;
    print("Total combinations: ", combosTotal);
    //console.log(paramDatas);
    //if (paramDatas.length>0)
    let combos = __getCombinations(...paramDatas);
    if (!paramDatas.length)
        combos = [[]];
    let tf = item.symbol.quotesHistory.minTf;
    if (!tf) {
        console.log("Отсутствует история по ", item.symbol.name);
        return false;
    }
    let strategyTf = tf;
    //let results= new Array<CTestResult>();
    //let worker= new CMyWorker('tester.js');
    //worker.onMessage()
    let defaultTreadCount = (_a = navigator === null || navigator === void 0 ? void 0 : navigator.hardwareConcurrency) !== null && _a !== void 0 ? _a : 4;
    let maxThreads = isNaN(threadCount) ? defaultTreadCount : threadCount;
    if (useGenetic)
        maxThreads = 1;
    let useRemoteAndLocalAgentsTogether = 0;
    let remoteThreads = maxThreads;
    if (useRemoteAndLocalAgentsTogether && maxThreads > 1)
        remoteThreads--;
    //alert(maxThreads);  return;
    let agents = new CTesterAgents(remoteThreads);
    let stop = false;
    if (!window.Worker && maxThreads > 1) {
        console.error("Web worker is not supported!");
        maxThreads = 1;
    }
    print("Max threads:", maxThreads);
    if (0) {
        combosTotal = 1;
        combos = [...combos].slice(0, combosTotal);
        print("Тестируем только начальные " + combosTotal + " комбинации!!!"); // Оставляем только начальные элементы
    } //console.log("Задаём пустой onresult !!!");  onresult= (a :any, b:any)=>Promise.resolve(true);
    let agentUnloadMessagePrinted = false;
    let n = 0;
    let sum = 0;
    let workers = [];
    let Agents = [];
    let tasks = [];
    //let tt= setInterval(()=> { if (cancelToken?.isCancelled()==true) { print("STOPPED!!!");  stop=true; clearInterval(tt); } }, 50)
    let statusChecker = lib.createCancellableTimer(50, () => !(stop || (stop = (cancelToken === null || cancelToken === void 0 ? void 0 : cancelToken.isCancelled()) == true)));
    let cancellationChecker = promiseReverse(statusChecker);
    //setTimeout.__promisify__(0);
    let localTime0 = Date.now();
    let pauseTime = 0;
    //print("Отключаем onresult");  onresult= null;
    let allCombos;
    //let print= console.log;
    // @ts-ignore
    printDebug = () => { };
    console.log = printDebug;
    //await getCheckerOnTimer(()=>true, 100);
    //let cancellationChecker= setInterval(()=> stop||= cancelToken.isCancelled(), 50);
    let i = -1;
    let tasksDurationOfTesting = 0;
    let tasksDurationFull = 0;
    //let printCountTimeMs= Date.now();
    function onPassResult(params, result, duration) {
        n++;
        printDebug("Result:\n", result);
        if (duration != null)
            printDebug("Duration:", duration, "ms");
        tasksDurationOfTesting += duration;
        //if ((Date.now()-printCountTimeMs) > 2000) { print("Выполнено",Math.round(n/combosTotal*100)+"%");  printCountTimeMs= Date.now(); }
        if (onResult && result)
            return onResult(params, result) != false;
        return true;
    }
    // Запускаем таймер, печатающий прогресс выполнения
    let printingProgressTimer = function () {
        let _printed_n = -1;
        function printProgress() { if (n != _printed_n)
            print("Выполнено", Math.round(n / combosTotal * 100) + "%"); _printed_n = n; }
        return new lib.MyTimerInterval(2000, printProgress, printProgress);
    }();
    if (useGenetic) {
        let geneticParamsDefault = { populationSize: 250, crossoverProbability: 0.8, mutationProbability: 0.2, badEpochs: 5, minTradesCount: 1, criterio: "profit" };
        let geneticParams = typeof (useGenetic) == "boolean" ? geneticParamsDefault : Object.assign(Object.assign({}, geneticParamsDefault), useGenetic);
        print("Параметры генетики:", geneticParams);
        const criterioFunc = getCriterioFunction(geneticParams.criterio);
        async function computeFitnessFunction(params) {
            var _a;
            //if (map[params.join(",")]!=null) { console.error("!!!! "+params.join(","));  stop=false; throw("dublicate"); }
            let trader = getSignaller(item.strategy, params, strategyTf);
            if (!trader)
                return Number.MIN_VALUE;
            let localTime = Date.now();
            let result = await RunSignallerTest(trader, strategyTf, item.symbol, testerConfig); //, cancelToken);
            let length = result === null || result === void 0 ? void 0 : result.points.length;
            if (!result || length == null)
                return Number.MIN_VALUE;
            if (result.tradesCount < ((_a = geneticParams.minTradesCount) !== null && _a !== void 0 ? _a : 1))
                return Number.MIN_VALUE;
            let res = criterioFunc(result.EquityBars); //length > 0 ? result.points[length - 1].value.equity : 0;
            console.assert(res != undefined);
            //map[params.join(",")]= res;
            let ok = onPassResult(params, result, Date.now() - localTime);
            if (!ok)
                stop = true;
            if (Date.now() - pauseTime > 50) {
                await lib.sleepAsync(0);
                pauseTime = Date.now();
            }
            return res;
        }
        let resultsCache = new lib.ArrayMap;
        const mutex = new lib.Mutex();
        //let map= {};
        const STOPPED = "stopped";
        async function fitnessFunction(params) {
            var _a;
            //params= [...params];
            const unlock = await mutex.lock(); // Нужен монопольный доступ к объекту кэша
            if (stop) {
                unlock();
                throw STOPPED;
            }
            let res = resultsCache.get(params);
            //let res= map[params.join(",")];
            if (res !== undefined) {
                //print("Найдена комбинация ", params.join(","));
            }
            else {
                //print("Комбинация параметров: ", ...params);
                res = (_a = await computeFitnessFunction(params).catch((reason) => { unlock(); throw reason; })) !== null && _a !== void 0 ? _a : null;
                resultsCache.set(params, res);
                //print("Записана комбинация: ", ...params);
            }
            unlock();
            return res !== null && res !== void 0 ? res : Number.MIN_VALUE;
        }
        let paramValues = paramDatas.map((data) => [...data]);
        let popSize = Math.min(geneticParams.populationSize, Math.round(combosTotal / 3 + 30));
        if (popSize != geneticParams.populationSize)
            print("Меняем размер популяции на", popSize);
        geneticParams = Object.assign(Object.assign({}, geneticParams), { populationSize: popSize });
        let genetic = myGeneticAlgorithm(paramValues, fitnessFunction, geneticParams, 1); //, defaultTreadCount*10);
        try {
            await myGeneticSolve(genetic, geneticParams.badEpochs);
        }
        catch (e) {
            if (e !== STOPPED)
                throw e;
        }
    }
    //==========================================================
    else // if (!isGenetic)
        for (let params of combos) {
            i++;
            if (stop)
                break;
            printDebug("Комбинация параметров: ", ...params);
            //worker.postMessage({trader, item.symbol, testerConfig});
            //let result= await worker.send({trader, symbol: item.symbol, testerConfig});
            if (i % maxThreads == maxThreads - 1 && (maxThreads == 1 || useRemoteAndLocalAgentsTogether)) // && maxThreads==1) {
             { // Синхронный тест
                let localTime = Date.now();
                let trader = getSignaller(item.strategy, params, tf); //item.strategy.getSignaller({params, tf: strategyTf});
                if (!trader)
                    continue;
                let result = await RunSignallerTest(trader, strategyTf, item.symbol, testerConfig); //, cancelToken);
                //if (! await onresult(params, result)) return false;
                sum += (_c = (_b = result === null || result === void 0 ? void 0 : result.points[Math.round(Math.random() * (result.points.length - 1))]) === null || _b === void 0 ? void 0 : _b.value.equity) !== null && _c !== void 0 ? _c : 0;
                let ok = onPassResult(params, result, Date.now() - localTime);
                if (!ok)
                    stop = true;
                if (Date.now() - pauseTime > 50) {
                    await lib.sleepAsync(0);
                    pauseTime = Date.now();
                }
                continue;
                //let result = await RunSignallerTestAsync(item.strategy, params, item.symbol, testerConfig);
            }
            if (0) {
                let worker = workers[i % maxThreads];
                let isNew = false;
                if (!worker) {
                    worker = workers[i % maxThreads] = new CTesterWorker();
                    isNew = true;
                }
                //tasks.push(worker.send(null));
                //let agent : CTesterAgent = Agents[n % maxThreads];
                //if (!agent) agent= Agents[n % maxThreads]= new CTesterAgent(n % maxThreads);
                //tasks.push(agent.RunTest(null, params, null, null));
                let groupSize = 1;
                if (!allCombos)
                    allCombos = [...__getCombinations(...paramDatas)];
                //print(i, i%1);
                if (1)
                    if (i % groupSize == 0 || i == combosTotal - i) {
                        //print(i);
                        let datas = [];
                        for (let combo of allCombos.slice(i, Math.min(i + groupSize, combosTotal))) {
                            datas.push({ symbol: isNew ? item.symbol : null, tfName: tf.name, strategyName: item.strategy.name, strategyParams: combo, testerConfig: isNew ? testerConfig : null });
                            //datas.push({ symbol: null,  strategyName: null,  strategyParams: null,  testerConfig : null });
                            if (isNew)
                                isNew = false;
                        } //let taskInfos = { symbol: isNew ? item.symbol : null,  strategyName: item.strategy?.name,  strategyParams: params.slice(i, i+10),  testerConfig : testerConfig };
                        let task = worker.send(datas).then((results) => { n += datas === null || datas === void 0 ? void 0 : datas.length; });
                        tasks.push(task);
                    }
            }
            else
                //agents.pushTask(null, params, null, null);
                agents.pushTask(item.strategy, params, tf, item.symbol, testerConfig, (taskResult) => {
                    if (stop)
                        return;
                    //alert(111);
                    //print("!");
                    //tasksDurationOfTesting += taskResult.testingDuration;
                    tasksDurationFull += taskResult.fullDuration;
                    let result = taskResult.tradeHistory;
                    //console.log("Agent #" + taskResult.agent.id, "result:\n", result);
                    let ok = onPassResult(taskResult.task.strategyParams, result, taskResult.testingDuration); //let ok = onresult(taskResult.task.strategyParams, result);
                    if (!ok)
                        stop = true;
                });
            //if (agents.tasksCount()==maxThreads) await agents.waitAll();
            //return;
            let taskCount = agents.tasksCount();
            if (1)
                if (taskCount >= maxThreads * 50) //maxThreads)
                 {
                    if (1) {
                        print("Разгружаем очередь задач");
                        while (agents.agentMinTaskCount() > 10)
                            await agents.popResult();
                        print("Разгружено задач:", taskCount - agents.tasksCount());
                        //alert("!");
                    }
                    else if (!agentUnloadMessagePrinted) {
                        print("Отключаем ожидание разгрузки агента!");
                        agentUnloadMessagePrinted = true;
                    }
                }
            //console.log("^^^^^^^ ",n);
            //if (n==2) break;
            //results.push(result);
            //n++;
        }
    if (maxThreads > 1)
        print("Sending duration total:", Date.now() - localTime0, " ms.  Remain tasks:", agents.tasksCount());
    //alert(1);
    //print("Tasks: ",agents.tasksCount());
    //let cancellationCheckerTask= new Promise((resolve, reject)=> stop ? reject)
    //await Promise.all([...tasks]);  console.log("Elapsed total:", Date.now() - localTime0," ms");
    let allTasks = Promise.all([...tasks, agents.waitAll()]); //.catch(()=>alert("catch"));
    await Promise.race([allTasks, cancellationChecker]).catch((reason) => { console.error("Exception ", reason); throw (reason); }); //    console.log(reason));
    printingProgressTimer.stop();
    console.log = print;
    //alert(2);
    if (stop)
        print("STOPPED !");
    print("Computed", n, "combinations");
    //if (stop) alert("!!! 1");
    //clearInterval(cancellationChecker);
    //alert(2);
    agents.clear();
    if (threadCount == 1)
        print("sum=", sum);
    if (n > 0) {
        if (threadCount > 1) {
            //print("Duration of tasks: ",tasksDurationFull, "ms", " ("+(tasksDurationFull/n).toFixed(1)+" per pass)");
            print("Average duration of task: ", (tasksDurationFull / n).toFixed(1), "ms");
        }
        print("Average duration of test: ", (tasksDurationOfTesting / n).toFixed(1), "ms");
        print("Total duration of tests: ", tasksDurationOfTesting, "ms"); //, " ("+(tasksDurationOfTesting/n).toFixed(1)+" per pass)");
    }
    print("Elapsed total:", Date.now() - localTime0, "ms");
    //alert("Elapsed total:"+ (Date.now() - localTime0)+" ms");
    //alert("!");
    //worker.terminate();
    return !stop;
    //return results;
}
