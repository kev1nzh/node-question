const immediate = require('immediate')

//https://zhuanlan.zhihu.com/p/25178630
/**
 * then方法中生成了一个新的promise，如果promise的状态改变，就调用unwrap
 * 否则就把新生成的promise加入当前的promise的回调队列queue里
 * 
 * @param {any} onFulfilled 
 * @param {any} onRejected 
 * @returns  {Function} 新生成的promise
 */
Promise.prototype.then = (onFulfilled, onRejected) => {
    if(!isFunction(onFulfilled) && this.state === FULFILLED ||
        !isFunction(onRejected) && this.state === REJECTED){
        return this
    }
    /* 
        promise构造函数传入了个空函数(INTERNAL)，因为这个promise算是内部的promise，
        需要根据外部的promise的状态和值产生自身的状态和值，不需要传入回调函数，
        而外部的Promise需要传入回调函数决定它的状态和值。
        因为上述，所以Promise的构造函数做了判断，区分外部调用还是内部调用：

        if(resolve !== INTERNAL) safeResolveThen(this, resolve)
    */
    const promise = new this.constructor(INTERNAL)
    if(this.state !== PENDING) {
        const resolve = this.state === FULFILLED ? onFulfilled : onRejected
        unwrap(promise, resolve, this.value)
    }
    else{
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected))
    }
    return promise
}
Promise.prototype.catch = (onRejected) => {
    return this.then(null, onRejected)
}

Promise.resolve = value => {
    if(value instanceof this) {
        return value 
    }
    return doResolve(new this(INTERNAL), value)
}
Promise.reject = reason => {
    const promise = new this(INTERNAL)
    return doReject(promise, reason)
}
Promise.all = iterable => {
    let self = this 
    if(!isArray(iterable)) {
        return this.reject(new TypeError('must be an array'))
    }
    const len = iterable.length 
    const called = false 
    if(!len) {
        return this.resolve([])
    }
    const values = new Array(len)
    const resolved = 0
    const i = -1 
    const promise = new this(INTERNAL)

    while( ++i < len) {
        allResolver(iterable[i], i)
    }
    return promise 
    function allResolver(value, i) {
        self.resolve(value).then(resolveFromAll, error => {
            if(!called) {
                called = true 
                doReject(promise, error)
            }
        })
        function resolveFromAll(outValue){
            values[i] = outValue
            if(++resolved === len && !called) {
                called = true 
                doResolve(promise, values)
            }
        }
    }
}
Promise.race = () => {}

/**
 * 
 * 
 * @param {any} promise 子promise
 * @param {any} func    爸爸promise的then回调(onfulfilled/onRejected)
 * @param {any} value   爸爸promise的值(正常值/错误)
 */
function unwrap(promise, func, value) {
    immediate(() => {
        let returnValue
        try {
            returnValue = func(value)
        } 
        catch(error) {
            return doReject(promise, error)
        }
        if(returnValue === promise) {
            doReject(promise, new TypeError('Cannot resolve promise with itself'))
        }
        else{
            doResolve(promise, returnValue)
        }
    })
}
function safelyResolveThen(self, then) {
    const called = false 
    try {
        then( value => {
            if(called) {
                return 
            }
            called = true 
            doResolve(self, value)
        }, error => {
            if(called) {
                return 
            }
            called = true 
            doReject(self, error)
        })
    }
    catch(error) {
        if(called) {
            return 
        }
        called = true 
        doReject(self, error)
    }
}
/* 
    doReject 就是设置 promise 的 state 为 REJECTED，value 为 error，callRejected 
    如前面提到的通知子 promise：『我这里出了点问题呀』然后子 promise 根据传入的错误设置自己的状态和值。
    doResolve 结合 safelyResolveThen 使用不断地解包 promise，直至返回值是非 promise 对象后，
    设置 promise 的状态和值，然后通知子 promise：『我这里有值了哟』然后子 promise 根据传入的值设置自己的状态和值。
*/
function doResolve(self, value) {
    try {
        const then = getThen(value)
        if(then) {
            safelyResolveThen(self, then)
        }
        else{
            self.state = FULFILLED
            self.value = value 
            self.queue.forEach(QueueItem => {
                queueItem.callFulfilled(value)
            })
        }
        return self 
    }
    catch(error) {
        return doReject(self, error)
    }
}
/**
 * promise 为 then 生成的新 promise（以下称为『子promise』），
 * onFulfilled 和 onRejected 即是 then 参数中的 onFulfilled 和 onRejected。
 * 从上面代码可以看出：比如当 promise 状态变为 FULFILLED 时，之前注册的 then 函数，
 * 用 callFulfilled 调用 unwrap 进行解包最终得出子 promise 的状态和值，
 * 之前注册的 catch 函数，用 callFulfilled 直接调用 doResolve，设置队列里子 promise 的状态和值。
 * 当 promise 状态变为 REJECTED 类似。
 * 
 * @param {any} promise 
 * @param {any} onFulfilled 
 * @param {any} onRejected 
 */
function QueueItem(promise, onFulfilled, onRejected) {
    this.promise = promise 
    this.callFulfilled = value => {
        doResolve(this.promise, value)
    }
    this.callRejected = error => {
        doReject(this.promise, error)
    }
    if(isFunction(onFulfilled)) {
        this.callFulfilled = value => {
            unwrap(this.promise, onFulfilled, value)
        }
    }
    if(isFunction(onRejected)) {
        this.callRejected = error => {
            unwrap(this.promise, onRejected, error)
        }
    }
}
function doReject(self, error) {
    self.state = REJECTED
    self.value = error
    self.queue.forEach(queueItem => {
        queueItem.callRejected(error)
    })
    return self
/**
 * 
 * 如果 then 是函数，将 x（这里是 obj） 作为函数的 this 调用。
 * @param {any} obj 
 * @returns 
 */
function getThen(obj) {
    const then = obj && obj.then 
    if(obj && (isObject(obj) || isFunction(obj)) && isFunction(then)) {
        return function appyThen() {
            then.apply(obj, arguments)
        }
    }
}
function INTERNAL() {}
function isFunction(func) {
    return typeof func === 'function'
}
function isObject(obj) {
    return typeof obj === 'object'
}
function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]'
}

const PENDING = 0
const FULFILLED = 1
const REJECTED = 2

module.exports = Promise 

/**
 * 
 * 
 * @param {any} resolve 
 */
function Promise(resolve) {
    if (!isFunction(resolve)) {
        throw new TypeError('resolver must be a function');
    }
    // Promise 内部有三个变量
    // state: 当前promise的状态，pending => fulfilled || rejected
    // value: 当 state 是 FULFILLED 时存储返回值，当 state 是 REJECTED 时存储错误。
    // queue: promise 内部的回调队列
    this.state = PENDING
    this.value = void 0
    this.queue = []
    if(resolve !== INTERNAL) {
        safelyResolveThen(this, resolve)
    }
}
