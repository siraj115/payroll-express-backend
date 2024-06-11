const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');

class Clients extends compose(Model, HasUniqueIds){
    table = 'client_details';
    newUniqueId(){
        return uuid.v4()
    }
}

module.exports = {
    Clients
}