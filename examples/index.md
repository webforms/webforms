# 演示文档

---

````html
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
seajs.use(['webforms2', 'validator'], function(WebForms2, validator){
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
