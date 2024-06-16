const {db} = require('../connection');
const Scheme = db.schema;
const init = {
    up: async()=>{
        await Scheme.createTable('client_assign_employee',(table)=>{
            table.uuid('id');
            table.uuid('clientid');
            table.uuid('contractid');
            table.string('employee_role');
            table.uuid('employee_id');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
            table.foreign('employee_id').references('id').inTable('users')
            table.foreign('clientid').references('id').inTable('client_details')
            table.foreign('contractid').references('id').inTable('client_contract_details')
          })
    },
    down: async()=>{
        //await Schema.dropTableIfExists('')
    }
}

const main = async ()=>{
    if(process.argv[2] === 'rollback'){
        await init.down()
    }else{
        console.log('creating tables..')
        await init.up()
    }
    db.destroy()
}

main();