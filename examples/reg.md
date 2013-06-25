# 注册

----

<link rel="stylesheet" type="text/css" href="bootstrap.css" media="all" />


<form class="form-horizontal" id="form-login">
  <div class="control-group">
    <label class="control-label" for="inputEmail">Email</label>
    <div class="controls">
      <input type="email" name="username" id="inputEmail"
        placeholder="Email"
        autofocus
        required verified="" />
      <span id="account-verify-state"></span>
      <span class="help-inline"><strong>*</strong> 必填，请输入您的邮箱账号。</span>
    </div>
  </div>
  <div class="control-group">
    <label class="control-label" for="inputPassword">Password</label>
    <div class="controls">
      <input type="password" name="password" id="inputPassword"
        placeholder="Password"
        required minlength="6" maxlength="20" />
      <span class="help-inline"><strong>*</strong> 必填，请输入您的密码。</span>
    </div>
  </div>
  <div class="control-group">
    <label class="control-label" for="inputPassword2">Repeat Password</label>
    <div class="controls">
      <input type="password" name="password2" id="inputPassword2"
        placeholder="Repeat Password"
        required minlength="6" maxlength="20" />
      <span class="help-inline"><strong>*</strong> 必填，请输入确认密码。</span>
    </div>
  </div>
  <div class="control-group">
    <div class="controls">
      <label class="checkbox" for="copyright">
        <input type="checkbox" name="copyright" id="copyright" required />
      我同意 XX 协议 <span id="copyright-msg" class="help-inline"></span></label>
    </div>
  </div>
  <div class="control-group">
    <div class="controls">
      <button type="submit" class="btn">Sign up</button>
    </div>
  </div>
</form>


````js
seajs.use(['$', 'webforms2', 'validator'], function($, WebForms2, Validator){
    // 表单提示消息区。
    function messager(elem){
        return $(elem).parent().children(".help-inline");
    }
    var form = document.getElementById("form-login");
    var regForm = new Validator(form, {
        rules: {
            "username": function(field, callback){
                var msg = messager(field.element);
                msg.html("正在校验...");
                $.getJSON('./reg-state.json?email='+encodeURIComponent(field.value), function(data) {
                    msg.html(data.available ? "可以注册": "已被注册");
                    callback(data.available);
                });
            },
            "password2": function(field){
                return field.value === $("#inputPassword").val();
            }
        },
        onfail: {
            "copyright": function(){
                $("#copyright-msg").html("(必选)");
            }
        },
        onpass: {
            "copyright": function(){
                $("#copyright-msg").html("");
            }
        },
        "feedback": "bootstrap"
    });
});
````
