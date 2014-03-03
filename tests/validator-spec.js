define(function(require) {

  var WebForms2 = require('webforms2');
  var $ = require('$');
  var expect = require('expect');

  function makeForm(html){
    var template_form_start = '<form id="form-required" style="display:none;">';
    var template_form_end = '</form>';
    return $(template_form_start + html + template_form_end).appendTo(document.body);
  }

  describe('form:validator', function() {

    function testRequiredInvalid(webforms2, data, done){
      webforms2.on("validate:invalid", function(field){
        var name = field.name;
        expect(field.name).to.equal(data.name);
        done();
      });
      webforms2.on("validate:valid", function(field){
        expect(true).to.equal(false);
        done();
      });
    }

    function testRequiredValid(webforms2, data, done){
      webforms2.on("validate:invald", function(field){
        expect(true).to.equal(false);
        done();
      });
      webforms2.on("validate:valid", function(field){
        console.log(1, field)
        var name = field.name;
        expect(field.name).to.equal(data.name);
        done();
      });
    }

    var testCases = [
      [ 'input[required][value=""]:invald',
        '<input name="unknow0" value="" required />',
        testRequiredInvalid,
        'unknow0'
      ],
      [ 'input[required][value=" "]:invald',
        '<input name="unknow1" value=" " required />',
        testRequiredInvalid,
        'unknow1'
      ],
      [ 'input[required][value="abc"]:vald',
        '<input name="unknow2" value="abc" required />',
        testRequiredValid,
        'unknow2'
      ],

      [ 'input[type=text][required][value=""]:invald',
        '<input type="text" name="text0" value="" required />',
        testRequiredInvalid,
        'text0'
      ],
      [ 'input[type=text][required][value=" "]:invald',
        '<input type="text1" name="text1" value=" " required />',
        testRequiredInvalid,
        'text1'
      ],
      [ 'input[type=text][required][value="abc"]:vald',
        '<input type="text2" name="text2" value="abc" required />',
        testRequiredValid,
        'text2'
      ],

      [ 'input[type=password][required][value=""]:invald',
        '<input type="password" name="password0" value="" required />',
        testRequiredInvalid,
        'password0'
      ],
      [ 'input[type=password][required][value=" "]:invald',
        '<input type="password" name="password1" value=" " required />',
        testRequiredInvalid,
        'password1'
      ],
      [ 'input[type=password][required][value="abc"]:vald',
        '<input type="password" name="password2" value="abc" required />',
        testRequiredValid,
        'password2'
      ]
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
