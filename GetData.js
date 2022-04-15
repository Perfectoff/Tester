import { createRequire } from 'module';
const require = createRequire(import.meta.url);
//import {CBars,CTick} from "./Bars.js"
/*
const prompt = require('prompt');

//import * as prompt from 'prompt';


prompt.start();

prompt.get(['username', 'email'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Email: ' + result.email);
});

function onErr(err) {
    console.log(err);
    return 1;
}
*/
import * as readline from 'readline';
//const readline= require('readline');
const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function ask(questionText) {
    return new Promise((resolve, reject) => {
        readlineInterface.question(questionText, resolve);
    });
}
async function start() {
    /*
    rl.question('What do you think of Node.js? ', (answer) => {
        // TODO: Log the answer in a database
        console.log(`Thank you for your valuable feedback: ${answer}`);

        rl.close();
        process.stdin.destroy();
    });
     */
    let name = await ask("What's your name? ");
    print(name);
    print("!");
}
//await start();
//print("!!!");
function print(...args) { console.log(...args); }
//import {WebSocket.client} from 'websocket';
//import * as ws from 'websocket';
//let WebSocket= ws.client;
var WebSocket = require('ws');
//
//import * as WebSocket from 'ws';
//let z = new WebSocket("!");
//print(z);
//var WebSocketServer = require('websocket').server;
class MSRequest {
}
class MySocket {
    async connect() { await this.currentTask; return this.currentTask = MySocket.connectAsync(this.socket); }
    async send(msg) { await this.currentTask; this.socket.send(msg); }
    static connectAsync(socket) {
        return new Promise((resolve, reject) => {
            socket.onopen = resolve;
            socket.onerror = reject;
        });
    }
    static sendAsync(socket) {
        return new Promise((resolve, reject) => {
            socket.on = resolve;
            socket.onerror = reject;
        });
    }
}
class CDataDownloader {
    constructor(onConnect, onMessage, onClose, onError) {
        let socket = new WebSocket('wss://api-sb.mstrade.org/realtime/');
        socket.onopen = onConnect;
        socket.onmessage = onConnect;
        socket.onclose = onClose;
        socket.onerror = onError;
        let id = CDataDownloader.__id++;
        socket.id = id; //		event.target.id= id;
        socket.downloader = this;
        this.socket = socket;
    }
}
CDataDownloader.__id = 100;
subscribe(request, Readonly(), {
    this: .socket.send(JSON.stringify(request))
}, public, close(), { this: .socket.close() }, get, state(), { return: this.socket.readyState }, 
//socketStatus.className = 'open';
//socket.send(JSON.stringify(subscribe2));
async function main(symbol) {
    //var base=new CBlockC('canvas');
    //function InitSocet(socket_) {socket_ = new WebSocket('wss://api-sb.mstrade.org/realtime/');};
    // var socket= new WebSocket('wss://api-sb.mstrade.org/realtime/');
    //print(socket);
    //return;
    //return;
    var request = {
        "op": "subscribe",
        "account": "demo.demo",
        "channels": "trade:" + symbol,
        "schema": "margin1"
    };
    let onerror = function (error) { print('WebSocket Error: ' + error); };
    //closeBtn.onclick = function(e)       {socket.close(); return false;};
    let onopen = function (event) {
        print('Connected to: ' + event.target.url, " id=", event.target.id);
        //socketStatus.className = 'open';
        socket.send(JSON.stringify(request));
        //socket.send(JSON.stringify(subscribe2));
    };
    socket.onmessage = function (msgEvent) {
        print("message from ", msgEvent.target.id);
        if (typeof msgEvent.data === "string") {
            let msg = msgEvent.data; //JSON.parse(newmessage.data);
            print(msg);
        }
        //if (mess.data!=undefined) base.Add(mess.data);
    };
    socket.onclose = function () {
        print('Disconnected');
        //socketStatus.className = 'closed';
    };
    var socket = new WebSocket('wss://api-sb.mstrade.org/realtime/');
    /*
    botonCon.onclick = function(){
        //if (subscribe.channels!="trade:"+messageField.value)  {socket.close();}
        if (socket.readyState>=WebSocket.CLOSING)      {socket.onopen();}
        socket.send(JSON.stringify(subscribe));
        return false;
    };
    */
    //await ask("asking 1");
    //await ask("asking 2");
    return socket;
});
//await
let sock1 = await main("btcusd");
let sock2 = await main("ETHUSD");
await ask("asking 1");
sock1.close();
sock2.close();
print("finish");
readlineInterface.close();
process.stdin.destroy();
//
// prompt("!!!!");
