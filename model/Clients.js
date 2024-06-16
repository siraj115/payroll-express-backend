const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');
const {ClientContractDetails} = require('./ClientContractDetails')

class Clients extends compose(Model, HasUniqueIds){
    table = 'client_details';
    newUniqueId(){
        return uuid.v4()
    }
    relationClientContractDetails(){
        return this.hasOne(ClientContractDetails,'clientid')
    }
}

module.exports = {
    Clients
}