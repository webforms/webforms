define(function(require) {

  var Validator = require('../src/validator');
  var $ = require('$');
  var expect = require('expect');

  describe('validator required', function() {

    var template = '<form id="form-required">' +
      '<input type="text" name="iptText" required />' +
      '<input type="password" name="iptPwd" required />' +
      '<input type="checkbox" name="iptCheckbox" required />' +
      '</form>';
    var form;
    var validator;

    beforeEach(function(){
      form = $(template).appendTo(document.body);
      validator = new Validator(document.getElementById("form-required"));
    });
    afterEach(function(){
      //validator.destory();
      form && form.remove();
    });

    it('normal usage', function() {
      validator.on("fail", function(elem){
        var name = elem.getAttribute("name");
        if(name === "iptText" || name === "iptPwd" || name === "iptCheckbox"){
          expect(true).to.be(true);
        }else{
          expect(true).to.be(false);
        }
      });
      $("#form-required").submit();
      validator.off();

      $("#iptText").val("value");
      $("#form-required").submit();

    });
  });

});
