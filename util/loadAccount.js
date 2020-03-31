'use strict';

// sets environment variables using the doctor
const fs = require('fs')
const homeDir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
const path = require('path')
const filePath = path.normalize(`${homeDir}/.doctor/config.json`);
const {find, propEq} = require('ramda');

module.exports = async () => {
    const account = process.env.DOCTOR_ACCOUNT
    if (!account) return
    
    const accounts = JSON.parse(fs.readFileSync(filePath));
    const props = find(propEq('name', account))(accounts);
    if (!props) {
        console.log(`No account found`);
        process.exit(1);      
    }
    process.env.BASE_URL = props.baseUrl
    process.env.USER_SECRET = props.userSecret
    process.env.ORG_SECRET = props.orgSecret
};

