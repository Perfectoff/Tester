//import {TesterTaskInfo} from "./Tester";
export function JSON_clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
//type SimpleT = { [key :any] : number|string|boolean|SimpleT; }
export class CMyWorker {
    constructor(file) {
        this.id = ++CMyWorker._lastId;
        this.handlers = [];
        //if (!file) file= import.meta.url;  // текущий файл
        this.worker = new Worker(file, { type: "module" }); //if (__first) print(msg);  __first=0;
        this.worker.onmessage = (msg) => {
            var _a;
            (_a = this.handlers.splice(0, 1)[0]) === null || _a === void 0 ? void 0 : _a.onResolve(msg.data);
        };
        this.worker.onerror = (msg) => {
            var _a;
            (_a = this.handlers.splice(0, 1)[0]) === null || _a === void 0 ? void 0 : _a.onReject(msg);
        };
        this.worker.onmessageerror = (msg) => {
            var _a;
            (_a = this.handlers.splice(0, 1)[0]) === null || _a === void 0 ? void 0 : _a.onReject(msg);
        };
    }
    //async send(arg) : Promise<ParsedUrlQueryInputMy> { return new Promise((onResolve, onReject)=> { this.worker.onmessage= (msg)=>{ return onResolve(msg.data); }; this.worker.onerror= onReject;  this.worker.postMessage(JSON_clone(arg)); }); }
    async send(arg) {
        return new Promise((onResolve, onReject) => {
            this.handlers.push({ onResolve, onReject });
            this.worker.postMessage(JSON_clone(arg));
        });
    }
    terminate() {
        this.worker.terminate();
    }
}
CMyWorker._lastId = 0;
export class CMyWorker2 extends CMyWorker {
    //async send(arg: TArg): Promise<TResult>;
    async send(arg) { return await super.send(arg); } //return super().send(arg); }
}
//var onmessage = async function(ev : MessageEvent<ParsedUrlQueryInputMy<unknown>>) { }
// }
