# 登录

----

<link rel="stylesheet" type="text/css" href="bootstrap.css" media="all" />


<form class="form-horizontal" id="form-login">
  <div class="control-group">
    <label class="control-label" for="inputEmail">Email</label>
    <div class="controls">
      <input type="text" name="username" id="inputEmail"
        placeholder="Email"
        autofocus
        validationIgnore
        required />
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
    <div class="controls">
      <label class="checkbox">
        <input type="checkbox"> Remember me
      </label>
      <button type="submit" class="btn">Sign in</button>
    </div>
  </div>
</form>


<script type="text/javascript">
seajs.use(['$', 'webforms2', 'validator'], function($, WebForms2, Validator){
    var loginForm = new Validator("#form-login", {
        trigger: "blur,keyup",
        rules: {
            "username": function(field){
                return this.RULE.email.test(field.value) ||
                    this.RULE.mobile.test(field.value);
            }
        },
        feedback: "bootstrap"
    });
});
</script>
