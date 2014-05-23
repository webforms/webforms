/**
 * Web Forms 2 Validate.
 * @param {HTMLFormElement} form.
 * @param {Object} options.
 * @see http://www.w3.org/TR/html5/forms.html
 *      http://dev.w3.org/html5/markup/input.html
 *      https://wiki.mozilla.org/DOM:Web_Forms_2.0
 *      http://miketaylr.com/pres/html5/forms2.html
 *      http://webforms2.testsuite.org/
 * @author 闲耘™(hotoo.cn[AT]gmail.com)
 *
 * Example:
 *
 * new Validator(
 *     document.getElementById("formId"), {
 *     trigger: "blur,keyup", // default & required trigger: submit.
 *     rules: {
 *         // [name]
 *         "username": function(elem){},
 *         // [id]
 *         "#password": function(elem){}
 *     },
 *     oninvalid: {
 *         "*": function(elem){}
 *     },
 *     onvalid: {
 *         "*": function(elem){
 *         }
 *     }
 * }
 *
 */
define(function(require, exports, module){

  var utils = require("./utils");
  var Events = require("events");
  var $ = require("$");

  var MODE = {
    TEST: "test",
    DEBUG: "debug",
    NORMAL: "normal"
  };
  var mode = MODE.TEST;

  var ALL_ELEMENTS = "*";

  var RE_BLANK = /^\s*$/; // 空白字符。
  var RE_INT = /^\d+$/; // 数值。

  var Ruler = function(rule){
    this.test = rule;
  };

  var BUILD_IN_RULES = {
    email: /^\w+(?:[\._\-]\w+)*@\w+(?:\.\w+)+$/,
    mobile: /^(?:13[0-9]|14[57]|15[0-35-9]|170|18[0-9])\d{8}$/,
    tel: /^\d{3,4}\-\d{7,8}$/,
    color: /^#[0-9a-fA-F]{6}$/,
    // [RFC1738](http://www.faqs.org/rfcs/rfc1738.html)
    url: /^https?:\/\/(?:[\w.-]*(?::[^@]+)?@)?(?:[\w-]+\.){1,3}[\w]+(?::\d+)?(?:\/.*)?$/,
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
    oninvalid: {},
    onvalid: {},
    trigger: "blur",
    autoFocus: true // 校验失败时是否自动聚焦在第一个未通过校验的表单项。
  };

  var Validator = function(webforms, options){

    options = this.options = utils.extend(DEFAULT_OPTIONS, options);
    // 兼容开发者使用小写属性。
    if(options && options.hasOwnProperty("autofocus")){
      options.autoFocus = options.autofocus;
    }

    this._EVT = new Events();
    this._webforms2 = webforms;
    this.form = webforms.form;
    this.RULE = BUILD_IN_RULES;

    var _submit = this.form.onsubmit;
    var ME = this;
    this.form.onsubmit = function(){
      if("function" === typeof _submit && !_submit.call(this)){return false;}
      var certified = verifyForm(this, options, ME);
      if(certified){
        context._EVT.trigger("submit", _form);
      }
      return certified;
    };

    if(options.hasOwnProperty("feedback")){
      ME.bindAll(options.feedback);
    }

    ME.on("change", function(field){
      verifyFormElement(field, options, ME);
    });
    ME.on("blur", function(field){
      if(!field.realtime){return;}
      verifyFormElement(field, options, ME);
    });

    // blur,keyup,change
    //var triggers = options.trigger.split(",");
    this._webforms2.each(function(element){
      // 绑定事件，各个事件触发时进行表单校验。
      //utils.each(triggers, function(trigger){
        //utils.addEventListener(elem, trigger, function(){
          //var certified = verifyFormElement(field, options, ME);
          //ME._EVT.trigger(certified ? "valid": "invalid", field);
        //});
      //});
      elem = $(element);

      if(utils.hasAttribute(element, "verified")){
        elem.change(function(){
          elem.attr("verified", "");
        });
      }
      elem.change(triggerEvent("change", ME));
      //utils.addEventListener(elem, "propertychange", triggerEvent("change", ME));
      elem.on("input", triggerEvent("change", ME));
      elem.focus(triggerEvent("focus", ME));
      elem.blur(triggerEvent("blur", ME));
      elem.mouseover(triggerEvent("mouseover", ME));
      elem.mouseout(triggerEvent("mouseout", ME));
    });

    ME.bindAll(options);

    // 禁用现代浏览器默认的校验。
    // 避免交互风格不符合要求或不一致。
    try{
      this.form.setAttribute("novalidate", "novalidate");
    }catch(ex){}
  };

  function triggerEvent(evt, context){
    return function(){
      var field = makeField(this);
      context._EVT.trigger(evt, field);
    }
  }

  // 遍历所有表单项。
  // @param {Function} handler, 遍历过程中的处理函数。
  Validator.prototype.each = function(handler){
    utils.each(this.form.elements, function(elem){
      handler.call(this, makeField(elem));
    });
  };

  // 批量绑定
  Validator.prototype.bindAll = function(options){
    this.bind("valid", options);
    this.bind("invalid", options);
    this.bind("change", options);
    this.bind("focus", options);
    this.bind("blur", options);
    this.bind("mouseover", options);
    this.bind("mouseout", options);
  }
  // 绑定对应事件为 options 对应的处理函数。
  Validator.prototype.bind = function(evt, options){
    var onevt = "on"+evt;
    if(!options.hasOwnProperty(onevt)){return;}

    this.on(evt, function(field){
      var elem = field.element;
      if(options[onevt].hasOwnProperty(ALL_ELEMENTS)){
        options[onevt][ALL_ELEMENTS].call(this, field);
      }
      var name = elem.getAttribute("name");
      if(name && options[onevt].hasOwnProperty(name)){
        options[onevt][name].call(this, field);
      }
      var id = elem.getAttribute("id");
      if(id && options[onevt].hasOwnProperty("#" + id)){
        options[onevt]["#" + id].call(this, field);
      }
    }, this);
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
    var form = elem.form;
    var formnovalidate = utils.hasAttribute(elem, "formnovalidate");
    var attr_realtime = "validationRealtime";
    var s_realtime = elem.getAttribute(attr_realtime);
    var realtime = false;
    if(utils.hasAttribute(elem, attr_realtime) && s_realtime !== "nonrealtime"){
      realtime = true;
    }
    if(!realtime && utils.hasAttribute(form, attr_realtime)){
      realtime = true;
    }
    var customError = elem.getAttribute("validation-message");

    return {
      form: form,
      element: elem,
      name: elem.getAttribute("name"),
      id: elem.getAttribute("id"),
      type: getType(elem),
      value: getValue(elem),
      realtime: realtime,
      willValidate: !formnovalidate,
      validity: {
        customError: !!customError,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        typeMismatch: false,
        valueMissing: false,
        badInput: false,
        valid: false
      }
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
    context._async_validation = 0;

    for(var i=0,elem,v,l=form.elements.length; i<l; i++){
      elem = form.elements[i];

      field = makeField(elem);
      if(field.willValidate === false){continue;}

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
    // XXX: clear this.
    var _form = {
      element: form,
      action: form.getAttribute("action"),
      method: form.getAttribute("method"),
      passedFields: passedFields,
      failedFields: failedFields,
      passed: certified
    };

    if(context._async_validation === 0){
      context._EVT.trigger("complete", certified);
    }
    return certified;
  }

  // 执行表单输入合法性校验。
  Validator.prototype.validate = function(){
    return verifyForm(this.form, this.options, this);
  };

  // 校验一个表单元素。
  //
  // @param {HTMLElement} elem, 指定的表单元素。
  // @param {Object} options, 选项。
  function verifyFormElement(field, options, context){
    if(!field.willValidate){return true;}
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
      certified = certified &&
        (field.validity.valueMissing = verifyRequired(field));
    }
    if(utils.hasAttribute(elem, "minlength")){
      certified = certified &&
        (field.validity.valid = verifyMinlength(field));
    }
    if(utils.hasAttribute(elem, "maxlength")){
      certified = certified &&
        (field.validity.tooLong = verifyMaxlength(elem, type, val));
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
    //console.log("verified", certified)

    if(context._async_validation === 0){
      context._EVT.trigger(certified ? "valid": "invalid", field);
    }
    return certified;
  }

  // 获取表单中zhi d指定名称的元素。
  // 当表单中没有同名元素时，form[name] 返回的是元素本身，而不是数组。
  // @param {HTMLFormElement} form
  // @param {String} name
  // @return {Array} 返回表单中名称匹配的所有元素。
  function getFormElementsByName(form, name){
    var elems = form[name];
    return elems.length ? elems : [elems];
  }

  // 验证必填项。
  function verifyRequired(field){
    var form = field.form;
    var elem = field.element;
    var name = field.name;
    var type = field.type;
    var val = field.value;
    var elems = form[name];
    var required = utils.hasAttribute(elem, "required");
    var checked = false;

    // http://www.w3.org/TR/html401/interact/forms.html#successful-controls
    // successful-controls 必须包含名字。
    if(!name){return false;}

    switch(type){
    case "radio":
      if(!this._cached_radio){this._cached_radio = {};}
      if(this._cached_radio.hasOwnProperty(name)){
        return this._cached_radio[name];
      }
      utils.each(getFormElementsByName(form, name), function(elem){
        if(utils.hasAttribute(elem, "required")){required = true;}
        if(elem.checked){checked = true;}
      });
      this._cached_radio[name] = checked;
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
      return !RE_BLANK.test(elem.value);
    }
  }

  function verifyMinlength(field){

    switch(field.type){
    case "radio":
    case "checkbox":
    case "select-multiple":
    case "select-one":
      return true;
    //case "text":
    default:
      break;
    }

    var minlength = field.element.getAttribute("minlength");
    if(RE_INT.test(minlength) &&
        (field.value.length < parseInt(minlength, 10))){

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
    if(RE_INT.test(maxlength) && (val.length > parseInt(maxlength, 10))){
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
    var accepts;
    var val = mode === MODE.TEST ? elem.getAttribute("value") || "" : elem.value;
    var fileNames = [];

    if("files" in elem && elem.files.length){
      for(var i=0,file,l=elem.files.length; i<l; i++){
        file = elem.files[i];
        fileNames.push(file.name || file.fileName);
      }
    }else if(elem.value){
      fileNames.push(elem.value);
    }

    if(utils.hasAttribute(elem, "accept")){

      accepts = elem.getAttribute("accept").split(",");

      var accept;
      var ext;

      for(var i=0,l=accepts.length; i<l; i++){

        accept = accepts[i];

        for(var j=0,m=fileNames.length; j<m; j++){

          if(MIME_TYPE.hasOwnProperty(accept)){
            ext = "." + MIME_TYPE[accept];
          }else if(utils.startsWith(accept, ".")){
            ext = accept;
          }else{
            return false;
          }

          if(!utils.endsWith(fileNames[j], ext)){
            return false;
          }
        }
      }

    }

    return true;
  }

  // verify number or range type.
  function verifyNumber(elem){
    var val = mode === MODE.TEST ? elem.getAttribute("value") || "" : elem.value;
    var min, max;

    if(!val){return true;}
    if(!utils.isNumber(val)){return false;}

    val = parseFloat(val, 10);
    if(utils.hasAttribute(elem, "min")){
      min = elem.getAttribute("min");
      // #12, if min not a positive number, return false?
      if(utils.isPositiveNumber(min) && val < parseFloat(min, 10)){return false;}
    }

    if(utils.hasAttribute(elem, "max")){
      max = elem.getAttribute("max");
      // #12, if min not a positive number, return false?
      if(utils.isPositiveNumber(max) && val > parseFloat(max, 10)){return false;}
    }

    return true;
  }

  // 校验日期时间的公共方法。
  function _verifyDateTimes(elem, defaultFormat){
    var val = mode !== MODE.TEST ? elem.value : elem.getAttribute("value") || "";
    var format = elem.getAttribute("data-format") || defaultFormat;
    var min, max;
    var certified = true;

    if(RE_BLANK.test(val)){return true;}

    val = utils.date_parse(val, format);
    certified = certified && (val instanceof Date);

    if(utils.hasAttribute(elem, "min")){
      min = utils.date_parse(elem.getAttribute("min"), format);
      // #12, if min not a date, return false?
      certified = certified && (min instanceof Date) &&
        (min.getTime() <= val.getTime());
    }
    if(utils.hasAttribute(elem, "max")){
      max = utils.date_parse(elem.getAttribute("max"), format);
      // #12, if min not a date, return false?
      certified = certified && (max instanceof Date) &&
        (max.getTime() >= val.getTime());
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
    if(!val){return true;}
    return BUILD_IN_RULES.mobile.test(val) || BUILD_IN_RULES.tel.test(val);
  }
  // verify url.
  function verifyUrl(elem){
    var val = elem.value;
    if(!val){return true;}
    return BUILD_IN_RULES.url.test(val);
  }

  function verifyEmail(elem){
    var val = elem.value;
    if(!val){return true;}
    return BUILD_IN_RULES.email.test(val);
  }

  // verify color.
  // @see http://www.w3.org/pub/WWW/Graphics/Color/sRGB.html
  function verifyColor(elem){
    var val = mode === MODE.TEST ? elem.getAttribute("value") || "" : elem.value;
    if(!val){return true;}
    return BUILD_IN_RULES.color.test(val);
  }

  // 验证自定义模式表达式。
  // XXX: debug 模式下，可以自动发现模式不正确的问题。
  function verifyPattern(elem){
    var pattern = elem.getAttribute("pattern");
    var value = elem.value;
    if(!value || !pattern){return true;}

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

    if(RE_BLANK.test(elem.value)){return true;}

    // @param {Boolean} state, verify state for async callback.
    if(utils.hasAttribute(elem, "verified")){
      context._async_validation++;
    }
    var certified = rule.call(context, field, function(state){
      if(!utils.hasAttribute(elem, "verified")){return;}
      elem.setAttribute("verified", state ? "valid" : "invalid");
      context._EVT.trigger(state ? "valid" : "invalid", field);

      context._async_validation--;
      if(context._async_validation === 0){
        // XXX: state is not the last state.
        // or donot call when validate invalid before.
        context._EVT.trigger("complete", state);
      }
    });
    // 异步校验的函数可以省略返回。
    return typeof certified === "undefined" ? true : !!certified;
  }

  /**
   * 绑定 Validator 的事件。
   * Validator 支持以下事件类型：
   *
   *    - error
   *
   * @param {String} evt, Event Type.
   * @param {Function} handler, Event Handler.
   */
  Validator.prototype.on = function(evt, handler){
    if(!evt || "function"!==typeof handler){return this;}
    this._EVT.on(evt, handler);
    return this;
  };
  Validator.prototype.off = function(evt, handler){
    this._EVT.off(evt, handler);
    return this;
  };

  module.exports = Validator;
});
