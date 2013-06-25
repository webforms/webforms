/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/06/12
 */

define(function(require, exports, module){
  var $ = require("$");

  var formItemClass = ".ui-form-item";
  var hoverClass = "ui-form-item-hover";
  var errorClass = "ui-form-item-error";
  var focusClass = "ui-form-item-focus";
  var msgClass = "ui-form-explain";

  function getFieldItem(input){
    var item = $(input).parent(formItemClass);
    // for checkbox.
    if(item.length === 0){
      item = $(input).parent().parent(formItemClass);
    }
    return item;
  }

  function showMessage(input){
    var $input = $(input);
    var msg = $input.siblings("."+msgClass);
    if(0 === msg.length){
      msg = $('<div class="'+msgClass+'"><div>').appendTo($(input).parent());
    }
    msg.html('<em class="ui-form-arrow" style="position: absolute; left: -7px; top: 10px;"></em>' +
      $input.attr("validationMessage") || "").show();
    return msg;
  }
  function hideMessage(input){
    var $input = $(input);
    var msg = $input.siblings("."+msgClass);
    if(0 === msg.length){
      return;
    }
    msg.hide();
    return msg;
  }

  module.exports = {
    onfail: {
      "*": function(field){
        console.log("fail value:",field.value)
        if(!field.value){return;}
        var elem = field.element;
        getFieldItem(elem).addClass(errorClass);
        showMessage(elem);
      }
    },
    onpass: {
      "*": function(field){
        console.log("pass value:",field.value)
        var elem = field.element;
        getFieldItem(elem).removeClass(errorClass);
      }
    },
    onfocus: {
      "*": function(field){
        var elem = field.element;
        getFieldItem(elem).removeClass(errorClass).addClass(focusClass);
        showMessage(elem);
      }
    },
    onblur: {
      "*": function(field){
        var elem = field.element;
        getFieldItem(elem).removeClass(focusClass).addClass(errorClass);
        if(!field.value){
          hideMessage(elem);
        }
      }
    },
    onmouseover: {
      "*": function(field){
        var elem = field.element;
        getFieldItem(elem).addClass(hoverClass);
      }
    },
    onmouseout: {
      "*": function(field){
        var elem = field.element;
        getFieldItem(elem).removeClass(hoverClass);
      }
    }
  };
});
