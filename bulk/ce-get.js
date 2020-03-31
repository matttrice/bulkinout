'option strict'

const timer = require('../util/timer')
const m = require('moment')

module.exports = async (test, api, element, resource, options) => {

    //begin timing bulk function
    const start = timer.begin()
    const startExecution = m(start).format('YYYY-MM-DD hh:mm A')
    console.log(`${test} status: started get loop @ ${start} to ${process.env.BASE_URL}`)

    const rows = await getRows(test, api.get, resource, options)

    //report result with duration (errors are recorded in count)
    const bulkStats = { date: startExecution, id: test, count: `${rows && rows.length ? rows.length : rows.message}`, element, resource, duration: timer.end(start), unit: 'seconds', filter: `${options && options.where ? options.where : ''}`, bulk_version: `node-get-loop` , environment: process.env.BASE_URL }
    console.log(bulkStats)
    return bulkStats
}

const getRows = async (test, get, resource, options) => {
    try {
        let go = true
        let result = []
        while (go) {
            let more = await get(`/${resource}`, options)

            if (more.statusCode === 429) {

                console.log(`statusCode 429: requestId: ${more.headers["elements-request-id"]}`)
                // mimic ce bulk and wait rather than trust x-ratelimit-reset
                timer.wait(2000)

            } else if (more.statusCode === 200 && more.headers["elements-next-page-token"]) {

                options.nextPage = more.headers["elements-next-page-token"]
                result = result.concat(more.data)
                go = more && more.data.length < options.pageSize ? false : true

                console.log(`${test} total: ${result.length}`)

            } else {
                return { message: `Error: received ${more.statusCode}, ${more.headers["elements-request-id"]}` }
            }
        }
        return result
    } catch (e) {
        console.log(e.message ? e.message : e)
        return { message: e.message ? e.message : e }
    }
}
