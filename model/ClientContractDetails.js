const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');

class ClientContractDetails extends compose(Model, HasUniqueIds){
    table = 'client_contract_details';
    newUniqueId(){
        return uuid.v4()
    }
}

module.exports = {
    ClientContractDetails
}