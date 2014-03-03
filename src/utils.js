
define(function(require, exports, module){

  function startsWith(string, suffix) {
    return string.indexOf(suffix) === 0;
  }

  // TODO: deep merge.
  // @param {Object} ...
  // @return {Object} the new object.
  function merge(){

    var rst = {};

    for(var i=0,l=arguments.length; i<l; i++){
      for(var key in arguments[i]){
        if(!arguments[i].hasOwnProperty(key)){continue;}
        rst[key] = arguments[i][key];
      }
    }

    return rst;
  }

  // 判断字符串 string 是否以 suffix 结尾。
  //
  // @param {String} string, target string.
  // @param {String} suffix.
  // @return {Boolean}
  function endsWith(string, suffix) {
    return string.indexOf(suffix)===string.length-suffix.length;
  }

  // 判断字符串 num 是否符合数值格式。
  //
  // @param {String} num.
  // @return {Boolean}
  function isNumber(num){
    if("number" === typeof num){return true;}
    if("string" !== typeof num){return false;}
    if(/^[+-]?\d+$/.test(num) || /^[+-]?(?:\d+)?\.\d+$/){
      return true;
    }
    return false;
  }

  // 判断字符串 num 是否符合正整数格式。
  //
  // @param {String} num.
  // @return {Boolean}
  function isPositiveNumber(num){
    if("number" === typeof num){return true;}
    if("string" !== typeof num){return false;}
    if(/^\d+$/.test(num) || /^(?:\d+)?\.\d+$/){
      return true;
    }
    return false;
  }

  // 给指定的 elem 元素绑定事件。
  //
  // @param {HTMLElement} elem 指定的元素。
  // @param {String} event 事件名称。
  // @param {Function} handler 事件处理函数。
  function addEventListener(elem, event, handler){
    if(document.addEventListener){
      elem.addEventListener(event, handler, false);
    }else if(document.attachEvent){
      elem.attachEvent("on"+event, handler);
    }
  }

  // 判断指定元素是否存在特定属性。
  //
  // @param {HTMLElement} elem, 特定元素。
  // @param {String} attr, 指定属性名。
  // @return {Boolean}
  function hasAttribute(elem, attr){
    if("function" === typeof elem.hasAttribute){
      return elem.hasAttribute(attr);
    }
    return null !== elem.getAttribute(attr);
  }

  // 遍历列表，对每一项进行处理。
  //
  // @param {Array} list, 指定的列表。
  // @param {Function} handler, 处理函数。
  function each(list, handler){
    if(!list || !list.length || "[object Function]"!==typeOf(handler)){return;}
    for(var i=0,l=list.length; i<l; i++){
      handler.call(list[i], list[i], i);
    }
  }

  // 将日期字符串转换成日期对象。
  // XXX: %M, %D 等不确定位数的，很难进行。
  //
  // @param {String} date, date string.
  // @param {format} format, date format. like "YYYY/MM/DD".
  // @return {Date}
  function date_parse(date, format){
    if(!date || !format || format.length !== date.length){return null;}

    format = regexp_escape(format);
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

    var m = regexp_namedGroupMatch("^"+format+"$", date);
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

  // @see http://www.regexlab.com/zh/deelx/syntax/bas_name.htm
  //      http://www.cn-cuckoo.com/2007/07/25/group-back-reference-and-numberednamed-group-39.html
  //      http://www.cnblogs.com/QLeelulu/archive/2011/03/16/1986158.html
  //
  // @param {String} regex, with named group reguler expression string.
  // @param {String} string, target string to match.
  // @param {String} flag, "i": ignore case, "g": global, "m": multiline.
  // @return {Object}
  function regexp_namedGroupMatch(regex, string, flag){
    var names=[string], result={0:string};
    var re = regex.replace(/\(\?<([a-zA-Z]+)>([^)]+)\)/g, function($0, $1, $2){
      names.push($1);
      return "("+$2+")";
    });
    re = new RegExp(re, flag);
    var m = re.exec(string);
    if(!m){return null;}

    for(var i=1,l=m.length; i<l; i++){
      result[names[i]] = result[i] = m[i];
    }
    return result;
  }

  // 转义正则表达式，将特殊的正则表达式元字符转义成普通字符。
  //
  // @param {String} source, 正则表达式源字符串。
  // @return {String} 可以安全的作为正则表达式的字符串。
  function regexp_escape(source){
    return String(source).replace(/([\!\\\/\.\$\*\^\(\)\[\]\{\}\?\+\-\|])/g, "\\$1");
  }

  function typeOf(object){
    return Object.prototype.toString.call(object);
  }
  function extend(){
    var rst = {};
    for(var i=0,object,l=arguments.length; i<l; i++){
      object = arguments[i];
      for(var key in object){
        if(object.hasOwnProperty(key)){
          switch(typeOf(object[key])){
          case "[object Object]":
            rst[key] = extend({}, object[key]);
            break;
          case "[object Array]":
            rst[key] = object[key].slice(0);
            //rst[key] = Array.prototype.slice.call(object[key], 0);
            break;
          default:
            rst[key] = object[key];
            break;
          }
        }
      }
    }
    return rst;
  }

  function function_createDelegate(instance, method) {
    return function() {
      return method.apply(instance, arguments);
    };
  }

  module.exports = {
    startsWith: startsWith,
    endsWith : endsWith,
    isNumber : isNumber,
    isPositiveNumber : isPositiveNumber,
    addEventListener : addEventListener,
    hasAttribute : hasAttribute,
    each : each,
    merge: merge,
    date_parse : date_parse,
    extend: extend,
    function_createDelegate: function_createDelegate
  };
});
