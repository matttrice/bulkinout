'use strict';

const authData = process.env.BULKINOUT_ELEMENT_TOKEN !== undefined ? 
    `User ${process.env.USER_SECRET}, Organization ${process.env.ORG_SECRET} , Element ${process.env.BULKINOUT_ELEMENT_TOKEN}` :
    `User ${process.env.USER_SECRET}, Organization ${process.env.ORG_SECRET}`

const { curry } = require('ramda')
const rp = require('request-promise')
const _include_headers = (body, response) => ({'headers': response.headers, 'data': body, 'statusCode': response.statusCode})


const get = curry(async (path, query) => {
    let options = {
        json: true,
        headers: {
            Authorization: authData,
        },
        qs: query,
        url: process.env.BASE_URL + '/elements/api-v2' + path,
        method: "GET",
        transform: _include_headers,
        simple: false,
        resolveWithFullResponse: true
    };
    return await rp(options)
})

const post = curry(async (path, body) => {
    let options = {
        json: true,
        headers: {
            Authorization: authData,
        },
        url: process.env.BASE_URL + '/elements/api-v2' + path,
        method: "POST"
    };

    //because bulk posts use query path, not body, and defining body without data will error
    if (body) { options.body = body }

    return await rp(options)
})

const remove = curry(async (path) => {
    let options = {
        json: true,
        headers: {
            Authorization: authData,
        },
        url: process.env.BASE_URL + '/elements/api-v2' + path,
        method: "DELETE"
    };
    return await rp(options)
})

module.exports = {
    get,
    post,
    remove
}