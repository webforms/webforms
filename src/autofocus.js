
define(function(require) {

  var nativeSupportAutoFocus = require("./feature-detector").autofocus;
  if(nativeSupportAutoFocus){return;}

  var $ = require("$");

  $(function(){
    $('[autofocus]:first').select();
  });

});
