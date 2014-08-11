# 登录

----

<link rel="stylesheet" type="text/css" href="bootstrap.css" media="all" />


<form class="form-horizontal" id="form-login">
  <div class="control-group">
    <label class="control-label" for="inputEmail">Account ID</label>
    <div class="controls">
      <input type="text" name="username" id="inputEmail"
        placeholder="Email or Mobile Phone Number."
        autofocus
        required
        validationMessage="账号是一个合法的手机号或者电子邮箱地址。"
        />
      <span class="help-inline"><strong>*</strong> 必填，请输入您的账号。</span>
    </div>
  </div>
  <div class="control-group">
    <label class="control-label" for="inputPassword">Password</label>
    <div class="controls">
      <input type="password" name="password" id="inputPassword"
        placeholder="Password"
        required minlength="6" maxlength="20"
        validationMessage="密码由英文大、小写字母、数字、及特殊字符组成，长度为 6到 20位。"
        />
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

----

````js
seajs.use(['jquery', 'webforms', 'validator-feedback-bootstrap'],
  function($, WebForms, Feedback){

    var loginForm = new WebForms("#form-login", {
      rule: {
        "username": function(field){
          return this.RULE.email.test(field.value) ||
            this.RULE.mobile.test(field.value);
        }
      },
    });
    Feedback(loginForm);
});
````
