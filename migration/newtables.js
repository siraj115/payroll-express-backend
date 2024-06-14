const {db} = require('../connection');
const Scheme = db.schema;
const init = {
    up: async()=>{
        await Scheme.createTable('client_details', (table) => {
            table.uuid('id');
            table.string('companyname');
            table.string('contactname');
            table.string('contactphone');
            table.string('contactemail');
            table.text('address');
            table.string('companytrn');
            table.integer('status').defaultTo(1);
            table.timestamps();
            table.primary('id');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
          }).createTable('client_contract_details', (table) => {
            table.uuid('id');
            table.uuid('clientid');
            table.date('contractstart');
            table.date('contractend');
            table.string('contractprice');
            table.string('countmale');
            table.string('countfemale');
            table.string('countsupervisor');
            table.string('amountmale');
            table.string('amountfemale');
            table.string('amountsupervisor');
            table.string('vattax');
            table.integer('status').defaultTo(1);
            table.string('contractpdf');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
            table.foreign('clientid').references('id').inTable('client_details')
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