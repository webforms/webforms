define(function(require, exports, module) {

  var utils = require("./utils");
  var Events = require("events");
  var Validator = require("./validator");
  var AutoFocus = require("./autofocus");

  // 构造函数。
  // @param {HTMLFormElement} form, 表单对象。
  // @param {Object} options.
  var WebForms2 = function(form, options){

    var ME = this;
    this.form = form;
    this.options = options;
    this._evt = new Events();

    this._validator = new Validator(this);
    this._validator.on("fail", function(){
      ME._evt.trigger("validate:fail");
    });
    // TODO: trigger form validate passed event.

  };

  WebForms2.prototype = {

    // 自定义事件绑定。
    on: function(eventName, handler){
      this._evt.on(eventName, handler, this);
    },

    // 取消事件绑定。
    off: function(eventName, handler){
      this._evt.off(eventName, handler, this);
    },

    // 遍历 Form 子元素。
    each: function(handler){
      utils.each(this.form.elements, handler, this);
    }

  };

  module.exports = WebForms2;
});
