/* 
timers：执行setTimeout() 和 setInterval()中到期的callback。
I/O callbacks：上一轮循环中有少数的I/Ocallback会被延迟到这一轮的这一阶段执行
idle, prepare：仅内部使用
poll：最为重要的阶段，执行I/O callback，在适当的条件下会阻塞在这个阶段
check：执行setImmediate的callback
close callbacks：执行close事件的callback，例如socket.on("close",func)

    1、第一轮同步任务结尾处添加callback，当所有同步任务完成后执行callback。
    2、下一轮在timers阶段添加callback，在timers阶段结束后执行callback。
    3、下下一轮在check阶段添加callback，并在该阶段最后执行。


 http://egg.cnodejs.org/topic/5a9108d78d6e16e56bb80882
 https://cnodejs.org/topic/5556efce7cabb7b45ee6bcac
*/


// sleep函数 
function sleep(ms) {
    var start = Date.now(), expire = start + ms;
    while (Date.now() < expire) ;
    return;
}


/* 并行/并发

并发 (Concurrent) = 2 队列对应 1 咖啡机.

并行 (Parallel) = 2 队列对应 2 咖啡机.

Node.js 通过事件循环来挨个抽取事件队列中的一个个 Task 执行, 从而避免了传统的多线程情况下 2个队列对应 1个咖啡机 的时候上下文切换以及资源争抢/同步的问题, 所以获得了高并发的成就.

至于在 node 中并行, 你可以通过 cluster 来再添加一个咖啡机. */