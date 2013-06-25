
# 支付宝个人账户注册

----

<link charset="utf-8" rel="stylesheet" href="https://a.alipayobjects.com/memberprod/memberprod.authreg-1.1.css" media="all" />
<link media="all" rel="stylesheet" href='https://a.alipayobjects.com/al/alice.common.v1-1.4.css' type="text/css" />
<style>
@font-face {
    font-family: "rei";
    src: url("https://i.alipayobjects.com/common/fonts/rei.eot?20130502"); /* IE9 */
    src: url("https://i.alipayobjects.com/common/fonts/rei.eot?20130502#iefix") format("embedded-opentype"), /* IE6-IE8 */
    url("https://i.alipayobjects.com/common/fonts/rei.woff?20130502") format("woff"), /* chrome 6+、firefox 3.6+、Safari5.1+、Opera 11+ */
    url("https://i.alipayobjects.com/common/fonts/rei.ttf?20130502")  format("truetype"), /* chrome、firefox、opera、Safari, Android, iOS 4.2+ */
    url("https://i.alipayobjects.com/common/fonts/rei.svg?20130502#rei") format("svg"); /* iOS 4.1- */
}
.iconfont {
    font-family:"rei";
    font-style: normal;
    font-weight: normal;
    cursor: default;
    -webkit-font-smoothing: antialiased;
}
</style>
<style type="text/css">
/* 两个选框 */
.tab-choose{
    width:778px;
    height:67px;
    box-shadow: 0 0 3px #C7C5C5;
}
.tab-choose-item{
    float:left;
}
.btn-personal,.tab-choose-item a,.tab-choose-item-personal .arrow,.ui-dropdown-trigger{
    background-image:url("https://i.alipayobjects.com/e/201209/1DY4fMlnIi.png");
    background-repeat:no-repeat;
}
.tab-choose-item a{
    display:block;
    height:68px;
    text-indent:-9999em;
}
.tab-choose-item-personal{
    position:relative;
}
.tab-choose-item-personal a{
    background-position:0 0;
    width:388px;
}
.tab-choose-item-personal .arrow{
    display:block;
    width:25px;
    height:11px;
    background-position: 0 -71px;
    position:absolute;
    top:67px;
    left:47%;
}
.tab-choose-item-business a{
    background-position:-386px 0;
    width: 390px;
}
.box-shadow{
    box-shadow: 0 0 5px #c7c5c5;
    background:#fff;
    border:1px solid #e7e7e7;
    border-top: none;
    width: 776px;
}
/* 表单重设 */
.login-form-cnt{
    width:418px;
    background:#fff;
    padding: 15px 200px 0 160px;
}
.license{
    margin-left:60px;
    float: left;
    vertical-align: middle;
}
.ime-disabled{
    ime-mode: disabled;
}
.checkcode-img{
    border: 1px solid #C1C1C1;
    vertical-align: middle;
    padding: 5px;
}
.ui-form-item {
	position: relative;
	zoom:1;
}
.ui-form-item .ui-input{
    margin-right: 6px;
}
.ui-form-item-checkcode-error .ui-form-explain{
    background-color:#fff;
    border: none;
    background-position: -59px -66px;
    padding: 10px 8px 9px 25px;
    position: absolute;
    top:0;
}
.ui-form-item-checkcode-error .ui-form-explain .ui-form-arrow{
    display: none;
}
.ui-form-item-checkcode-error .ui-input{
      border: 1px solid #FF0000;
}
.reg-area{
    text-align: right;
}
.ui-form-l .ui-form-item-area {
	padding-bottom:5px;
    width:342px;
}
.ui-form input::-webkit-input-placeholder { color:#999; }
.ui-form input:-moz-placeholder { color:#999; }

/* 阿里账户 */
.aliusers-list li{
    float: left;
    margin: 10px 8px 0 auto;
    white-space: nowrap;
}
.ui-ali-icons{
    background-image: url("https://i.alipayobjects.com/e/201208/3ocQFumQPT.png");
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-right: 5px;
    vertical-align: text-top;
    overflow:hidden;
}
.ui-ali-icons-1{
    background-position: 0 -99px;
}
.ui-ali-icons-3, .ui-ali-icons-4{
    background-position: 0 -40px;
}
.ui-ali-icons-15{
    background-position: 0 -40px;
}
.ui-ali-icons-5{
    background-position: 0 -80px;
}
.ui-ali-icons-0{
    background-position: 0 0;
}
.ui-ali-icons-2{
    background-position: 0 -60px;
}
</style>

<form id="J-index-form" method="post" class="ui-form ui-form-l" action="https://memberprod.alipay.com/account/reg/index.htm">
        <input type="hidden" name="_form_token" value="LKgfgva3ABH4CQyTReqj5xixONZ9VMXJ"/>

    <fieldset>
        <legend>注册</legend>
        <div class="ui-form-item ui-form-item-first ui-form-item-area">
            <div class="reg-area">
            <input type="hidden" id="country" name="country" value="CN" />
            <input type="hidden" id="acc-type" name="accType" value="2" />
            <select class="fn-hide" id="country-1" name="country-1">
                <option value="CN" selected="true">中国大陆</option>
                <option value="HK" >香港</option>
                <option value="MO">澳门</option>
                <option value="TW">台湾</option>
                <option value="">海外</option>
            </select>
            <select class="fn-hide" name="country-2" id="country-2">
                <option value="KR" selected="selected">韩国</option>
                <option value="JP">日本</option>
                <option value="SG">新加坡</option>
                <option value="MY">马来西亚</option>
            </select>
        </div>
        </div>
        <div class="ui-form-item">
            <label for="J-accName" class="ui-label">账户名</label>
            <input id="J-accName" name="accName" class="ui-input" type="text"
                placeholder="输入手机号码或电子邮箱"
                validationMessage="输入的手机号码或电子邮箱将作为账户名。"
                required maxlength="100" value="">
            <div class="ui-form-explain fn-hide" style="width: 168px; top: 5px; left: 482px; zoom: 1;"></div>
        </div>
                            <div class="ui-form-item">
            <label for="J-checkcode" class="ui-label">验证码</label>
            <input id="J-checkcode"  name="checkCode" class="ui-input ui-input-100 ime-disabled"
                type="text" autocomplete="off" data-explain="输入左图中的字符，不区分大小写。"
                data-error="    " placeholder="输入验证码"
                validationMessage="输入左图中的字符，不区分大小写。"
                required minlength="4" maxlength="4" />
            <span class="sl-checkcodeIcon"><span class="checkcodeIcon" id="checkcodeIcon"></span></span>
            <img id="J-checkcode-img" title="点击图片刷新验证码" class="checkcode-img" complete="complete"
                src="https://omeo.alipay.com/service/checkcode?sessionID=f0c99b2906d1c411bedd26f6f247dff8&r=0.8064067161237801" alt="输入验证码" style="cursor:pointer;" />
            <div class="ui-form-explain fn-hide" style="z-index: 98; width: 255px; top: 5px; left: 395px; zoom: 1; position: absolute;"></div>

       </div>

        <div class="ui-form-item ui-form-item-checkbox">
            <input id="J-agree" name="agree" checked="checked" class="ui-checkbox" type="checkbox"
                required />
            <label for="J-agree" class="ui-checkbox-label">我同意<a id="J-alipay-treaty" href="#" class="ft-grey" target="_blank">支付宝服务协议</a></label>
        </div>
        <div class="ui-form-item">
            <div id="submitBtn" class="ui-button ui-button-lorange">
                <input id="J-submit" type="submit" class="ui-button-text" value="下一步" />
            </div>
            <span class="ui-form-confirm"><span class="loading-text fn-hide">正在提交信息</span></span>
        </div>

    </fieldset>
</form>

````js
seajs.use(['$', 'webforms2', 'validator'], function($, WebForms2, Validator){
    var form = document.getElementById("J-index-form");
    var regForm = new Validator(form, {
        autoFocus: false,
        rules: {
            "accName": function(field){
                return this.RULE.email.test(field.value) ||
                    this.RULE.mobile.test(field.value);
            }
        },
        onfail: {
            "*": function(){
                $("#J-submit").attr("disabled", "disabled");
                $("#submitBtn").removeClass("ui-button-lorange").addClass("ui-button-ldisable");
            }
        },
        onpass: {
            "*": function(){
                $("#submitBtn").addClass("ui-button-lorange").removeClass("ui-button-ldisable");
                $("#J-submit").removeAttr("disabled");
            }
        },
        "feedback": "alipay"
    });
});
````
