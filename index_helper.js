import { NormalizeDouble } from "./Common.js";
// /**@param {HTMLInputElement} element
//  */
export function SetAutoStepForElement(element, minStep = 0) {
    function parse(valueStr) { let val = parseFloat(valueStr); return isNaN(val) ? null : val; }
    ;
    let _stepDefault = parse(element.step);
    let _minDefault = parse(element.min);
    let _maxDefault = parse(element.max);
    let _digits = null;
    let _step = parse(element.step);
    let _min = parse(element.min);
    let minDigits = minStep > 0 ? Math.max(0, -Math.round(Math.log10(minStep))) : 0;
    /**@param {string} valueStr
     */
    function calculateStep(valueStr) {
        //function NormalizeDouble(value :number, digits :number) { let factor=Math.pow(10, digits); return Math.round(value * factor)/factor;  }
        let dotPos = valueStr.search(/\.|,/); // Находим точку или запятую
        //if (dotPos===valueStr.length-1) dotPos--;
        let digits = (dotPos >= 0) ? valueStr.length - dotPos - 1 : 0;
        digits = Math.max(digits, minDigits);
        let step = NormalizeDouble(Math.pow(0.1, digits), digits);
        if (_maxDefault != null && _minDefault != null)
            if (_maxDefault - _minDefault < step * 2)
                return _step;
        _digits = digits;
        _step = step;
        //if (Math.abs(min) < step) min= Math.floor(Math.abs(min)/step)*step * Math.sign(min);
        if (_min != null) {
            if (Math.abs(_min) % step != 0)
                _min = Math.floor(Math.abs(_min) / step) * step * Math.sign(_minDefault);
            element.min = _min + "";
        }
        //console.log("step:",element.step+"->"+step," min:",element.min+"->"+min);
        //console.log("minDefault:",_minDefault,parseFloat(_minDefault));
        element.step = step + "";
        //console.log("dotPos:",dotPos," _digits:",_digits, "minDigits:",minDigits);
        return step; ////lib.GetDblPrecision($fee[0].value)); }
    }
    const modeAuto = !_step || (_step < 1 && Math.log10(_step - Math.trunc(_step)) % 1 == 0);
    if (modeAuto) {
        calculateStep((_step ? (Math.round(parseFloat(element.value) / _step) * _step) : element.value) + "");
        //console.log(element.value, step);
    }
    element.onkeyup = () => { if (modeAuto)
        calculateStep(element.value); }; // console.log(element.step); }//  console.log(element.value, element.step); }
    element.onchange = () => {
        let digits = _digits;
        if (digits != null)
            element.value = parseFloat(element.value).toFixed(digits);
        if (_minDefault != null && parseFloat(element.value) < _minDefault) {
            element.step = _stepDefault + "";
            element.value = _minDefault + "";
            element.min = _minDefault + "";
            _digits = null;
        }
        element.setAttribute("value", element.value);
    }; //Math.round($fee[0].value/$fee[0].step)*$fee[0].step; }
    //element.onkeyup();
}
//import * as Time from "./Time.js"
//import {const_Date} from "./Time.js";
//import {TradeStatistics} from "./TradeStatistics";
