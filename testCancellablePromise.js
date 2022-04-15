import { CancelablePromise } from "./Common.js";
const p = new CancelablePromise((resolve, reject) => {
    setTimeout(() => {
        console.log('resolved!');
        resolve();
    }, 2000);
});
p.catch(console.log);
setTimeout(() => {
    p.cancel(new Error('Messed up!'));
}, 1000);
await p;
