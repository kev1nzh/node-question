var Promise = require('appoint')
var promise = new Promise((resolve) => {
  setTimeout(() => {
    resolve('haha')
  }, 1000)
})
var a = promise.then(function onSuccess() {})
var b = promise.catch(function onError() {})
console.dir(promise, { depth: 10 })
console.log(promise.queue[0].promise === a)
console.log(promise.queue[1].promise === b)

// ------console.lo-------
/* 
Promise {
    state: 0,
    value: undefined,
    queue:
     [ QueueItem {
         promise: Promise { state: 0, value: undefined, queue: [] },
         callFulfilled: [Function],
         callRejected: [Function] },
       QueueItem {
         promise: Promise { state: 0, value: undefined, queue: [] },
         callFulfilled: [Function],
         callRejected: [Function] } ] }
  true
  true
 */
/* 
可以看出，queue 数组中有两个对象。
因为规范中规定：then 方法可以被同一个 promise 调用多次。
上例中在调用 .then 和 .catch 时 promise 并没有被 resolve，
所以将 .then 和 .catch 生成的新 promise（a 和 b） 和
正确时的回调（onSuccess 包装成 callFulfilled）和
错误时的回调（onError 包装成 callRejected）生成一个 QueueItem 实例
并 push 到 queue 数组里，所以上面两个 console.log 打印 true。
当 promise 状态改变时遍历内部 queue 数组，统一执行成功（FULFILLED -> callFulfilled）
或失败（REJECTED -> callRejected）的回调（传入 promise 的 value 值），
生成的结果分别设置 a 和 b 的 state 和 value，这就是 Promise 实现的基本原理。

*/