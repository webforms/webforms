
# WebForms2

---

[![Build Status](https://travis-ci.org/hotoo/webforms2.png)](https://travis-ci.org/hotoo/webforms2)
[![Coverage Status](https://coveralls.io/repos/hotoo/webforms2/badge.png?branch=master)](https://coveralls.io/r/hotoo/webforms2)


语义化 Web 表单，提供体系完整、灵活高效、高度一致的 Web 表单方案。

## 设计思想

* 通过简单、语义化语法来定义表单，简化 Web 表单。
* 体系化、完整、一致的表单定义。
  * 校验、富 UI 控件等只是表单的一部分。
  * 用户需要的是一个完整的表单，不会有只需要校验或其他某一小部分的场景。
  * 开发、设计、定义的一致性。
  * 用户使用的交互、反馈一致性。
* 灵活、完整定义表单交互反馈的控制权。

---

## 使用说明

```html
<form id="loginForm">
  UserName: <input type="text" name="username" required /> * 可以是邮箱或手机号。
  PassWord: <input type="password" name="pwd" required minlength="6" maxlength="30" /> *
</form>
```

```javascript
var loginForm = new WebForms2(form, {
  rules: {
    "username": function(field){
      return this.RULES.email.test(field.value) ||
             this.RULES.mobile.test(field.value);
    }
  }
})
```
WebForms2 的构造函数中，参数列表如下：

1. 第一个参数是用于指定表单。
    * 可以是表单的 ID。（可选添加 `#` 前缀）

        ```js
        new WebForms2("formId");
        new WebForms2("#formId");
        ```
    * 或者是 HTMLFormElement 元素。

        ```js
        new WebForms2(document.getElementById("formId"));
        ```
2. 第二个参数用于指定表单的各个可选选项，该参数本身可选。
    * rules: Object, 自定义的表单项校验函数。
        * 前缀为 `#` 的 key 表示是针对特定 id 的表单项的定义。
        * 其他的 key 表示是针对特定 name 的表单项的定义。

## HTML API

参考 HTML5 的表单定义，并做了少许补充。

### form[novalidate]

指定当前表单不进行输入合法性校验。

### field[required]

声明表单项为必填项。

注：`field` 为表单项统称，包括 `input`, `select`, `textarea`, `button` 等。下同。

### field[maxlength=number]

声明表单项的可填写最大长度为 `number`。

### field[minlength=number]

声明表单项的填写最小长度为 `number`。

### field[max]

指定表单项的最大值。用户可以输入小于或等于这个值的内容。

使用的 `field` 包括数值和日期型表单项，如：`input[type=number]`, `input[type=date]`, ...

### field[min]

指定表单项的最小值。用户可以输入大于或等于这个值的内容。

使用的 `field` 包括数值和日期型表单项。

### field[pattern]

指定表单项的校验规则表达式。

pattern 的值是正则表达式，用户输入的内容必须匹配这个表达式。

### field[validated]

异步校验的表单项需要设置这个属性，默认值留空即可。

### field[formnovalidate]

指定忽略校验的表单项。

### input[type]

指定表单项的类型，支持的类型包括：

* `text`: 文本输入框。
* `radio`: 单选框。
* `checkbox`: 复选框。
* `password`: 密码框。
* `hidden`: 隐藏表单项。
* `search`: 搜索框。
* `file`: 文件选择输入框。
* `number`: 数值输入框。
* `range`: 范围选择、输入框。
* `date`: 日期输入框。
* `time`: 时间输入框。
* `datetime`: 日期时间输入框。
* `month`: 月份输入框。
* `week`: 星期（周）输入框。
* `datetime-local`: 本地日期时间输入框。
* `url`: 网址输入框。
* `email`: 邮箱地址输入框。
* `tel`: 联系电话输入框。
* `color`: 色彩输入框。

### input[type=file][accept]

指定文件输入框限制的文件类型。

如：

```html
<input type="file" accept="image/jpg,.png,video/*" />
```

accept 属性支持 MIME-TYPE 和后缀设定。更多参考：

* [规范文档](http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#attr-input-accept)
* [RFC1867](http://tools.ietf.org/html/rfc1867)

### form[validationRealtime]

定义整个表单是否使用实时校验。

默认不添加 `validationRealtime` 属性时，整个表单默认不进行实时校验。

### field[validationRealtime]

定义单个表单项是否使用实时校验。添加 `validationRealtime` 属性默认为使用实时校验，
除非 `field[validationRealtime=nonrealtime]`。



## JavaScript API

### on(String event, Function handler)

绑定事件，在对应事件触发时，执行 handler 函数。

支持的事件请参考 Events 部分。

### each(Function handler)

遍历整个表单的所有表单项。

```js
new WebForms2("#formId").each(function(field){
  switch(field.name){
  case "username":
    this.RULE.email.test(field.value);
    break;
  }
  // ...
});
```

### String queryString()

根据用户在表单中的输入值，返回整个表单的查询字符串。

## Events

WebForms2 提供了完整的事件模型，通过监听各种事件就可以几乎所有的表单交互动作。

* 通过 WebForms2 的实例的 on 方法即可绑定事件监听。
* on 方法的处理函数 handler 中，提供了对应表单项的常用信息，包括：
  * `field.name`: 表单项名称，即对应的 name 属性，如果没有 name 属性则为 `null`。
  * `field.id`: 表单项 ID，即对应的 ID 属性，如果没有 ID 则为 `null`。
  * `field.type`: 表单项的类型，即 input 的 type 属性、`textarea`、`select-one` 或
    `select-multiple`。
  * `field.value`: 表单项当前的值。
  * `field.element`: 表单项本身的 HTMLElement。

### valid

单个表单项通过校验时触发 `valid` 事件。

```js
var WebForms2 = require("WebForms2");

var webforms2 = new WebForms2("#formId");
webforms2.on("valid", function(field){
  switch(field.name){
  case "username":
    //...
    break;
  }
});
```

### invalid

单个表达项未通过校验时触发 `invalid` 事件。

### change

单个表单项发生变更时触发 `change` 事件。

### focus

单个表单项获得焦点时触发 `focus` 事件。

### blur

单个表单项失去焦点时触发 `blur` 事件。

### mouseover

鼠标进入单个表单项时触发 `mouseover` 事件。

### mouseout

鼠标离开单个表单项时触发 `mouseout` 事件。

### error

WebForms2 出现异常时触发 `error` 事件。

常见异常包括：

* 尝试 `focus` 到第一个未通过校验的表单项失败（由于其处于隐藏状态）

----

### validated

整个表单校验完成后触发 validated 事件。

注：针对整个表单的事件，参数上下文与单个表单项不同，如下：

* `form.element`: HTMLFormElement, 整个表单本身。
* `form.action`: 表单的 action 属性。
* `form.method`: 表单的 method 属性。
* `form.passedFields`: Array<Field>, 所有通过校验的表单项列表。
* `form.failedFields`: Array<Field>, 所有未通过校验的表单项列表。
* `form.passed`: Boolean, 标识整个表单是否通过校验。

### submit

表单校验通过，可以提交表单时触发 submit 事件。

绑定 submit 事件的处理函数中，返回 false 可以取消表单提交。
希望使用异步方式提交表单时可以使用这种方式。

```js
webforms2.on("submit", function(form){
  jQuery.ajax({
    url: form.action,
    data: form.queryString(),
    success: function(){}
  });
  return false;
});
```

## TODO

* 默认的几种验证反馈
* 日期相关整理，或切换到 moment.js
* placeholder
* autofocus
* replicable
* calendar
* range
