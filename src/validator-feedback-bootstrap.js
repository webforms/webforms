/**
 * @overview
 *
 * @author 闲耘™ (hotoo.cn[AT]gmail.com)
 * @version 2013/06/12
 */

define(function(require, exports, module){
  var $ = require("$");

  module.exports = {
    onfail: {
      "*": function(field){
        var elem = field.element;
        var parent = $(elem).parent(".controls").parent(".control-group");
        // for checkbox.
        if(parent.length === 0){
          parent = $(elem).parent().parent(".controls").parent(".control-group");
        }
        parent.removeClass("success").addClass("error");
      }
    },
    onpass: {
      "*": function(field){
        var elem = field.element;
        var parent = $(elem).parent(".controls").parent(".control-group");
        if(parent.length === 0){
          parent = $(elem).parent().parent(".controls").parent(".control-group");
        }
        parent.removeClass("error").addClass("success");
      }
    }
  };
});
