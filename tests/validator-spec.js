define(function(require) {

  var WebForms2 = require('webforms2');
  var $ = require('$');
  var expect = require('expect');

  function makeForm(html){
    var template_form_start = '<form id="form-required" style="display:none;">';
    var template_form_end = '</form>';
    return $(template_form_start + html + template_form_end).appendTo(document.body);
  }

  describe('validator', function() {

    function testRequiredInvalid(webforms2, data, done){
      webforms2.on("validate:invalid", function(field){
        expect(field.name).to.equal(data.name);
      }).on("validate:complete", function(certified){
        expect(certified).to.equal(false);
        webforms2.off();
        done();
      });
    }

    function testRequiredValid(webforms2, data, done){
      webforms2.on("validate:invalid", function(field){
        expect(true).to.equal(false);
      }).on("validate:valid", function(field){
        expect(field.name).to.equal(data.name);
      }).on("validate:complete", function(certified){
        expect(certified).to.equal(true);
        done();
      });
    }

    var testCases = [
      // non-required
      // --------------------------------------------------------------------
      [ 'input:valid',
        '<input name="non-required-0" />',
        testRequiredValid,
        'non-required-0'
      ],
      [ 'input[value=""]:valid',
        '<input name="non-required-1" value="" />',
        testRequiredValid,
        'non-required-1'
      ],
      [ 'input[value="abc"]:valid',
        '<input name="non-required-2" value="abc" />',
        testRequiredValid,
        'non-required-2'
      ],

      // required
      // --------------------------------------------------------------------
      [ 'input[required][value=""]:invalid',
        '<input name="unknow0" value="" required />',
        testRequiredInvalid,
        'unknow0'
      ],
      [ 'input[required][value=" "]:invalid',
        '<input name="unknow1" value=" " required />',
        testRequiredInvalid,
        'unknow1'
      ],
      [ 'input[required][value="abc"]:vald',
        '<input name="unknow2" value="abc" required />',
        testRequiredValid,
        'unknow2'
      ],

      [ 'input[type=text][required][value=""]:invalid',
        '<input type="text" name="text0" value="" required />',
        testRequiredInvalid,
        'text0'
      ],
      [ 'input[type=text][required][value=" "]:invalid',
        '<input type="text1" name="text1" value=" " required />',
        testRequiredInvalid,
        'text1'
      ],
      [ 'input[type=text][required][value="abc"]:vald',
        '<input type="text2" name="text2" value="abc" required />',
        testRequiredValid,
        'text2'
      ],

      [ 'input[type=password][required][value=""]:invalid',
        '<input type="password" name="password0" value="" required />',
        testRequiredInvalid,
        'password0'
      ],
      [ 'input[type=password][required][value=" "]:vald',
        '<input type="password" name="password1" value=" " required />',
        testRequiredValid,
        'password1'
      ],
      [ 'input[type=password][required][value="abc"]:vald',
        '<input type="password" name="password2" value="abc" required />',
        testRequiredValid,
        'password2'
      ],

      [ 'textarea[required][value=""]:invalid',
        '<textarea name="textarea0" required></textarea>',
        testRequiredInvalid,
        'textarea0'
      ],
      [ 'textarea[required][value=" "]:invalid',
        '<textarea name="textarea1" required> </textarea>',
        testRequiredInvalid,
        'textarea1'
      ],
      [ 'textarea[required][value="\\r \\n"]:invalid',
        '<textarea name="textarea2" required> \r\n \r \n </textarea>',
        testRequiredInvalid,
        'textarea2'
      ],
      [ 'textarea[required][value="abc"]:valid',
        '<textarea name="textarea3" required>abc</textarea>',
        testRequiredValid,
        'textarea3'
      ],

      [ 'input[type=radio][required]:invalid',
        '<input type="radio" name="radio-0" required />',
        testRequiredInvalid,
        'radio-0'
      ],
      [ 'input[type=radio][required][checked]:vald',
        '<input type="radio" name="radio-1" checked required />',
        testRequiredValid,
        'radio-1'
      ],
      [ 'input[type=radio][required][checked]*2:vald',
        '<input type="radio" name="radio-2" checked required />'+
        '<input type="radio" name="radio-2" />',
        testRequiredValid,
        'radio-2'
      ],
      [ 'input[type=radio][required][checked]*3:vald',
        '<input type="radio" name="radio-3" />'+
        '<input type="radio" name="radio-3" checked required />'+
        '<input type="radio" name="radio-3" />',
        testRequiredValid,
        'radio-3'
      ],

      [ 'input[type=checkbox][required]:invalid',
        '<input type="checkbox" name="checkbox-0" required />',
        testRequiredInvalid,
        'checkbox-0'
      ],
      [ 'input[type=checkbox][required][checked]:vald',
        '<input type="checkbox" name="checkbox-1" checked required />',
        testRequiredValid,
        'checkbox-1'
      ],
      [ 'input[type=checkbox][required][checked]*2:vald',
        '<input type="checkbox" name="checkbox-2" checked required />'+
        '<input type="checkbox" name="checkbox-2" />',
        testRequiredValid,
        'checkbox-2'
      ],
      [ 'input[type=checkbox][required][checked]*3:vald',
        '<input type="checkbox" name="checkbox-3" />'+
        '<input type="checkbox" name="checkbox-3" checked required />'+
        '<input type="checkbox" name="checkbox-3" />',
        testRequiredValid,
        'checkbox-3'
      ],

      [ 'input[type=submit][required]:valid',
        '<input type="submit" name="submit-0" required />',
        testRequiredValid,
        'submit-0'
      ],
      [ 'input[type=button][required]:valid',
        '<input type="button" name="button-0" required />',
        testRequiredValid,
        'button-0'
      ],
      [ 'input[type=reset][required]:valid',
        '<input type="reset" name="reset-0" required />',
        testRequiredValid,
        'reset-0'
      ],
      [ 'input[type=image][required]:valid',
        '<input type="image" name="image-0" required />',
        testRequiredValid,
        'image-0'
      ],

      [ 'button[required]:valid',
        '<button name="button-0" required></button>',
        testRequiredValid,
        'button-0'
      ],
      [ 'button[type=submit][required]:valid',
        '<button type="submit" name="button-submit-1" required></button>',
        testRequiredValid,
        'button-submit-1'
      ],
      [ 'button[type=button][required]:valid',
        '<button type="button" name="button-button-2" required></button>',
        testRequiredValid,
        'button-button-2'
      ],
      [ 'button[type=reset][required]:valid',
        '<button type="reset" name="button-reset-2" required></button>',
        testRequiredValid,
        'button-reset-2'
      ],

      [ 'select[required]:invalid',
        '<select name="select-0" required></select>',
        testRequiredInvalid,
        'select-0'
      ],
      [ 'select[required]>option:invalid',
        '<select name="select-1" required>'+
          '<option></option>'+
        '</select>',
        testRequiredInvalid,
        'select-1'
      ],
      [ 'select[required]>option[value=""][text=abc]:invalid',
        '<select name="select-2" required>'+
          '<option value="">abc</option>'+
        '</select>',
        testRequiredInvalid,
        'select-2'
      ],
      [ 'select[required]>option[value=123][text=]:valid',
        '<select name="select-3" required>'+
          '<option value="123"></option>'+
        '</select>',
        testRequiredValid,
        'select-3'
      ],
      [ 'select[required]>option[value=123][text=abc]:valid',
        '<select name="select-4" required>'+
          '<option value="123">abc</option>'+
        '</select>',
        testRequiredValid,
        'select-4'
      ],
      // select>option[selected]
      [ 'select[required]>option[selected]:invalid',
        '<select name="select-10" required>'+
          '<option value="123">abc</option>'+
          '<option selected></option>'+
        '</select>',
        testRequiredInvalid,
        'select-10'
      ],
      [ 'select[required]>option[selected]text=abc]:valid',
        '<select name="select-11" required>'+
          '<option value="123">abc</option>'+
          '<option selected>abc</option>'+
        '</select>',
        testRequiredValid,
        'select-11'
      ],
      [ 'select[required]>option[selected][value=""][text=abc]:invalid',
        '<select name="select-12" required>'+
          '<option value="123">abc</option>'+
          '<option value="" selected>abc</option>'+
        '</select>',
        testRequiredInvalid,
        'select-12'
      ],
      [ 'select[required]>option[selected][value=""][text=abc]:invalid',
        '<select name="select-13" required>'+
          '<option value="123">abc</option>'+
          '<option value="" selected>abc</option>'+
        '</select>',
        testRequiredInvalid,
        'select-13'
      ],

      // minlength
      [ 'input[type=text][minlength=3]:invalid',
        '<input type="text" name="text-minlength-0" minlength="3" />',
        testRequiredInvalid,
        'text-minlength-0'
      ],
      [ 'input[type=text][minlength=3][value="12"]:invalid',
        '<input type="text" name="text-minlength-1" minlength="3" value="12" />',
        testRequiredInvalid,
        'text-minlength-1'
      ],
      [ 'input[type=text][minlength=3][value="123"]:valid',
        '<input type="text" name="text-minlength-2" minlength="3" value="123" />',
        testRequiredValid,
        'text-minlength-2'
      ],

      [ 'input[type=checkbox][minlength=3]:valid',
        '<input type="checkbox" name="checkbox-minlength-0" minlength="3" />',
        testRequiredValid,
        'checkbox-minlength-0'
      ],
      [ 'input[type=checkbox][minlength=3][value="12"]:valid',
        '<input type="checkbox" name="checkbox-minlength-1" minlength="3" value="12" />',
        testRequiredValid,
        'checkbox-minlength-1'
      ],
      [ 'input[type=checkbox][minlength=3][value="123"]:valid',
        '<input type="text" name="text-minlength-2" minlength="3" value="123" />',
        testRequiredValid,
        'text-minlength-2'
      ],
    ];

    for(var i=0,l=testCases.length; i<l; i++){

      var desc = testCases[i][0];
      var elements = testCases[i][1];
      var handler = testCases[i][2];
      var name = testCases[i][3];

      (function(desc, elements, handler, name){

        it(desc, function(done) {

          var form = makeForm(elements);
          var webforms2 = new WebForms2(form);

          handler(webforms2, {name: name}, done);

          webforms2.validate();

          webforms2.off();
          form.remove();

        });

      })(desc, elements, handler, name);
    }

  });

});
