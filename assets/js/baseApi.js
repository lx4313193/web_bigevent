// 注意: 每次调用 $.get() 或 $.post 或 $.ajax() 的时候
// 会先调用 ajaxPrefilter 这个函数，在这个函数中，可以拿到我们给ajax提供的对象
$.ajaxPrefilter(function(options){
    // 发起真正的 Ajax 请求之前，统一并请求的根路径
    options.url = "http://api-breakingnews-web.itheima.net" + options.url;
    // console.log(options.url);

    // 统一为有权限的接口，设置 header 请求头
    if(options.url.indexOf("/my/") !== -1){
        options.headers = {
            Authorization : localStorage.getItem("token") || " ",
        }
    }

    // 全局统一挂载 complete 回调函数
    options.complete = function(res){
        // 在 conplete 回调函数中，可以使用 res.responseJOIN 拿到服务器返回来的数据
        if(res.responseJSON.status === 1 && res.responseJSON.message === "身份认证失败！"){
            // 1. 强制清空 token
            localStorage.removeItem("token");
            // 2. 强制跳转到登录页面 
            location.href = "/login.html";
        }
    }
});