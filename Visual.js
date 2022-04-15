//enum E_ALIGN { left=-1, center=0, right=1 }
export function rgb(red, green, blue) { return `rgb(${red},${green},${blue})`; }
// Класс линии
export class CLine {
    constructor(begin, end, color) { this.begin = begin; this.end = end; this.color = color; }
}
