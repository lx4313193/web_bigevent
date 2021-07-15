$(function() {
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date){
        const dt = new Date(date);
        var y = padZero(dt.getFullYear());
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());

        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());

        return y + "-" + m + "-" + d + " " + hh + ":" + mm + ":" + ss;
    }

    //  定义时间补零的函数
    function padZero(n){
        return n > 9 ? n : "0" + n;
    }

    // 定义一个查询的参数对象，将来请求数据的时候
    // 需要将请求参数对象提交到服务器
    var q  = {
        pagenum : 1,   // 页码值，默认请求第一页的数据
        pagesize : 2,  // 每页显示几条数据，默认每页显示2条
        cate_id : "",  // 文章分类的id
        state : ""     // 文章发布的状态
    }

    initTable();
    initCate();

    // 获取文章列表数据的方法
    function initTable(){
        $.ajax({
            method : "GET",
            url : "/my/article/list",
            data : q,
            success : function(res){
                if(res.status !== 0){
                    return layer.msg("获取文章列表失败!");
                }
                console.log(res);
                // 使用模板引擎渲染页面的数据
                var htmlStr = template("tpl-table", res);
                $("tbody").html(htmlStr);
                console.log(htmlStr);
                // 调用分页的方法
                renderPage(res.total);
            }
        })
    }

    // 初始化文章分类的的方法
    function initCate(){
        $.ajax({
            method : "GET",
            url : "/my/article/cates",
            success : function(res){
                if(res.status !== 0){
                    return layer.msg("获取数据失败!");
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template("tpl-cate", res);
                // jQ 属性选择器
                $("[name=cate_id]").html(htmlStr);
                // 这是通知 layui 重新渲染表单区域的UI结构
                form.render();
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $("#form-search").on("submit", function(e){
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $("[name=cate_id]").val();
        var state = $("[name=state]").val();
        // 为查询参数对象 q 对应的属性赋值
        q.cate_id = cate_id;
        q.state = state;
        // 根据最新的筛选条件，重新渲染表格数据
        initTable();
    })

    // 定义渲染分页的方法
    function renderPage(total){
        // 调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem : "pageBox",     // 分页容器的Id
            count : total,        // 总数据条数  
            limit : q.pagesize,   // 每页显示几条数据  
            curr : q.pagenum,      // 设置默认被选中的分页
            layout : ["count", "limit", "prev", "page", "next", "skip"],
            limits : [2, 3, 5, 10],

            // jump - 切换分页的回调( 分页发生切换的时候，触发 jump 回调 )
            // 当分页被切换时触发，函数返回两个参数：obj（当前分页的所有选项值）、first（是否首次，一般用于初始加载的判断）
            // 触发 jump 回调的方式有两种
            // 1、点击页码( 切换条目 )的时候会触发 jump 回调
            // 2、只要调用了 laypage.render() 方法，就会触发 jump 回调
            jump : function(obj, first){
                // 可以通过 first 的值，来判断是通过哪种方式，触发 jump 回调
                // console.log(obj.curr)   // 得到当前页，以便向服务端请求对应页的数据
                // console.log(obj.limit)  // 得到每页显示的条数 
                
                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr;
                
                // 把最新的条目数，赋值到 q 这个查询对象的 pagesize 属性中
                q.pagesize = obj.limit;
                
                // 根据最新的 q 获取对应的数据列表，并渲染表格
                // 触发了 jump 的第二种方法，first 是 true
                if(!first){
                    initTable();
                }
            }
        })
    }

    // 通过代理的形式，为删除按钮绑定点击事件处理函数
    $("body").on("click", ".btn-delete", function(){
        layer.confirm("确认删除", { icon : 3, title : "提示"}, function(index){
            // 获取到删除按钮的个数
            var len = $(".btn-delete").length;
            
            // 获取文章的 id 
            var id = $(this).attr("data-id")
            $.ajax({
                method : "GET",
                url : "/my/article/deletecate/" + id,
                success : function(res){
                    if(res.status !== 0){
                        layer.msg("删除文章失败!");
                    }
                    layer.msg("删除文章成功!");
                    // 当数据删除完成后，需要判断当前这一页中，是否还有剩余的数据
                    // 如果没有剩余的数据了，则让页码值 -1 之后，再重新调用 initTable()方法
                    if(len === 1){
                        // 如果 len 的值等于1，则证明删除完毕，页面上就没有任何数据了
                        // 页码值最小必须是1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1;
                    }
                    initTable();
                }
            })
            layui.close(index);
        })
    })
})