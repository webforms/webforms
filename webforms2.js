/**
 * Web Forms 2 Validate.
 * @param {HTMLFormElement} form.
 * @param {Object} options.
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
            // TODO:
            //case "radio":
            //case "checkbox":
            //case "select-one":
            //case "select-multiple":
            if(hasAttribute(e, "required")){
                certified = verifyRequired(e);
            }
            if(e.value == ""){
                if(!certified){
                    certifiedAll = false;
                    if(!callback.call(e, e)){
                        try{e.focus();}catch(ex){}
                        return false;
                    }
                }
                continue;
            }
            switch(type.toLowerCase()){
                case "submit":
                case "reset":
                case "image":
                case "text":
                case "password":
                case "hidden":
                case "textarea":
                case "select-one":
                case "select-multiple":
                case "radio":
                case "checkbox":
                    break;
                case "number":
                    certified = verifyNumber(e);
                    break;
                case "date":
                    certified = verifyDate(e);
                    break;
                case "datetime":
                    certified = verifyDatetime(e);
                    break;
                case "url":
                    certified = verifyUrl(e);
                    break;
                case "email":
                    certified = verifyEmail(e);
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
    function verifyRequired(elem){
        return !/^\s*$/.test(elem.value);
    }
    // 验证数值类型项。
    function verifyNumber(elem){
        var val = elem.value, min, max;
        if(!/^(?:\+\-)\d+(?:\.\d+)$/.test(val)){
            return false;
        }
        val = parseFloat(val, 10);
        if(hasAttribute(elem, "min")){
            min = parseFloat(elem.getAttribute("min"), 10);
            if(val < min){return false;}
        }
        if(hasAttribute(elem, "max")){
            max = parseFloat(elem.getAttribute("max"), 10);
            if(val > max){return false;}
        }
        return true;
    }
    // 验证日期项。
    // min, max
    function verifyDate(elem){
        var val = elem.value,
            format = elem.getAttribute("data-format") || "YYYY/MM/DD";

        if(format.length != val.length){return false;}

        return Date.parse(val, format) instanceof Date;
    }
    // 验证日期时间类型项。
    // TODO.
    // min, max
    function verifyDatetime(elem){
        return true;
    }
    // 验证 URL 格式项。
    function verifyUrl(elem){
        return /^https?:\/\/\w+(?:\.\w+)+(?:\/[\w_\.\-]*)*$/.test(elem.value);
    }
    function verifyEmail(elem){
        return /^\w+([\._\-]\w+)*@\w+(?:\.\w+)+$/.test(elem.value);
    }
    // TODO.
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
    if(!date || !format){return null;}
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
