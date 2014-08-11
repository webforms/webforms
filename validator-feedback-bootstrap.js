
var $ = require("jquery");

var VALIDATION_MESSAGE = "validationMessage";

module.exports = function(webforms){
  webforms.on("invalid", function(field){
    var elem = $(field.element);
    var parent = elem.parent(".controls").parent(".control-group");
    var message = elem.siblings(".help-inline:first");
    // for checkbox.
    if(parent.length === 0){
      parent = elem.parent().parent(".controls").parent(".control-group");
    }
    parent.removeClass("success").addClass("error");
    message.html(elem.attr(VALIDATION_MESSAGE));
  }).on("valid", function(field){
    var elem = $(field.element);
    var parent = elem.parent(".controls").parent(".control-group");
    if(parent.length === 0){
      parent = elem.parent().parent(".controls").parent(".control-group");
    }
    parent.removeClass("error").addClass("success");
  });
};
