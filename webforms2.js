/**
 * Web Forms 2 Validate.
 * TODO: sync validate.
 * @param {HTMLFormElement} form.
 * @param {Object} options.
 * @see http://dev.w3.org/html5/markup/input.html
 *
 * Example:
 *
 * new WebForms2(
 *     document.getElementById("formId"), {
 *     handler: {
 *         "username": function(elem){},
 *         "password": function(elem){}
 *     },
 *     callback: function(elem){}
 *     }
 * );
 */
var WebForms2 = function(form, options){
    options = options || {handler:{}};
    if(!options.hasOwnProperty("handler")){
        options.handler = {};
    }
    if(!options.hasOwnProperty("callback")){
        options.callback = function(){};
    }

    var _submit = form.onsubmit;
    form.onsubmit = function(){
        if("function"==_submit && !_submit.call(form)){return false;}
        return verify(form, options);
    };


    function hasAttribute(elem, attr){
        if("function" == typeof elem.hasAttribute){
            return elem.hasAttribute(attr);
        }
        return null !== elem.getAttribute(attr);
    }
    // 表单统一验证入口
    // @param {HTMLFormElement} form, form element.
    // @param {Object} options.
    function verify(form, options){
        var handler = options.handler,
            callback = options.callback,
            certified = true,
            certifiedAll = true;

        for(var i=0,e,type,l=form.elements.length; i<l; i++){
            e = form.elements[i];
            if(e.readOnly || e.disabled){continue;}
            certified = true;
            type = e.type;
            if(!type){ // fieldset>legend
                continue;
            }else if(type === "text"){
                type = e.getAttribute("type");
            }
            if(hasAttribute(e, "required")){
                certified = verifyRequired(e);
            }
            // XXX: think deep here.
            if(e.value == ""){
                if(!certified){
                    certifiedAll = false;
                    if(!callback.call(e, e)){
                        return false;
                    }
                }
                continue;
            }
            switch(type.toLowerCase()){
                case "submit":
                case "button":
                case "reset":
                case "image":
                case "file":
                case "radio":
                case "checkbox":
                case "select-one":
                case "select-multiple":
                    break;
                case "text":
                case "password":
                case "hidden":
                case "search":
                case "textarea":
                    certified = verifyText(e);
                    break;
                case "number":
                    certified = verifyNumber(e);
                    break;
                case "month":
                    certified = verifyMonth(e);
                    break;
                case "time":
                    certified = verifyTime(e);
                    break;
                case "week":
                    certified = verifyWeek(e);
                    break;
                case "date":
                    certified = verifyDate(e);
                    break;
                case "datetime":
                    certified = verifyDatetime(e);
                    break;
                case "datetime-local":
                    certified = verifyDatetimeLocal(e);
                    break;
                case "url":
                    certified = verifyUrl(e);
                    break;
                case "email":
                    certified = verifyEmail(e);
                    break;
                case "tel":
                    certified = verifyTel(e);
                    break;
                case "color":
                    certified = verifyColor(e);
                    break;
                case "range":
                    certified = verifyRange(e);
                    break;
                default:
                    break;
            }
            if(hasAttribute(e, "pattern")){
                certified = verifyPattern(e);
            }
            var name = e.getAttribute("name") || e.name;
            // verify user custom function.
            if(name && options.handler.hasOwnProperty(name) &&
                "function"==typeof options.handler[name]){

                certified = options.handler[name].call(e, e);
            }

            if(!certified){
                certifiedAll = false;
                if(!callback.call(e, e)){
                    try{e.focus();}catch(ex){}
                    return false;
                }
            }
        }
        return certifiedAll;
    }
    // 验证必填项。
    // TODO:
    //  case "radio":
    //  case "checkbox":
    //  case "select-one":
    //  case "select-multiple":
    function verifyRequired(elem){
        return !/^\s*$/.test(elem.value);
    }
    function verifyText(elem){
        var val = elem.value, minlength, maxlength;
        if(hasAttribute(elem, "minlength"){
            minlength = elem.getAttribute("minlength");
            if(/^\d+$/.test(minlength) && (val.length < parseInt(minlength))){
                return false;
            }
        }
        if(hasAttribute(elem, "maxlength"){
            maxlength = elem.getAttribute("maxlength");
            if(/^\d+$/.test(maxlength) && (val.length > parseInt(maxlength))){
                return false
            }
        }
        return true;
    }
    /**
     * @param {String} num.
     * @return {Boolean}
     */
    function isNumber(num){
        if("number" == typeof num){return true;}
        if("string" != typeof num){return false;}
        if(/^[+-]?\d+$/.test(num) || /^[+-]?(?:\d+)?\.\d+$/){
            return true;
        }
        return false;
    }
    /**
     * @param {String} num.
     * @return {Boolean}
     */
    function isPositiveNumber(num){
        if("number" == typeof num){return true;}
        if("string" != typeof num){return false;}
        if(/^\d+$/.test(num) || /^(?:\d+)?\.\d+$/){
            return true;
        }
        return false;
    }
    // 验证数值类型项。
    function verifyNumber(elem){
        var val = elem.value, min, max;
        if(!isNumber(val)){return false;}

        val = parseFloat(val, 10);
        if(hasAttribute(elem, "min")){
            min = elem.getAttribute("min");
            // XXX: if min not a positive number, return false?
            if(isPositiveNumber(min) && val < parseFloat(min, 10)){return false;}
        }
        if(hasAttribute(elem, "max")){
            max = elem.getAttribute("max");
            // XXX: if min not a positive number, return false?
            if(isPositiveNumber(max) && val > parseFloat(max, 10)){return false;}
        }
        return true;
    }
    // TODO: verifyMonth.
    function verifyMonth(elem){}
    // 验证日期项。
    // @see http://dev.w3.org/html5/markup/input.date.html
    // @see http://tools.ietf.org/html/rfc3339
    function verifyDate(elem){
        var val = elem.value,
            format = elem.getAttribute("data-format") || "YYYY/MM/DD",
            min, max;

        val = Date.parse(val, format);
        if(!(val instanceof Date)){return false;}

        if(hasAttribute(elem, "min")){
            min = Date.parse(elem.getAttribute("min"), format);
            // XXX: if min not a date, return false?
            if((min instanceof Date) && (min > val)){return false;}
        }
        if(hasAttribute(elem, "max")){
            max = Date.parse(elem.getAttribute("max"), format);
            // XXX: if min not a date, return false?
            if((max instanceof Date) && (max < val)){return false;}
        }
        return true;
    }
    // TODO: verifyTime.
    function verifyTime(elem){}
    // TODO: verifyWeek.
    function verifyWeek(elem){}
    // TODO: verifyDatetimeLocal.
    function verifyDatetimeLocal(elem){}
    // TODO: verifyTel.
    function verifyTel(elem){}
    // 验证日期时间类型项。
    function verifyDatetime(elem){
        var val = elem.value,
            format = elem.getAttribute("data-format") || "YYYY/MM/DD hh:mm:ss",
            min, max;

        val = Date.parse(val, format);
        if(!(val instanceof Date)){return false;}

        if(hasAttribute(elem, "min")){
            min = Date.parse(elem.getAttribute("min"), format);
            // XXX: if min not a date, return false?
            if((min instanceof Date) && (min > val)){return false;}
        }
        if(hasAttribute(elem, "max")){
            max = Date.parse(elem.getAttribute("max"), format);
            // XXX: if min not a date, return false?
            if((max instanceof Date) && (max < val)){return false;}
        }
        return true;
    }
    // 验证 URL 格式项。
    function verifyUrl(elem){
        return /^https?:\/\/\w+(?:\.\w+)+(?:\/[\w_\.\-]*)*$/.test(elem.value);
    }
    function verifyEmail(elem){
        return /^\w+([\._\-]\w+)*@\w+(?:\.\w+)+$/.test(elem.value);
    }
    // TODO: verifyRange.
    function verifyRange(elem){
        return true;
    }
    // TODO: verifyColor.
    function verifyRange(elem){
        return true;
    }
    // 验证自定义模式表达式。
    function verifyPattern(e){
        return new RegExp(e.getAttribute("pattern")).test(e.value);
    }

};

/**
 * @param {String} date, date string.
 * @param {format} format, date format. like "YYYY/MM/DD".
 * @return {Date}
 * XXX: %M, %D 等不确定位数的，很难进行。
 */
Date.parse = function(date, format){
    if(!date || !format || format.length != val.length){return null;}

    format = RegExp.safeSource(format);
    format = format.replace("YYYY", "(?<fullyear>\\d{4})");
    format = format.replace("YY", "(?<year>\\d{2})");
    format = format.replace("yyyy", "(?<fullyear>\\d{4})");
    format = format.replace("yy", "(?<year>\\d{2})");
    format = format.replace("MM", "(?<month>\\d{2})");
    //format = format.replace("%M", "(?<month>\\d)");
    format = format.replace("DD", "(?<day>\\d{2})");
    //format = format.replace("%D", "(?<day>\\d)");
    format = format.replace("dd", "(?<day>\\d{2})");
    //format = format.replace("%d", "(?<day>\\d)");
    format = format.replace("HH", "(?<hour>\\d{2})");
    //format = format.replace("%H", "(?<hour>\\d)");
    format = format.replace("hh", "(?<hour>\\d{2})");
    //format = format.replace("%h", "(?<hour>\\d)");
    format = format.replace("mm", "(?<minute>\\d{2})");
    //format = format.replace("%m", "(?<minute>\\d)");
    format = format.replace("SS", "(?<second>\\d{2})");
    //format = format.replace("%S", "(?<second>\\d)");
    format = format.replace("ss", "(?<second>\\d{2})");
    //format = format.replace("%s", "(?<second>\\d)");

    var m = RegExp.namedGroupMatch("^"+format+"$", date);
    if(!m){return null}

    var d = new Date();
    if(m.fullyear){d.setFullYear(parseInt(m.fullyear, 10));}
    if(m.year){d.setYear(parseInt(m.year, 10));}
    if(m.month){d.setMonth(parseInt(m.month, 10)-1);}
    if(m.day){d.setDate(parseInt(m.day, 10));}
    if(m.hour){d.setHours(parseInt(m.hour, 10));}
    if(m.minute){d.setMinutes(parseInt(m.minute, 10));}
    if(m.second){d.setSeconds(parseInt(m.second, 10));}
    return d;
}
/**
 * @see http://www.regexlab.com/zh/deelx/syntax/bas_name.htm
 *      http://www.cn-cuckoo.com/2007/07/25/group-back-reference-and-numberednamed-group-39.html
 *      http://www.cnblogs.com/QLeelulu/archive/2011/03/16/1986158.html
 * @param {String} regex, with named group reguler expression string.
 * @param {String} string, target string to match.
 * @param {String} flag, "i": ignore case, "g": global, "m": multiline.
 * @return {Object}
 */
RegExp.namedGroupMatch = function(regex, string, flag){
    var names=[string], result={0:string};
    var re = regex.replace(/\(\?<([a-zA-Z]+)>([^)]+)\)/g, function($0, $1, $2){
        names.push($1);
        return '('+$2+')';
    });
    re = new RegExp(re, flag);
    var m = re.exec(string);
    if(!m){return null;}

    for(var i=1,l=m.length; i<l; i++){
        result[names[i]] = result[i] = m[i];
    }
    return result;
};
RegExp.safeSource = function(src){
    var a = "! \\ / . $ * ^ ( ) [ ] { } ? + - |".split(" ");
    for (var i=0, l=a.length; i<l; i++){
        try{
        src = src.replace(new RegExp("\\"+a[i], "g"), "\\"+a[i]);
        }catch(ex){alert(ex.message)}
    }
    return src;
};
