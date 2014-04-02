define(function(require, exports, module) {

  var AutoFocus = require("./autofocus");
  var utils = require("./utils");
  var Events = require("events");
  var Validator = require("./validator");
  var RE_ID_SELECTOR = /^#/;

  var DEFAULT_OPTIONS = {
    plugins: {
      validator: true,
      autofocus: true
    }
  };

  // 构造函数。
  // @param {HTMLFormElement,String} form, 表单对象。
  // @param {Object} options.
  var WebForms = function(form, options){

    if("string" === typeof form){
      form = document.getElementById(form.replace(RE_ID_SELECTOR, ""));
    }else if(form instanceof window.jQuery){
      form = form[0];
    }

    if(!form || form.tagName.toLowerCase() !== "form"){
      throw new Error('Require HTMLFormElement.');
      return;
    }

    var me = this;
    this.form = form;

    this.options = utils.merge(DEFAULT_OPTIONS, options);
    this._evt = new Events();

    //for(var plugin in this.options.plugins){
      //if(this.options.hasOwnProperty(plugin) && this.options.plugins[plugin]){
        //this.options.plugins[plugin].call(this);
      //}
    //}

    if(this.options.plugins && this.options.plugins.validator){
      var _validator = new Validator(this, this.options.validation);
      _validator.on("invalid", function(field){
        me._evt.trigger("validate:invalid", field);
      }).on("valid", function(field){
        me._evt.trigger("validate:valid", field);
      }).on("complete", function(certified){
        me._evt.trigger("validate:complete", certified, me);
      });
      this.validate = function(){
        return _validator.validate.call(_validator);
      };
      // TODO: trigger form validate passed event.
    }

  };

  WebForms.prototype = {

    // 自定义事件绑定。
    // @param {String} eventName, 事件名称。
    // @param {Function} handler, 事件处理函数。
    // @return {WebForms}
    on: function(eventName, handler){
      this._evt.on(eventName, handler, this);
      return this;
    },

    // 取消事件绑定。
    // @param {String} eventName, 可选，事件名称。
    // @param {Function} handler, 可选，事件处理函数。
    // @return {WebForms}
    off: function(eventName, handler){
      this._evt.off(eventName, handler, this);
      return this;
    },

    // 通用获取元素方法。
    // @param {String} selector, 选择器。
    //      #id, ID 选择器，
    get: function(selector){
      if(selector === "form"){
        return this.form;
      }else if(selector === "elements"){
        return this.form.elements;
      }else if(selector === "fields"){

        var fields = [];

        this.each(function(element){
          var tagName = element.tagName.toLowerCase();
          if("input" === tagName ||
              "textarea" === tagName ||
              "select" === tagName){

            fields.push(element);
          }
        });

        return fields;

      }else{

        var elements = this.get("elements");
        var name = utils.startsWith(selector, "#") ? "id" : "name";
        selector = selector.replace(RE_ID_SELECTOR, "");

        for(var i=0,element,l=elements.length; i<l; i++){
          element = elements[i];
          if(element.getAttribute(name) === selector){
            return element;
          }
        }

        return null;

      }
    },

    // 遍历 Form 子元素。
    each: function(handler){
      if(typeof handler !== "function"){return;}

      utils.each(this.get("elements"),
          utils.function_createDelegate(this, function(element){

        var type = this.typeOf(element);
        handler.call(this, element, type);

      }));
    },

    // 获取元素的声明类型。
    // 旧版 IE 内核浏览器不支持 type="number" 等类型。
    // @param {HTMLElement} element, 目标元素。
    // @return {String}
    typeOf: function(elem){
      // 不是直接用 getAttribute 的原因：
      //   对于 select, textarea 等可以直接获得 type。
      var type = elem.type;
      // fieldset>legend
      if("undefined" === typeof type){return "";}
      if(type === "text"){
        type = elem.getAttribute("type") || "text";
      }
      return type.toLowerCase();
    },

    // @return {String} 根据用户在表单中的输入值，返回表单的查询字符串。
    queryString: function(){
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
    }

  };

  module.exports = WebForms;
});
