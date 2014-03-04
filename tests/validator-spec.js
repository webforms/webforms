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
      });
      webforms2.on("validate:complete", function(certified){
        expect(certified).to.equal(false);
        webforms2.off();
        done();
      });
    }

    function testRequiredValid(webforms2, data, done){
      webforms2.on("validate:invalid", function(field){
        expect(true).to.equal(false);
      });
      webforms2.on("validate:complete", function(certified){
        expect(certified).to.equal(true);
        done();
      });
    }

    var testCases = [
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
      [ 'input[type=password][required][value="abc"]:vald',
        '<input type="password" name="password2" value="abc" required />',
        testRequiredValid,
        'password2'
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
