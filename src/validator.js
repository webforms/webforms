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
 * Example:
 *
 * new WebForms2(
 *     document.getElementById("formId"), {
 *     trigger: "blur,keyup", // default & required trigger: submit.
 *     rules: {
 *         // [name]
 *         "username": function(elem){},
 *         // [id]
 *         "#password": function(elem){}
 *     },
 *     // onerror -> onfail
 *     onerror: {
 *         "*": function(elem){}
 *     },
 *     onpass: {
 *         "*": function(elem){
 *         }
 *     }
 * }
 * );
 */
define(function(require, exports, module){

  var utils = require("./utils");
  var Events = require("events");

  var ALL_ELEMENTS = "*";
  var EVT = new Events();

  var Ruler = function(rule){
    this.test = rule;
  };

  var BUILD_IN_RULES = {
    email: /^\w+(?:[\._\-]\w+)*@\w+(?:\.\w+)+$/,
    mobile: /^(?:13[0-9]|147|15[0-35-9]|18[05-9])\d{8}$/,
    tel: /^\d{3,4}\-\d{7,8}$/,
    color: /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/,
    url: /^https?:\/\/\w+(?:\.\w+)+(?:\/[\w_\.\-]*)*$/,
    number: new Ruler(verifyNumber),
    date: new Ruler(verifyDate),
    datetime: new Ruler(verifyDatetime),
    datetimelocal: new Ruler(verifyDatetimeLocal),
    time: new Ruler(verifyTime),
    month: new Ruler(verifyMonth),
    week: new Ruler(verifyWeek)
  };

  var WebForms2 = function(form, options){
    options = options || {};

    if(!options.hasOwnProperty("rules")){
      options.rules = {};
    }
    if(!options.hasOwnProperty("onerror")){
      options.onerror = {};
    }
    if(!options.hasOwnProperty("onpass")){
      options.onpass = {};
    }

    var _submit = form.onsubmit;
    form.onsubmit = function(){
      if("function" === _submit && !_submit.call(form)){return false;}
      return verifyForm(form, options);
    };

    if(!options.hasOwnProperty("trigger")){
      options.trigger = "blur";
    }
    var triggers = options.trigger.split(",");
    utils.each(form.elements, function(elem){
      // 绑定事件，各个事件触发时进行表单校验。
      utils.each(triggers, function(trigger){
        utils.addEventListener(elem, trigger, function(){
          var certified = verifyFormElement(elem, options);
          feedback(elem, certified, options);
        });
      });
      if(utils.hasAttribute(elem, "verified")){
        utils.addEventListener(elem, "change", function(){
          elem.setAttribute("verified", "");
        });
      }
    });

    // 禁用现代浏览器默认的校验。
    // 避免交互风格不符合要求或不一致。
    form.setAttribute("novalidate", "novalidate");
  };

  /**
   * Get HTMLElement's type.
   * @param {HTMLElement} elem.
   * @return {String} element's type.
   */
  function getType(elem){
    // 不是直接用 getAttribute 的原因：
    // 对于 select, textarea 等可以直接活动 type。
    var type = elem.type;
    // fieldset>legend
    if("undefined" === typeof type){return "";}
    if(type === "text"){
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
    for (var i=0,type,name,l=form.elements.length; i<l; i++){
      var e = form.elements[i];
      type = getType(e);
      name = e.getAttribute("name") || e.name || "";
      switch(type){
      case "submit":
      case "reset":
      case "image":
      case "button":
        return null;
      case "radio":
      case "checkbox":
        if(!name){return null;}
        for(var j=0,m=form[name].length; j<m; j++){
          if(form[name][j].checked){
            a.push(form[name][j].value);
          }
        }
        return a;
      case "select-one": // select>option
        return elem.value;
      case "select-multiple": // select[multiple]>option
        for(var k=0,n=elem.length; k<n; k++){
          if(elem[k].selected){
            a.push(elem[k].value);
          }
        }
        return a;
      // XXX: #7. 正确处理 hidden, disabled, readonly 字段。
      default: // text, textarea, password, hidden, file(only file name).
        return elem.value;
      }
    }
  }

  /**
   * 统一反馈函数，单个表单项（包括循环整个表单）的反馈时调用这个函数。
   *
   * @param {HTMLElement} elem, 需要反馈的表单项。
   * @param {Boolean} certified, 是否通过校验。
   * @param {Object} options, WebForms2 的选项。
   */
  function feedback(elem, certified, options){
    var name = elem.getAttribute("name");
    var id = elem.getAttribute("id");
    var onerror = options.onerror;
    var onpass = options.onpass;

    if(!certified){
      if(onerror.hasOwnProperty(ALL_ELEMENTS)){
        onerror[ALL_ELEMENTS].call(elem, elem);
      }
      if(onerror.hasOwnProperty(name)){
        onerror[name].call(elem, elem);
      }
      if(onerror.hasOwnProperty(id)){
        onerror[id].call(elem, elem);
      }
      if(options.fastbreak){
        return false;
      }
    }else{
      if(onpass.hasOwnProperty(ALL_ELEMENTS)){
        onpass[ALL_ELEMENTS].call(elem, elem);
      }
      if(onpass.hasOwnProperty(name)){
        onpass[name].call(elem, elem);
      }
      if(onpass.hasOwnProperty(id)){
        onpass[id].call(elem, elem);
      }
    }
  }

  /**
   * 表单统一验证入口
   *
   * @param {HTMLFormElement} form, form element.
   * @param {Object} options.
   */
  function verifyForm(form, options){
    var certified = true;
    // XXX: cache verified radio button.
    //var groupElemCatch = {};

    for(var i=0,elem,v,l=form.elements.length; i<l; i++){
      elem = form.elements[i];

      v = verifyFormElement(elem, options, true);
      certified = certified && v;

      feedback(elem, v, options);
    }
    return certified;
  }
  function verifyFormElement(e, options){
    if(e.readOnly || e.disabled){return true;}
    var certified = true;
    var type = getType(e);
    if(!type){return true;}
    var val = getValue(e);

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

    // verify user custom function.
    var name = e.getAttribute("name");
    if(name){
      certified = certified && verifyFunction(name, e, val, options);
    }
    var id = e.getAttribute("id");
    if(id){
      certified = certified && verifyFunction("#"+id, e, val, options);
    }
    // verify async from server.
    // XXX: init state.
    if(utils.hasAttribute(e, "verified")){
      certified = certified && "valid" === e.getAttribute("verified");
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
      utils.each(elem.form[elem.name], function(elem){
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
      return "" !== elem.value;
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
        if(MIME_TYPE.hasOwnProperty(accept[i]) &&
            !utils.endsWith(val, accept[i])){
          return false;
        }
      }
    }
    return true;
  }
  // verify number type.
  function verifyNumber(elem){
    var val = elem.value, min, max;
    if(!utils.isNumber(val)){return false;}

    val = parseFloat(val, 10);
    if(utils.hasAttribute(elem, "min")){
      min = elem.getAttribute("min");
      // XXX: if min not a positive number, return false?
      if(utils.isPositiveNumber(min) && val < parseFloat(min, 10)){return false;}
    }
    if(utils.hasAttribute(elem, "max")){
      max = elem.getAttribute("max");
      // XXX: if min not a positive number, return false?
      if(utils.isPositiveNumber(max) && val > parseFloat(max, 10)){return false;}
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
    var val = elem.value;
    return BUILD_IN_RULES.mobile.test(val) || BUILD_IN_RULES.tel.test(val);
  }
  // verify url.
  function verifyUrl(elem){
    return BUILD_IN_RULES.url.test(elem.value);
  }

  function verifyEmail(elem){
    return BUILD_IN_RULES.email.test(elem.value);
  }

  // verify color.
  // @see http://www.w3.org/pub/WWW/Graphics/Color/sRGB.html
  function verifyColor(elem){
    var val = elem.value;
    return BUILD_IN_RULES.color.test(val);
  }

  // 验证自定义模式表达式。
  // XXX: debug 模式下，可以自动发现模式不正确的问题。
  function verifyPattern(elem){
    var pattern = elem.getAttribute("pattern");
    try{pattern = new RegExp(pattern);}catch(ex){
      // for form developer debug.
      alert("Invalid pattern: "+pattern+"\n"+ex.message);
      return false;
    }
    return pattern.test(elem.value);
  }

  /**
   * 校验自定义函数。
   * @param {HTMLElement} e, 被校验的表单元素。
   * @param {String} id, 规则 ID.
   * @return {Boolean} 通过校验则返回 true，否则返回 false。
   */
  function verifyFunction(id, e, val, options){
    if(id && options.rules.hasOwnProperty(id) &&
        "function" === typeof options.rules[id]){

      // `!!` 是为了避免自定义校验函数返回非 Boolean 类型。
      return !!options.rules[id].call(e, val, e, BUILD_IN_RULES,
          // @param {Boolean} state, verify state from server.
          function(state){

        if(!utils.hasAttribute(e, "verified")){return;}
        e.setAttribute("verified", state ? "valid" : "invalid");
      });
    }
    // 没有对应自定义函数，直接通过校验。
    return true;
  }

  /**
   * 绑定 WebForms2 的事件。
   * WebForms2 支持以下事件类型：
   *
   *    - error
   *
   * @param {String} evt, Event Type.
   * @param {Function} handler, Event Handler.
   */
  WebForms2.prototype.on = function(evt, handler){
    return EVT.on(evt, handler);
  };

  module.exports = WebForms2;
});
