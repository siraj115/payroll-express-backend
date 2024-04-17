const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');

class Users extends compose(Model, HasUniqueIds){
    newUniqueId(){
        return uuid.v4()
    }
}

module.exports = {
    Users
}