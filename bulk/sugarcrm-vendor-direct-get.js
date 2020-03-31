'option strict'
const timer = require('../util/timer')
const m = require('moment')

module.exports = async (test, api, element, resource, options) => {

    //begin timing bulk function
    const start = timer.begin()
    const startExecution = m(start).format('YYYY-MM-DD hh:mm A')
    console.log(`${test} status: started vendor direct loop @ ${start} to ${process.env.BULKINOUT_VENDOR_BASE_URL }`)
    const rows = await getRows(test, api.get, resource, options)

    //report result with duration (errors are recorded in count)
    const bulkStats = { date: startExecution, id: 'vendor-direct-get', count: `${rows && rows.length ? rows.length : rows.message}`, element, resource, duration: timer.end(start), unit: 'seconds', filter: `${options.createdOn ? 'createdOn:' + options.createdOn : ''}`, bulk_version: `node-get-loop` , environment: process.env.BULKINOUT_VENDOR_BASE_URL }
    console.log(bulkStats)
    return bulkStats
}

const getRows = async (test, get, resource, options) => {
    try {
        let go = true
        let result = []
        while (go) {
            let more = await get(`/${resource}`, options)
            
            if (more.statusCode === 200 && more.data) {
                
                options.offset = more.data.next_offset
                result = result.concat(more.data.records)
                go = more.data.records.length < options.max_num ? false : true

                console.log(`${test} total: ${result.length}`)

            } else {
                console.log({ message: `Error: received ${more.statusCode}, ${JSON.stringify(more.data)}` })
            }
        }
        return result
    } catch (e) {
        console.log(e.message ? e.message : e)
        return { message: e.message ? e.message : e }
    }
}
