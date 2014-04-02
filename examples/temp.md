# 演示文档

---

<link rel="stylesheet" type="text/css" href="bootstrap.css" media="all" />

````html
<form class="form-horizontal" id="form-login">
  <div class="control-group">
    <label class="control-label" for="inputEmail">Email</label>
    <div class="controls">
      <input type="text" id="inputEmail" placeholder="Email" required />
      <span class="help-inline"><strong>*</strong> 必填，请输入您的邮箱账号。</span>
    </div>
  </div>
  <div class="control-group">
    <label class="control-label" for="inputPassword">Password</label>
    <div class="controls">
      <input type="password" id="inputPassword" placeholder="Password">
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

<form class="form-signin">
        <h2 class="form-signin-heading">Please sign in</h2>
        <input type="text" class="input-block-level" placeholder="Email address">
        <input type="password" class="input-block-level" placeholder="Password">
        <label class="checkbox">
          <input type="checkbox" value="remember-me"> Remember me
        </label>
        <button class="btn btn-large btn-primary" type="submit">Sign in</button>
      </form>

<form class="well form-inline" id="form-text-required">
  <label>Text:</label>
  <input type="text" placeholder="text" required error-message="Required text." />
  <p class="help-inline"><b>*</b>required.</p>
  <button type="submit" class="btn">Submit</button>
</form>

<form id="loginForm">
    <div>
    User Name: <input type="text" name="username"
        placeholder="可以是邮箱或手机号"
        autofocus
        feedback="请输入邮箱或手机号"
        required /> * 可以是邮箱或手机号。
    </div>
    <div>
    Password: <input type="password" name="pwd"
        placeholder="密码"
        feedback="请输入密码"
        required minlength="6" maxlength="30" /> *
    </div>

    <div>
        <button type="submit">提交</button>
    </div>
</form>
````

````javascript
seajs.use(['webforms', 'validator'], function(WebForms, validator){
    var form = document.getElementById("loginForm");
    var loginForm = new validator(form, {
        rules: {
            "username": function(value, elem, RULES){
                return RULES.email.test(value) || RULES.mobile.test(value);
            }
        },
        feedback: function(elem){
          alert(elem.getAttribute("feedback"));
        }
    });
});
````
