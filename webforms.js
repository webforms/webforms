// TODO: hasAttribute()
// TODO: addEventListener()

var Univ = require("univ");
var Event = require("events").EventEmitter;
var $ = require("jquery");

var RE_ID_SELECTOR = /^#/;

function typeOf(type){
  return function(object){
    return Object.prototype.toString.call(object) === '[object '+type+']';
  }
}

var isString = typeOf("String");
var isArray = typeOf("Array");
var isFunction = typeOf("Function");

function eachField(form, handler){
  if(!form || !form.elements || !isFunction(handler)){return;}

  var elements = form.elements;
  for(var i=0, element, l=elements.length; i<l; i++){
    element = elements[i];
    handler.call(element, element, i);
  }
}

function mergeRule(origin, target){
  if(!target){return origin;}
  for(var key in origin){
    if(!origin.hasOwnProperty(key) ||
        !target.hasOwnProperty(key) ||
        target[key] == null){

      continue;
    }
    origin[key] = target[key];
  }
  return origin;
}

// Get HTMLElement's type.
// @param {HTMLElement} elem.
// @return {String} element's type.
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

function getRule(element) {
  var type = getType(element);
  var name = element.getAttribute("name");
  var required = element.hasAttribute("required");
  var multiple = element.hasAttribute("multiple");
  var min = element.getAttribute("min");
  var max = element.getAttribute("max");
  var minlength = element.getAttribute("minlength");
  var maxlength = element.getAttribute("maxlength");
  var pattern = element.getAttribute("pattern");
  var accept = element.getAttribute("accept");
  var step = element.getAttribute("step");
  var disabled = element.disabled;
  var readonly = element.readOnly;

  if(!name){return;}
  if(disabled || readonly){return;}

  switch(type){
  case 'submit':
  case 'button':
  case 'reset':
  case 'image':
  case 'hidden':
    return;
  }

  return {
    type: type,
    required: required,
    multiple: multiple,
    min: min,
    max: max,
    minlength: minlength,
    maxlength: maxlength,
    pattern: pattern,
    accept: accept,
    step: step
  };
}

function getRules(form){

  var elements = form.elements;
  var rules = {};

  for(var i=0, element, l=elements.length; i<l; i++){
    element = elements[i];
    var name = element.getAttribute("name");

    var rule = getRule(element);

    if (!rule) {continue;}

    if(!rules.hasOwnProperty(name)){
      rules[name] = rule
    }else{
      rules[name] = mergeRule(rules[name], rule);
    }
  }

  return rules;
}


// 获取表单项的值。
// @param {HTMLFormElement} form, 表单项。
// @param {HTMLInputElement} submitter。
// @param {Boolean} test_mode
// @return {Object}
function getValues(form, submitter, test_mode){

  var elements = form.elements;
  var datas = {};

  for(var i=0, element, l=elements.length; i<l; i++){
    element = elements[i];
    var name = element.getAttribute("name");
    var type = getType(element);
    var value = test_mode ? element.getAttribute("value") || element.value : element.value;

    if(!name){continue;}
    switch(type){
    case 'radio':
    case 'checkbox':
      if(!element.checked){
        continue;
      }
      break;
    case 'submit':
    case 'image':
      if(element !== submitter){
        continue;
      }
      break;
    case 'button':
    case 'reset':
      continue;
    }

    if(!datas.hasOwnProperty(name)){
      datas[name] = value;
    }else{
      if(!isArray(datas[name])){
        datas[name] = [ datas[name] ];
      }
      datas[name].push(value);
    }
  }

  return datas;
}

function mergeCustom(rules, customRules, customName){
  for(var name in customRules){
    if(customRules.hasOwnProperty(name) && rules.hasOwnProperty(name)){
      rules[name][customName] = customRules[name];
    }
  }
  return rules;
}


var WebForms = function(form, options){
  var me = this;
  form = me._form = $(form);
  me._options = options || {};
  me._evt = new Event();
  me._submitter = null;
  me._submitters = [];

  eachField(form[0], function(field){
    var type = getType(field);
    var $field = $(field);

    switch(type){
    case "hidden":
    case "button":
    case "reset":
      break;
    case "submit":
    case "image":
      me._submitters.push(field);
      $field.on("mousedown", function(){
        me._submitter = this;
      });
      break;
    default:
      $field.on("blur keyup", function(){
        me.validateField(this);
      });
    }

  });

  try {
    form.attr("novalidate", "novalidate");
  } catch (ex) { }

  form.submit(function(){
    me.submit();
    return false;
  });

  var feedback = me._options.feedback;
  if (feedback) {
    feedback.call(me);
  }

};

WebForms.prototype.validateField = function(field){
  var me = this;
  var name = field.getAttribute("name");
  var rule = {}; rule[name] = getRule(field);
  var value = field.value;
  var univ = new Univ(mergeCustom(rule, me._options.rule || {}, "custom"));
  var data = {}; data[name] = value;

  univ.on("invalid", function(name, value, validaty){

    me._evt.emit("invalid", {
      name: name,
      value: value,
      validaty: validaty
    });

  }).on("valid", function(name, value, validaty){

    me._evt.emit("valid", {
      name: name,
      value: value,
      validaty: validaty
    });

  }).validate(data);

};

WebForms.prototype.validate = function(){
  var me = this;
  var form = me._form[0];
  var rule = getRules(form);
  var univ = new Univ(mergeCustom(rule, me._options.rule || {}, "custom"));
  var data = getValues(form, me._submitter || me._submitters[0], me._options.test);

  univ.on("invalid", function(name, value, validaty){

    me._evt.emit("invalid", {
      name: name,
      value: value,
      validaty: validaty
    });

  }).on("valid", function(name, value, validaty){

    me._evt.emit("valid", {
      name: name,
      value: value,
      validaty: validaty
    });

  }).on("complete", function(certified){

    me._evt.emit("validation", certified);

  }).validate(data);

  me._submitter = null;

};

WebForms.prototype.submit = function(){
  var me = this;
  me._evt.once("complete", function(certified){
    if(certified){
      me.emit("submit", me._form);
      me.submit();
    }
  });
  me.validate();
};

WebForms.prototype.feedback = function(feedback){
  feedback.call(this);
  return this;
};

WebForms.prototype.on = function(eventName, handler){
  this._evt.on(eventName, handler);
  return this;
};

WebForms.prototype.off = function(eventName, handler){
  if(isFunction(handler)){
    this._evt.removeListener(eventName, handler);
  }else{
    this._evt.removeAllListeners(eventName, handler);
  }
  return this;
};

module.exports = WebForms;
