
define(function(require, exports, module){
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
    if(document.addEventListener){
        elem.addEventListener(event, handler, false);
    }else if(document.attachEvent){
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

  exports.endsWith = endsWith;
  exports.isNumber = isNumber;
  exports.isPositiveNumber = isPositiveNumber;
  exports.addEventListener = addEventListener;
  exports.hasAttribute = hasAttribute;
  exports.each = each;
});
