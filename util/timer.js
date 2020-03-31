'use strict'


const begin = () => new Date()

const end = (start) => {
    return (new Date() - start) / 1000
}

const wait = (ms) => {
     const start = Date.now()
     let   now = start
    while (now - start < ms) {
        now = Date.now()
    }
}

module.exports = { begin, end, wait }