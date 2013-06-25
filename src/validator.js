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
 *     onfail: {
 *         "*": function(elem){}
 *     },
 *     onpass: {
 *         "*": function(elem){
 *         }
 *     }
 * }
 *
 * TODO: new WebForms2(form, {feedback: "alipay"});
 *
 */
define(function(require, exports, module){

  var utils = require("./utils");
  var Events = require("events");

  var ALL_ELEMENTS = "*";

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


  var DEFAULT_OPTIONS = {
    rules: {},
    onfail: {},
    onpass: {},
    trigger: "blur",
    autoFocus: true
  };

  var WebForms2 = function(form, options){
    if("string" === typeof form){
      form = document.getElementById(form.replace(/^#/, ""));
    }
    var opt = utils.extend(DEFAULT_OPTIONS, options);
    if(options.hasOwnProperty("autofocus")){
      opt.autoFocus = options.autofocus;
    }

    this._EVT = new Events();
    this._form = form;
    this.RULE = BUILD_IN_RULES;

    var _submit = form.onsubmit;
    var ME = this;
    form.onsubmit = function(){
      if("function" === _submit && !_submit.call(form)){return false;}
      return verifyForm(form, opt, ME);
    };

    if(opt.hasOwnProperty("feedback")){
      require.async("validator-feedback-"+opt.feedback, function(feedback){
        bindAll(feedback, ME);
      });
    }

    ME.on("change", function(field){
      verifyFormElement(field, opt, ME);
    });
    // blur,keyup,change
    //var triggers = opt.trigger.split(",");
    utils.each(form.elements, function(elem){
      // 绑定事件，各个事件触发时进行表单校验。
      //utils.each(triggers, function(trigger){
        //utils.addEventListener(elem, trigger, function(){
          //var certified = verifyFormElement(field, opt, ME);
          //ME._EVT.trigger(certified ? "pass": "fail", field);
        //});
      //});
      if(utils.hasAttribute(elem, "verified")){
        utils.addEventListener(elem, "change", function(){
          elem.setAttribute("verified", "");
        });
      }
      utils.addEventListener(elem, "change", triggerEvent("change", ME));
      utils.addEventListener(elem, "propertychange", triggerEvent("change", ME));
      utils.addEventListener(elem, "input", triggerEvent("change", ME));
      utils.addEventListener(elem, "focus", triggerEvent("focus", ME));
      utils.addEventListener(elem, "blur", triggerEvent("blur", ME));
      utils.addEventListener(elem, "mouseover", triggerEvent("mouseover", ME));
      utils.addEventListener(elem, "mouseout", triggerEvent("mouseout", ME));
    });

    bindAll(options, ME);

    // 禁用现代浏览器默认的校验。
    // 避免交互风格不符合要求或不一致。
    form.setAttribute("novalidate", "novalidate");
  };

  function triggerEvent(evt, context){
    return function(){
      var field = makeField(this);
      context._EVT.trigger(evt, field);
    }
  }

  // 遍历所有表单项。
  // @param {Function} handler, 遍历过程中的处理函数。
  WebForms2.prototype.each = function(handler){
    utils.each(this._form.elements, function(elem){
      handler.call(this, makeField(elem));
    });
  };

  function bindAll(options, context){
    bind("pass", options, context);
    bind("fail", options, context);
    bind("change", options, context);
    bind("focus", options, context);
    bind("blur", options, context);
    bind("mouseover", options, context);
    bind("mouseout", options, context);
  }
  function bind(evt, options, context){
    var onevt = "on"+evt;
    if(!options.hasOwnProperty(onevt)){return;}
    context.on(evt, function(field){
      var elem = field.element;
      if(options[onevt].hasOwnProperty(ALL_ELEMENTS)){
        options[onevt][ALL_ELEMENTS].call(context, field);
      }
      var name = elem.getAttribute("name");
      if(name && options[onevt].hasOwnProperty(name)){
        options[onevt][name].call(context, field);
      }
      var id = elem.getAttribute("id");
      if(id && options[onevt].hasOwnProperty("#" + id)){
        options[onevt]["#" + id].call(context, field);
      }
    }, context);
  }

  /**
   * Get HTMLElement's type.
   * @param {HTMLElement} elem.
   * @return {String} element's type.
   */
  function getType(elem){
    // 不是直接用 getAttribute 的原因：
    // 对于 select, textarea 等可以直接获得 type。
    var type = elem.type;
    // fieldset>legend
    if("undefined" === typeof type){return "";}
    if(type === "text"){
      type = elem.getAttribute("type") || "text";
    }
    return type.toLowerCase();
  }
  // 获取表单项的值。
  // @param {HTMLInputElement} elem, 表单项。
  // @return {String} 返回表单项的值。
  function getValue(elem){
    if(!elem || !elem.form){return null;}
    var type = getType(elem);
    var name = elem.getAttribute("name");
    var form = elem.form;
    var values = [];

    switch(type){
    case "radio":
    case "checkbox":
      if(!name){return null;}
      for(var i=0,l=form[name].length; i<l; i++){
        if(form[name][i].checked){
          values.push(form[name][i].value);
        }
      }
      return values;
    case "select-multiple": // select[multiple]>option
      for(var i=0,l=elem.length; i<l; i++){
        if(elem[i].selected){
          values.push(elem[i].value);
        }
      }
      return values;
    // `text`, `textarea`, `password`, `hidden`,
    // `file`(only file name),
    // `select-one` (select>option)
    // `submit`, `reset`, `image`, `button`.
    default:
      return elem.value;
    }
  }

  // 构建通用表单字段信息，用于数据传递。
  // @param {HTMLInputElement} elem, 表单项元素。
  // @return {Object}
  function makeField(elem){
    return {
      element: elem,
      name: elem.getAttribute("name"),
      id: elem.getAttribute("id"),
      type: getType(elem),
      value: getValue(elem)
    };
  }
  // 表单统一验证入口
  //
  // @param {HTMLFormElement} form, form element.
  // @param {Object} options.
  function verifyForm(form, options, context){
    var certified = true;
    var focused = false; // 自动聚焦标志。
    var field;
    var passedFields = []; // 通过校验的字段。
    var failedFields = []; // 未通过校验的字段。
    // XXX: cache verified radio button.
    //var groupElemCatch = {};

    for(var i=0,elem,v,l=form.elements.length; i<l; i++){
      elem = form.elements[i];

      field = makeField(elem);
      v = verifyFormElement(field, options, context);
      // Note: field 不添加 passed 属性，各个事件中不需要、也不应该需要这个状态。
      if(!v){
        failedFields.push(field);
        if(options.autoFocus && !focused){
          try{
            elem.select();
            focused = true;
          }catch(ex){
            context._EVT.trigger("error", field, ex);
          }
        }
      }else{
        passedFields.push(field);
      }
      certified = certified && v;
    }
    var _form = {
      element: form,
      action: form.getAttribute("action"),
      method: form.getAttribute("method"),
      passedFields: passedFields,
      failedFields: failedFields,
      passed: certified
    };

    context._EVT.trigger("validated", _form);
    if(certified){context._EVT.trigger("submit", _form);}
    return certified;
  }

  // 校验一个表单元素。
  //
  // @param {HTMLElement} elem, 指定的表单元素。
  // @param {Object} options, 选项。
  function verifyFormElement(field, options, context){
    var elem = field.element;
    // XXX: #7, 不可编辑表单项的校验。
    if(elem.readOnly || elem.disabled){return true;}
    var certified = true;
    var type = field.type;
    if(!type || "submit"===type || "button"===type ||
        "reset"===type || "image"===type || "fieldset"===type){
      return true;
    }
    var val = field.value;

    if(utils.hasAttribute(elem, "required")){
      certified = certified && verifyRequired(elem, type, val);
    }
    if(utils.hasAttribute(elem, "minlength")){
      certified = certified && verifyMinlength(elem, type, val);
    }
    if(utils.hasAttribute(elem, "maxlength")){
      certified = certified && verifyMaxlength(elem, type, val);
    }
    switch(type){
    //case "submit":
    //case "button":
    //case "reset":
    //case "image":
      //return true;
    case "radio":
    case "checkbox":
    case "select-one":
    case "select-multiple":
    case "text":
    case "password":
    case "hidden":
    case "search":
    case "textarea":
      break;
    case "file":
      certified = certified && verifyFile(elem);
      break;
    case "number":
    case "range":
      certified = certified && verifyNumber(elem);
      break;
    case "month":
      certified = certified && verifyMonth(elem);
      break;
    case "time":
      certified = certified && verifyTime(elem);
      break;
    case "week":
      certified = certified && verifyWeek(elem);
      break;
    case "date":
      certified = certified && verifyDate(elem);
      break;
    case "datetime":
      certified = certified && verifyDatetime(elem);
      break;
    case "datetime-local":
      certified = certified && verifyDatetimeLocal(elem);
      break;
    case "url":
      certified = certified && verifyUrl(elem);
      break;
    case "email":
      certified = certified && verifyEmail(elem);
      break;
    case "tel":
      certified = certified && verifyTel(elem);
      break;
    case "color":
      certified = certified && verifyColor(elem);
      break;
    default:
      break;
    }
    if(utils.hasAttribute(elem, "pattern")){
      certified = certified && verifyPattern(elem);
    }

    // verify user custom function.
    var name = elem.getAttribute("name");
    if(name && options.rules.hasOwnProperty(name) &&
        "function" === typeof options.rules[name]){
      certified = certified && verifyFunction(field, options.rules[name], context);
    }
    var id = elem.getAttribute("id");
    var _id = "#" + id;
    if(id && options.rules.hasOwnProperty(_id) &&
        "function" === typeof options.rules[_id]){
      certified = certified && verifyFunction(field, options.rules[_id], context);
    }
    // 校验异步状态。
    // 需要异步校验的表单项，需要在表单元素上设置 `verified` 属性，值为空即可。
    // 表单校验成功后，会设置为合适的值：
    //
    //  - [verified=""]        尚未校验。
    //  - [verified="valid"]   已通过校验。
    //  - [verified="invalid"] 未通过校验
    if(utils.hasAttribute(elem, "verified")){
      certified = certified && "valid" === elem.getAttribute("verified");
    }

    context._EVT.trigger(certified ? "pass": "fail", field);
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

    val = utils.date_parse(val, format);
    certified = certified && (val instanceof Date);

    if(utils.hasAttribute(elem, "min")){
      min = utils.date_parse(elem.getAttribute("min"), format);
      // XXX: if min not a date, return false?
      certified = certified && (min instanceof Date) && (min > val);
    }
    if(utils.hasAttribute(elem, "max")){
      max = utils.date_parse(elem.getAttribute("max"), format);
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
   * @param {HTMLElement} elem, 被校验的表单元素。
   * @param {String} id, 规则 ID.
   * @return {Boolean} 通过校验则返回 true，否则返回 false。
   */
  function verifyFunction(field, rule, context){
    var elem = field.element;

    // @param {Boolean} state, verify state for async callback.
    var certified = rule.call(context, field, function(state){
      if(!utils.hasAttribute(elem, "verified")){return;}
      elem.setAttribute("verified", state ? "valid" : "invalid");
      context._EVT.trigger(state ? "pass" : "fail", field);
    });
    // 异步校验的函数可以省略返回。
    return typeof certified === "undefined" ? true : !!certified;
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
    return this._EVT.on(evt, handler);
  };

  // @return {String} 根据用户在表单中的输入值，返回表单的查询字符串。
  WebForms2.prototype.queryString = function(){
    var query = [];
    this.each(function(field){
      switch(field.type){
      case "radio":
      case "checkbox":
        if(field.element.checked){
          query.push(field.name + "=" + encodeURIComponent(field.value));
        }
        break;
      case "select-multiple":
        var elem = field.element;
        var options = elem.options;
        for(var i=0,l=options.length; i<l; i++){
          if(options[i].selected){
            query.push(field.name + "=" + encodeURIComponent(options[i].value));
          }
        }
        break;
      default:
        query.push(field.name + "=" + encodeURIComponent(field.value));
      }
    });
  };

  module.exports = WebForms2;
});
