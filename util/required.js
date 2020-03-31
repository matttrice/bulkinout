'use strict'

//check fo required parameters 
module.exports = (requiredEnvs) => {
    let ready = true;
    requiredEnvs.map(require => {
        if (!process.env[require]) {
            ready = false;
            console.log(`export ${require}=`);
        }
    });
    if (!ready) {
        console.log('^^ Error: Environment variable(s) not set');
        process.exit();
    }
}