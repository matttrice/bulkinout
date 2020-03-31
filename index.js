'use-strict'
const otc = require('objects-to-csv')

const element = process.env.BULKINOUT_ELEMENT_KEY

const processBulkTests = async (options) => {
    try {
        let api
        // optionally sets env vars via doctor account
        require('./util/loadAccount')()
        // ensure necessary envs set
        require('./util/required')(['BASE_URL', 'BULKINOUT_ELEMENT_TOKEN', 'USER_SECRET', 'ORG_SECRET', 'BULKINOUT_ELEMENT_KEY', 'BULKINOUT_ELEMENT_RESOURCE'])

        // Begin Vendor Direct  
        const vResource = process.env.BULKINOUT_VENDOR_RESOURCE ? process.env.BULKINOUT_VENDOR_RESOURCE : process.env.BULKINOUT_ELEMENT_RESOURCE
        const vendorToken = process.env.BULKINOUT_VENDOR_TOKEN
        if (element === 'smartrecruiters' && vendorToken) {

            const vOptions = {
                limit: 100, // vendor max 100
                offset: 0
                //createdOn: '2020-02-21T20:33:58.000Z'
            }
            api = require('./util/api-smartrecruiters')
            await exec_bulk('smartrecruiters-vendor-direct-get', api, element, vResource, vOptions)
        }
        else if (element === 'caagilecentral' && vendorToken) {
            const vOptions = {
                pagesize: 200,// 2000 vendor max
                start: 1,   
                fetch:true,
                query:"(CreationDate > 2019-08-01)"
            }

            api = require('./util/api-rally')
            await exec_bulk('rally-vendor-direct-get', api, element, vResource, vOptions)
        }
        else if (element === 'sugarcrmv2' && vendorToken) {
            const vOptions = {
                max_num: 200,// 2000 vendor max
                offset: 0
            }

            api = require('./util/api-sugarcrm')
            await exec_bulk('sugarcrm-vendor-direct-get', api, element, vResource, vOptions)
        }
        else if (element === 'bullhorn' && vendorToken) {
            //note ce element is mapped to /myCandidates but prehook will swap to /search/Candidate even with no parameters added.
            const vOptions = {
                count: 200,// 2000 vendor max
                start: 0,
                fields: "*",// CE prehook
                query: "(dateLastModified:{0 TO *}) AND isDeleted:false",//see CE prehook
            }

            api = require('./util/api-bullhorn')
            await exec_bulk('bullhorn-vendor-direct-get', api, element, vResource, vOptions)
        }

        // Begin Cloud Elements
        const ceOptions = process.env.BULKINOUT_ELEMENT_REQUEST_OPTIONS ? 
                          process.env.BULKINOUT_ELEMENT_REQUEST_OPTIONS : 
                          { pageSize: 200 , where:"CreationDate>'2019-08-01'" }
        const ceResource = process.env.BULKINOUT_ELEMENT_RESOURCE

        api = require('./util/api')
        await exec_bulk('ce-get', api, element, ceResource, ceOptions)
        await exec_bulk('connector-js', api, element, ceResource, ceOptions)

    } catch (e) {
        console.log({ message: e.message ? e.message : e })
    }
}

const exec_bulk = async (test, api, element, vResource, options) => {
    const results = await require(`./bulk/${test}`)(test, api, element, vResource, options)
    const csv = new otc([results])
    await csv.toDisk(`./results.csv`, { append: true })
}

//--------------- run program ------------------------//
processBulkTests()