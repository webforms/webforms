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

function getRule(form){

  var elements = form.elements;
  var rules = {};

  for(var i=0, element, l=elements.length; i<l; i++){
    element = elements[i];
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
    var readonly = element.readonly;

    if(!name){continue;}
    if(disabled || readonly){continue;}

    switch(type){
    case 'submit':
    case 'button':
    case 'reset':
    case 'image':
    case 'hidden':
      continue;
    }

    var rule = {
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
  if(isString(form)){
    form = document.getElementById(form.replace(RE_ID_SELECTOR, ""));
  }else if(form.jquery){
    form = form[0];
  }else if(!form.elements){
    throw new Error("form "+form+" is not support.");
  }
  this._form = form;
  this._options = options || {};
  this._evt = new Event();
  this._submitter = null;
  this._submitters = [];

  var me = this;
  eachField(form, function(field){
    var type = getType(field);
    if(type === "submit" || type === "image"){
      me._submitters.push(field);
      field.addEventListener("click", function(){
        me._submitter = this;
      });
    }
  });

  $form = $(form);
  $form.attr("novalidate", "novalidate");
  $(form).submit(function(){
    me.submit();
    return false;
  });
};

WebForms.prototype.validate = function(){
  var rule = getRule(this._form);
  var univ = new Univ(mergeCustom(rule, this._options.rule || {}, "custom"));
  var data = getValues(this._form, this._submitter || this._submitters[0], this._options.test);
  var me = this;

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

  this._submitter = null;

};

WebForms.prototype.submit = function(){
  var me = this;
  this._evt.once("complete", function(certified){
    if(certified){
      me.emit("submit", me._form);
      me.submit();
    }
  });
  this.validate();
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
