
var $ = require("jquery");

var VALIDATION_MESSAGE = "validationMessage";

module.exports = function(){
  this.on("invalid", function(field, inputing){
    var elem = $("[name=" + field.name + "]");
    var parent = elem.parent(".controls").parent(".control-group");
    var message = elem.siblings(".help-inline:first");
    // for checkbox.
    if(parent.length === 0){
      parent = elem.parent().parent(".controls").parent(".control-group");
    }
    if (inputing) {
      parent.removeClass("error success");
    } else {
      parent.removeClass("success").addClass("error");
    }
    message.html(elem.attr(VALIDATION_MESSAGE));
  }).on("valid", function(field, inputing){
    var elem = $("[name=" + field.name + "]");
    var parent = elem.parent(".controls").parent(".control-group");
    if(parent.length === 0){
      parent = elem.parent().parent(".controls").parent(".control-group");
    }
    if (inputing) {
    } else {
      parent.removeClass("error").addClass("success");
    }
  }).on("focus", function(evt, field){
    field.parent().parent().removeClass("error");
  });
};
