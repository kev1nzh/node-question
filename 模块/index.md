模块
====
<br/>

>问：如果 a.js require 了 b.js, 那么在 b 中定义全局变量 t = 111 能否在 a 中直接打印出来?
<br/>
答：可以拿到。每个js文件可以独立环境，是因为node在外面包了个自执行，全局变量稳稳地可以拿到。
```javasript
// b.js
(function (exports, require, module, __filename, __dirname) {
  t = 111;
})();

// a.js
(function (exports, require, module, __filename, __dirname) {
  // ...
  console.log(t); // 111
})();
```
