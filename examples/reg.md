# 注册

----

<link rel="stylesheet" type="text/css" href="bootstrap.css" media="all" />


<form class="form-horizontal" id="form-login">
  <div class="control-group">
    <label class="control-label" for="inputEmail">Email</label>
    <div class="controls">
      <input type="email" name="username" id="inputEmail"
        placeholder="Email"
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
      <button type="submit" class="btn">Sign up</button>
    </div>
  </div>
</form>


<script type="text/javascript">
seajs.use(['$', 'webforms2', 'validator'], function($, WebForms2, Validator){
    var form = document.getElementById("form-login");
    var loginForm = new Validator(form, {
        rules: {
            "username": function(value, elem, RULES, callback){
                $("#account-verify-state").html("正在校验...");
                $.getJSON('./reg-state.json', function(data) {
                    $("#account-verify-state").html(data.registered ? "已被注册": "可以注册");
                    callback(!data.registered);
                });
            },
            "password2": function(){
                console.log(this.value, $("#inputPassword").val());
                return this.value === $("#inputPassword").val();
            }
        },
        onerror: {
            "*": function(elem){
                $(elem).parent().parent().addClass("error");
            }
        },
        onpass: {
            "*": function(elem){
                $(elem).parent().parent().removeClass("error");
            }
        }
    });
});
</script>
