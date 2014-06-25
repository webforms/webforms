// TODO: hasAttribute()
// TODO: addEventListener()

var Univ = require("univ");
var Event = require("events").EventEmitter;

var RE_ID_SELECTOR = /^#/;

function isString(object){
  return Object.prototype.toString.call(object) === '[object String]';
}

function isFunction(object){
  return Object.prototype.toString.call(object) === '[object Function]';
}

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
      datas[name] = [];
    }
    datas[name].push(value);
    if(name=="number-4"){
      console.log("A", '"'+value+'"', datas, test_mode)
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
};

WebForms.prototype.validate = function(){
  var rule = getRule(this._form);
  var univ = new Univ(mergeCustom(rule, this._options.rule || {}, "custom"));
  var data = getValues(this._form, this._submitter || this._submitters[0], this._options.test);
  var me = this;

  if(rule["number-4"]){
    console.log("O",rule,data);
  }

  univ.on("invalid", function(name, value, validaty){

    //if(name == "text-minlength-2")
      //console.log("D", name, value, rule, data, me._form.innerHTML)
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
    //!DEBUG
    //if(rule["text-minlength-2"])
      //console.log("V", certified, rule, data, me._form.innerHTML)

    me._evt.emit("validation", certified);

  }).validate(data);

  this._submitter = null;

};

WebForms.prototype.submit = function(){
  var me = this;
  this._evt.once("validation", function(certified){
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
