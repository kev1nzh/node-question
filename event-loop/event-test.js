const EventEmitter = require('events').EventEmitter
const event = new EventEmitter()

event.on('abc', () => {
    console.log('do something.')
})


console.log(11323)

setTimeout(() => {
    event.emit('abc')
}, 1000)