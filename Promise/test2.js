//其次的问题是, 如下代码, setTimeout 到 10s 之后
//再 .then 调用, 那么 hello 是会在 10s 之后在打印吗, 还是一开始就打印?

// let doSth = new Promise((resolve, reject) => {
//     console.log('hello');
//     resolve();
// });

// setTimeout(() => {
//     doSth.then(() => {
//         console.log('over');
//     })
// }, 2000);



setTimeout(function() {
    console.log(1)
}, 0);
new Promise(function executor(resolve) {
    console.log(2);
    for( var i=0 ; i<10000 ; i++ ) {
      i == 9999 && resolve();
    }
    console.log(3);
}).then(function() {
    console.log(4);
});
console.log(5);
/* 
setTimeout会放到任务队列中，代码继续往下走。 
所以先输出2 3。 
promise中的then操作是放在执行栈，也就是主线程的最后。 
那么主线程会继续往下走咯。 
所以输出 5 4 
最后主线程的任务搞完了，才会去执行task queue中的任务。 
所以最后执行1

// 2， 3， 5， 4， 1
*/