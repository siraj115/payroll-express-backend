const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');

class ClientAssignEmployee extends compose(Model, HasUniqueIds){
    table = 'client_assign_employee';
    newUniqueId(){
        return uuid.v4()
    }
}

module.exports = {
    ClientAssignEmployee
}