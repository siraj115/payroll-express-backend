const {db} = require('../connection');
const {sutando, Model, compose, HasUniqueIds} = require('sutando');
const uuid  = require('uuid');

class UsersBasics extends compose(Model, HasUniqueIds){
    table = 'users_basic';
    newUniqueId(){
        return uuid.v4()
    }
}

module.exports = {
    UsersBasics
}