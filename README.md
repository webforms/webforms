
# WebForms2

---


语义化 Web 表单，提供灵活高效的表单验证方案。

后续考虑提供自动化富媒体表单控件自动初始化。

## 设计思想

* 表单语义化。
* 关注逻辑。
* 交出表单交互反馈控制权。

## TODO

* 默认的几种验证反馈
* 日期相关整理，或切换到 moment.js
* placeholder
* autofocus
* replicable
* calendar
* range


---

## 使用说明

```html
<form id="loginForm">
    User Name: <input type="text" name="username"
        required /> * 可以是邮箱或手机号。
    Password: <input type="password" name="pwd"
        required minlength="6" maxlength="30" /> *
</form>
```

```javascript
var loginForm = new WebForms2(form, {
    rule: {
        "username": function(value, elem, RULES){
            return RULES.email.test(value) || RULES.mobile.test(value);
        }
    }
})
```


## API
