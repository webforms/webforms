/**
 * Web Forms 2 Validate.
 * @param {HTMLFormElement} form.
 * @param {Object} options.
 * @see http://dev.w3.org/html5/markup/input.html
 *
 * TODO: options: trigger
 * TODO: success feedback.
 *
 * Example:
 *
 * new WebForms2(
 *     document.getElementById("formId"), {
 *     //trigger: "keyup,blur,submit",
 *     rules: {
 *         // [name]
 *         "username": function(elem){},
 *         "password": function(elem){}
 *     },
 *     feedback: function(elem){}
 *     }
 * );
 */
var WebForms2 = function(form, options){
    options = options || {rules:{}};
    if(!options.hasOwnProperty("rules")){
        options.rules = {};
    }
    if(!options.hasOwnProperty("feedback")){
        options.feedback = function(){};
    }

    var _submit = form.onsubmit;
    form.onsubmit = function(){
        if("function"==_submit && !_submit.call(form)){return false;}
        return verifyForm(form, options);
    };
    for(var i=0,l=form.elements.length; i<l; i++){
        (function(elem){
            addEventListener(elem, "blur", function(){
                if(!verifyFormElement(elem) &&
                  !options.feedback.call(elem, elem)){
                    return false;
                }
            });
            addEventListener(elem, "change", function(){
                if(hasAttribute(elem, "verified")){
                    elem.setAttribute("verified", "");
                }
            });
        })(form.elements[i]);
    }

    //var trigger;
    //if(options.hasOwnProperty("trigger") && "string"==typeof options.trigger){
        //trigger = options.trigger.split(",");
        //for(var i=0,l=trigger.length; i<l; i++){
            //if("submit"==trigger[i]){continue;}
            //for(var j=0,m=form.elements.length; j<m; j++){
                //addEventListener(form.elements[j], trigger[i], verify);
            //}
        //}
    //}
    /**
     * Get HTMLElement's type
     * @param {HTMLElement} elem.
     * @return {String} element's type.
     */
    function getType(elem){
        var type = elem.type;
         // fieldset>legend
        if("undefined" == typeof type){return;}
        if(type == "text"){
            type = elem.getAttribute("type") || "text";
        }
        return type.toLowerCase();
    }
	function getValue(elem){
        if(!elem || !elem.form){return null;}
        var form = elem.form;
		var s="", a=[];
		for (var i=0,type,name; i<form.elements.length; i++){
			var e = form.elements[i];
            type = getType(e);
            name = e.getAttribute("name") || e.name || "";
			switch(type){
            case "submit": case "reset": case "image": case "button":
                return null;
			case "radio": case "checkbox":
                if(!name){return null;}
                for(var i=0,l=form[name].length; i<l; i++){
                    if(form[name][i].checked){
                        a.push(form[name][i].value);
                    }
                }
                return a;
			case "select-one": // select>option
                return elem.value;
			case "select-multiple": // select[multiple]>option
                for(var i=0,l=elem.length; i<l; i++){
                    if(elem[i].selected){
                        a.push(elem[i].value);
                    }
                }
                return a;
			default: // text, textarea, password, hidden, file(only file name).
                return elem.value;
			}
		}
	}
    // 表单统一验证入口
    // @param {HTMLFormElement} form, form element.
    // @param {Object} options.
    function verifyForm(form, options){
        var rules = options.rules,
            feedback = options.feedback,
            certified = true,
            certifiedAll = true,
            groupElemCatch = {};

        for(var i=0,e,type,val,l=form.elements.length; i<l; i++){
            e = form.elements[i];
            certified = certified && verifyFormElement(e);

            if(!certified && !feedback.call(e, e)){
                return false;
            }
        }
        return certified;
    }
    function verifyFormElement(e){
        if(e.readOnly || e.disabled){return true;}
        var certified = true;
        type = getType(e);
        if(!type){true;}
        val = getValue(e);

        if(hasAttribute(e, "required")){
            certified = certified && verifyRequired(e, type, val);
        }
        if(hasAttribute(e, "minlength")){
            certified = certified && verifyMinlength(e, type, val);
        }
        if(hasAttribute(e, "maxlength")){
            certified = certified && verifyMaxlength(e, type, val);
        }
        switch(type){
            case "submit":
            case "button":
            case "reset":
            case "image":
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
                break;
            case "file":
                certified = certified && verifyFile(e);
                break;
            case "number":
            case "range":
                certified = certified && verifyNumber(e);
                break;
            case "month":
                certified = certified && verifyMonth(e);
                break;
            case "time":
                certified = certified && verifyTime(e);
                break;
            case "week":
                certified = certified && verifyWeek(e);
                break;
            case "date":
                certified = certified && verifyDate(e);
                break;
            case "datetime":
                certified = certified && verifyDatetime(e);
                break;
            case "datetime-local":
                certified = certified && verifyDatetimeLocal(e);
                break;
            case "url":
                certified = certified && verifyUrl(e);
                break;
            case "email":
                certified = certified && verifyEmail(e);
                break;
            case "tel":
                certified = certified && verifyTel(e);
                break;
            case "color":
                certified = certified && verifyColor(e);
                break;
            default:
                break;
        }
        if(hasAttribute(e, "pattern")){
            certified = certified && verifyPattern(e);
        }
        var name = e.getAttribute("name") || e.name;
        // verify user custom function.
        if(name && options.rules.hasOwnProperty(name) &&
            "function"==typeof options.rules[name]){

            // @param {Boolean} state, verify state from server.
            certified = certified && options.rules[name].call(e, e, function(state){
                if(!hasAttribute(elem, "verified")){return;}
                elem.setAttribute("verified", state ? "valid" : "invalid");
            });
        }
        // verify async from server.
        // XXX: init state.
        if(hasAttribute(e, "verified")){
            certified = certified && "valid"==e.getAttribute("verified");
        }
        return certified;
    }
    // 验证必填项。
    function verifyRequired(elem, type, val){
        var form = elem.form,
            name = elem.name,
            elems = form[name],
            required = hasAttribute(elem, "required"),
            checked = false;
        switch(type){
        case "radio":
            // TODO: ignore verifyed radio group.
            //if(this._cacheRadio.hasOwnProperty(name)){return true;}
            each(elem.form[elem.name], function(elem){
                if(hasAttribute(elem, "required")){required = true;}
                if(elem.checked){checked = true;}
            });
            //this._cacheRadio[name] = checked;
            return required && checked;
        case "checkbox":
            return elem.checked;
        case "select-multiple":
            return val && val.length > 0;
        case "password":
            return "" != elem.value;
        //case "select-one":
        //case "text":
        //case "...":
        default:
            return !/^\s*$/.test(elem.value);
        }
    }
    function verifyMinlength(elem, type, val){
        switch(type){
        case "radio":
        case "checkbox":
        case "select-multiple":
        case "select-one":
            return true;
        //case "text":
        default:
            break;
        }
        var minlength = elem.getAttribute("minlength");
        if(/^\d+$/.test(minlength) && (val.length < parseInt(minlength, 10))){
            return false;
        }
    }
    function verifyMaxlength(elem, type, val){
        switch(type){
        case "radio":
        case "checkbox":
        case "select-multiple":
        case "select-one":
            return true;
        //case "text":
        default:
            break;
        }
        var maxlength = elem.getAttribute("maxlength");
        if(/^\d+$/.test(maxlength) && (val.length > parseInt(maxlength, 10))){
            return false;
        }
    }
    var MIME_TYPE = {
        "text/plain": "txt",
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "audio/mp3": "mp3"
    };
    function verifyFile(elem){
        var accept, val=elem.value;
        if(hasAttribute(elem, "accept")){
            accept = elem.getAttribute("accept").split(",");
            for(var i=0,l=accept.length; i<l; i++){
                if(MIME_TYPE.hasOwnProperty(accept[i]) && !endsWith(val, accept[i])){
                    return false;
                }
            }
        }
        return true;
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
    function _verifyDateTimes(elem, defaultFormat){
        var val = elem.value,
            format = elem.getAttribute("data-format") || defaultFormat,
            min, max,
            certified = true;

        val = Date.parse(val, format);
        certified = certified && (val instanceof Date);

        if(hasAttribute(elem, "min")){
            min = Date.parse(elem.getAttribute("min"), format);
            // XXX: if min not a date, return false?
            certified = certified && (min instanceof Date) && (min > val);
        }
        if(hasAttribute(elem, "max")){
            max = Date.parse(elem.getAttribute("max"), format);
            // XXX: if min not a date, return false?
            certified = certified && (max instanceof Date) && (max < val);
        }
        return certified;
    }
    // verifyMonth.
    function verifyMonth(elem){
        return _verifyDateTimes(elem, "YYYY-MM");
    }
    // 验证日期项。
    // @see http://dev.w3.org/html5/markup/input.date.html
    // @see http://tools.ietf.org/html/rfc3339
    function verifyDate(elem){
        return _verifyDateTimes(elem, "YYYY-MM-DD");
    }
    // verifyTime.
    function verifyTime(elem){
        return _verifyDateTimes(elem, "hh:mm:ss");
    }
    // verifyWeek.
    // XXX: hack week number by minute.
    function verifyWeek(elem){
        return _verifyDateTimes(elem, "YYYY-Wmm");
    }
    // verifyDatetimeLocal.
    function verifyDatetimeLocal(elem){
        return _verifyDateTimes(elem, "YYYY-MM-DDThh:mm:ss");
    }
    // verify datetime.
    function verifyDatetime(elem){
        return _verifyDateTimes(elem, "YYYY-MM-DD hh:mm:ss");
    }
    // verify telephone.
    // @see http://technet.microsoft.com/zh-cn/library/cc728034(v=ws.10).aspx
    function verifyTel(elem){
        var re_mobile_cn = /^(?:13[0-9]|147|15[0-35-9]|18[05-9])\d{8}$/,
            re_tel_cn = /^\d{3,4}\-\d{7,8}$/,
            val = elem.value;
        return re_mobile_cn.test(val) || re_tel_cn.test(val);
    }
    // verify url.
    function verifyUrl(elem){
        return /^https?:\/\/\w+(?:\.\w+)+(?:\/[\w_\.\-]*)*$/.test(elem.value);
    }
    function verifyEmail(elem){
        return /^\w+([\._\-]\w+)*@\w+(?:\.\w+)+$/.test(elem.value);
    }
    // verify color.
    // @see http://www.w3.org/pub/WWW/Graphics/Color/sRGB.html
    function verifyColor(elem){
        var re_color_rgb = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/,
            val = elem.value;
        return re_color_rgb.test(val);
    }
    // 验证自定义模式表达式。
    function verifyPattern(elem){
        var pattern = elem.getAttribute("pattern");
        try{pattern = new RegExp(pattern);}catch(ex){
            // for form developer debug.
            alert("Invalid pattern: "+pattern+"\n"+ex.message);
            return false;
        }
        return pattern.test(elem.value);
    }

    // ---------------------- utils --------------------------------------

    /**
     * string ends with suffix string.
     * @param {String} string, target string.
     * @param {String} suffix.
     */
    function endsWith(string, suffix) {
        return string.indexOf(suffix)===string.length-suffix.length;
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
    function addEventListener(elem, event, handler){
        if(window.addEventListener){
            elem.addEventListener(event, handler, false);
        }else if(window.attachEvent){
            elem.attachEvent("on"+event, handler);
        }
    }


    function hasAttribute(elem, attr){
        if("function" == typeof elem.hasAttribute){
            return elem.hasAttribute(attr);
        }
        return null !== elem.getAttribute(attr);
    }
    function each(list, handler){
        for(var i=0,l=list.length; i<l; i++){
            handler.call(list[i], list[i], i);
        }
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
