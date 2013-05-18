/**
 * Web Forms 2 Validate.
 * @param {HTMLFormElement} form.
 * @param {Object} options.
 * @see http://dev.w3.org/html5/markup/input.html
 *      https://wiki.mozilla.org/DOM:Web_Forms_2.0
 *      http://miketaylr.com/pres/html5/forms2.html
 *      http://webforms2.testsuite.org/
 * @author 闲耘™(hotoo.cn[AT]gmail.com)
 *
 * TODO: success feedback.
 * XXX: hasAttribute in element verify function.
 *
 * Example:
 *
 * new WebForms2(
 *     document.getElementById("formId"), {
 *     trigger: "blur,submit", // default & required trigger: submit.
 *     rules: {
 *         // [name]
 *         "username": function(elem){},
 *         "password": function(elem){}
 *     },
 *     feedback: function(elem){}
 *     }
 * );
 */
define(function(require, exports, module){

  var utils = require("./utils");

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
        if(options.hasOwnProperty("trigger") &&
          "string"==typeof options.trigger &&
          (","+options.trigger+",").indexOf(",blur,")>=0){

            bindEvent(elem, "blur", function(){
              if(!verifyFormElement(elem, options) &&
                !options.feedback.call(elem, elem, options)){
                  return false;
                }
            });
          }
        if(utils.hasAttribute(elem, "verified")){
          bindEvent(elem, "change", function(){
            elem.setAttribute("verified", "");
          });
        }
      })(form.elements[i]);
    }

    form.setAttribute("novalidate", "novalidate");
  };

  /**
   * Get HTMLElement's type.
   * @param {HTMLElement} elem.
   * @return {String} element's type.
   */
  function getType(elem){
    var type = elem.type;
    // fieldset>legend
    if("undefined" == typeof type){return "";}
    if(type == "text"){
      type = elem.getAttribute("type") || "text";
    }
    return type.toLowerCase();
  }
  // XXX:
  // @deprecated
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
        // XXX: cache verified radio button.
        groupElemCatch = {};

    for(var i=0,e,type,val,l=form.elements.length; i<l; i++){
      e = form.elements[i];
      certified = certified && verifyFormElement(e, options);

      if(!certified && !feedback.call(e, e)){
        return false;
      }
    }
    return certified;
  }
  function verifyFormElement(e, options){
    if(e.readOnly || e.disabled){return true;}
    var certified = true;
    type = getType(e);
    if(!type){return true;}
    val = getValue(e);

    if(utils.hasAttribute(e, "required")){
      certified = certified && verifyRequired(e, type, val);
    }
    if(utils.hasAttribute(e, "minlength")){
      certified = certified && verifyMinlength(e, type, val);
    }
    if(utils.hasAttribute(e, "maxlength")){
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
    if(utils.hasAttribute(e, "pattern")){
      certified = certified && verifyPattern(e);
    }
    var name = e.getAttribute("name") || e.name || "";
    // verify user custom function.
    if(name && options.rules.hasOwnProperty(name) &&
        "function"==typeof options.rules[name]){

          // @param {Boolean} state, verify state from server.
          certified = certified && options.rules[name].call(e, e, function(state){
            if(!utils.hasAttribute(elem, "verified")){return;}
            elem.setAttribute("verified", state ? "valid" : "invalid");
          }, BUILD_IN_RULES);
        }
    // verify async from server.
    // XXX: init state.
    if(utils.hasAttribute(e, "verified")){
      certified = certified && "valid"==e.getAttribute("verified");
    }
    return certified;
  }
  // 验证必填项。
  function verifyRequired(elem, type, val){
    var form = elem.form,
        name = elem.name,
        elems = form[name],
        required = utils.hasAttribute(elem, "required"),
        checked = false;
    switch(type){
      case "radio":
        // XXX: ignore verifyed radio group.
        //if(this._cacheRadio.hasOwnProperty(name)){return true;}
        each(elem.form[elem.name], function(elem){
          if(utils.hasAttribute(elem, "required")){required = true;}
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
    return true;
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
    return true;
  }
  // XXX: Independent.
  var MIME_TYPE = {
    "text/plain": "txt",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "audio/mp3": "mp3"
  };
  function verifyFile(elem){
    var accept, val=elem.value;
    if(utils.hasAttribute(elem, "accept")){
      accept = elem.getAttribute("accept").split(",");
      for(var i=0,l=accept.length; i<l; i++){
        if(MIME_TYPE.hasOwnProperty(accept[i]) && !endsWith(val, accept[i])){
          return false;
        }
      }
    }
    return true;
  }
  // verify number type.
  function verifyNumber(elem){
    var val = elem.value, min, max;
    if(!isNumber(val)){return false;}

    val = parseFloat(val, 10);
    if(utils.hasAttribute(elem, "min")){
      min = elem.getAttribute("min");
      // XXX: if min not a positive number, return false?
      if(isPositiveNumber(min) && val < parseFloat(min, 10)){return false;}
    }
    if(utils.hasAttribute(elem, "max")){
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

    if(utils.hasAttribute(elem, "min")){
      min = Date.parse(elem.getAttribute("min"), format);
      // XXX: if min not a date, return false?
      certified = certified && (min instanceof Date) && (min > val);
    }
    if(utils.hasAttribute(elem, "max")){
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
  // TODO: global telephone pattern.
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

  module.exports = WebForms2;
});
