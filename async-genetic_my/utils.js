export function clone(obj) {
    if (obj == null || typeof obj != 'object')
        return obj;
    return JSON.parse(JSON.stringify(obj));
}
export function Maximize(a, b) {
    return a >= b;
}
export function Minimize(a, b) {
    return a < b;
}
