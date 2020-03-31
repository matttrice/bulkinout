'option strict'
/**
 * This bulk process (submit/wait/"fixJson"/return) is derived from connector.js to represent 
 * thanos fetchTable function performance when written in pure node rather than of client side, injested javascript 
 */

const R = require('ramda')
const m = require('moment')
module.exports = async (test, api, element, resource, options) => {
    try {
        const query = options && options.where ? `select * from ${resource} where ${options.where}` : `select * from ${resource}`

        //begin timing bulk function
        const timer = require('../util/timer')
        const start = timer.begin()

        const getBulk = R.pipeP(
            bulkQuery(api.post),
            bulkStatus(api.get),
            bulkData(api.get, resource),
            fixJsonData
        )
        const rows = await getBulk(query)
        //report result with duration
        const bulkStats = { date: m(start).format('YYYY-MM-DD hh:mm A'), id: test, count: `${rows && rows.length ? rows.length : rows.message}`, element, resource, duration: timer.end(start), unit: 'seconds', filter: `${options.where ? options.where : ''}`, bulk_version: `bulk-v1`, environment: process.env.BASE_URL }
        console.log(bulkStats)
        return bulkStats

    } catch (e) {
        console.log(e.message ? e.message : e)
        return { message: e.message ? e.message : e }
    }
}

const bulkData = R.curry(async (req, tbl, id) => {
    let bulk = await req(`/bulk/${id}/${tbl}`, '')
    return bulk.data
})

const bulkQuery = R.curry(async (req, q) => {
    let bulk = await req(`/bulk/query?q=${q}`, '')
    console.log(`connector-js status: bulk id:${bulk.id} submitted to ${process.env.BASE_URL}`)
    return bulk.id
})

const bulkStatus = R.curry(async (req, id) => {
    while (true) {
        waiting(3000)
        let check = await req(`/bulk/${id}/status`, '')
        if (check && check.data && R.contains(check.data.status, ['COMPLETED', 'SUCCESS'])) {
            return check.data.id
        } 
        console.log(`connector-js total: ${check && check.data ? check.data.recordsCount : '??'}`)
    }
})

const waiting = (ms) => {
    let start = Date.now(),
        now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}
const fixJsonData = data => {
    const timer2 = require('../util/timer')
    const start2 = timer2.begin()
    // ce returns jsonL from bulk
    try {
        let result
        if (data === undefined || data === "") {
            result='[]'
        }
        if (typeof (data) === "object" && !(data instanceof Array)) {
            result=R.append(data, [])
        } else if (typeof (data) === "string" && R.pipe(R.head, R.equals('{'))(data)) {
            result=R.append(JSON.parse(data), [])
        } else {
            result=data
        }
        console.log( "fixJsonData try timer: " + timer2.end(start2))
        return result

    } catch (err) {
        const timer3 = require('../util/timer')
        const start3 = timer3.begin()
        
        data = data.split('\n').join(',\n')
        data = data.substring(0, data.length - 2)
        data = '[' + data + ']'
        let catchResult = JSON.parse(data)
        
        console.log( "fixJsonData catch timer: " + timer3.end(start3))
        return catchResult
    }
}