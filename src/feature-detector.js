// 检测浏览器原始支持的特性。
define(function(require, exports, module) {

  var testInput = document.createElement("input");
  var supportAutoFocus = "autofocus" in testInput;

  exports.autofocus = supportAutoFocus;
});
