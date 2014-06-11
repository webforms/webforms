
var Univ = require("univ");
var Event = require("events").EventEmitter;

function merge(){
}

function getRule(form){

  var elements = form.elements;
  var rules = {};

  for(var i=0,l=elements.length; i<l; i++){
    var type = elements[i].getAttribute("type");
    var name = elements[i].getAttribute("name");
    var required = elements[i].hasAttribute("required");
    var multiple = elements[i].hasAttribute("multiple");
    var min = elements[i].hasAttribute("min");
    var max = elements[i].hasAttribute("max");
    var minlength = elements[i].hasAttribute("minlength");
    var maxlength = elements[i].hasAttribute("maxlength");
    var pattern = elements[i].hasAttribute("pattern");
    var accept = elements[i].hasAttribute("accept");
    var step = elements[i].hasAttribute("step");

    if(!name){continue;}

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
      rules[name] = merge(rules[name], rule);
    }
  }

}


function getValue(form){

  var elements = form.elements;
  var datas = {};

  for(var i=0,l=elements.length; i<l; i++){
    var name = elements[i].getAttribute("name");
    var value = elements[i].value;

    if(!name){continue;}
    if(!datas.hasOwnProperty(name)){
      datas[name] = [value];
    }else{
      datas[name].push(value);
    }
  }

}



var WebForms = function(form){
  this._form = form;
  this._evt = new Event();
};

WebForms.prototype.validate = function(){
  var rule = getRule(this._form);
  var univ = new Univ(rule);
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

  }).validate(getValue(this._form));
};

WebForms.prototype.submit = function(){
  var me = this;
  this._evt.once("validation", function(certified){
    if(certified){
      me.submit();
    }
  });
  this.validate();
};
