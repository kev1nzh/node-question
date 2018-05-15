<<<<<<< HEAD
模块
=======
模块
>>>>>>> 295b952445e6a7d1b9b2d515c601a239963663a3
====

0、关于module.exports 和 exports的问题请点右边
[来自作者lellansin](https://cnodejs.org/topic/5734017ac3e4ef7657ab1215)

<br>
1、require后获取全局变量
>问：如果 a.js require 了 b.js, 那么在 b 中定义全局变量 t = 111 能否在 a 中直接打印出来?
<br>
    答：可以拿到。每个js文件可以独立环境，是因为node在外面包了个自执行，全局变量稳稳地可以拿到。
<br>
    
```javascript
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
<br>
2、两文件互相require
>问：a.js 和 b.js 两个文件互相 require 是否会死循环? 双方是否能导出变量? 如何从设计上避免这种问题?
<br>
        答：不会, 先执行的导出空对象, 通过导出工厂函数让对方从函数去拿比较好避免. 模块在导出的只是 var module = { exports: {} }; 中的 exports, 以从 a.js 启动为例, a.js 还没执行完 exports 就是 {} 在 b.js 的开头拿到的就是 {} 而已.

<br>
3、三者区别
>问：AMD, CMD, CommonJS 三者的区别
<br>
4、require的实现原理
>问：require如何实现？
<br>
