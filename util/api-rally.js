'use strict';
const { curry } = require('ramda')
const rp = require('request-promise')
const _include_headers = (body, response) => ({'headers': response.headers, 'data': body, 'statusCode': response.statusCode})

const get = curry(async (path, query) => {
    let options = {
        json: true,
        headers: {
            "zsessionid": process.env.BULKINOUT_VENDOR_TOKEN
        },
        qs: query,
        url: process.env.BULKINOUT_VENDOR_BASE_URL  + '/' + path,
        method: "GET",
        transform: _include_headers,
        simple: false,
        resolveWithFullResponse: true
    };
    return await rp(options)
})

module.exports = {
    get
    }