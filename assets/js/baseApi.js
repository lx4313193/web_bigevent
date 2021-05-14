// 注意: 每次调用 $.get() 或 $.post 或 $.ajax() 的时候
// 会先调用 ajaxPrefilter 这个函数，在这个函数中，可以拿到我们给ajax提供的对象
$.ajaxPrefilter(function(options){
    // 发起真正的 Ajax 请求之前，统一并请求的根路径
    options.url = "http://api-breakingnews-web.itheima.net" + options.url;
    console.log(options.url);
});