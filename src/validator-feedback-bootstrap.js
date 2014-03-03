/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/06/12
 */

define(function(require, exports, module){
  var $ = require("$");

  var VALIDATION_MESSAGE = "validationMessage";

  module.exports = {
    oninvalid: {
      "*": function(field){
        var elem = $(field.element);
        var parent = elem.parent(".controls").parent(".control-group");
        var message = elem.siblings(".help-inline:first");
        // for checkbox.
        if(parent.length === 0){
          parent = elem.parent().parent(".controls").parent(".control-group");
        }
        parent.removeClass("success").addClass("error");
        message.html(elem.attr(VALIDATION_MESSAGE));
      }
    },
    onvalid: {
      "*": function(field){
        var elem = $(field.element);
        var parent = elem.parent(".controls").parent(".control-group");
        if(parent.length === 0){
          parent = elem.parent().parent(".controls").parent(".control-group");
        }
        parent.removeClass("error").addClass("success");
      }
    }
  };
});
