const {db} = require('../connection');
const Scheme = db.schema;
const init = {
    up: async()=>{
        await Scheme.createTable('users', (table) => {
            table.uuid('id');
            table.string('name');
            table.string('email');
            table.text('password');
            table.date('dob');
            table.text('address');
            table.string('gender');
            table.string('country');
            table.string('phoneno');
            table.string('employee_type');
            table.string('employee_role');
            table.string('salary');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
          }).createTable('users_basic', (table) => {
            table.uuid('id');
            table.uuid('userid');
            table.string('passport');
            table.string('passport_upload');
            table.string('visa_expiry');
            table.string('visa_expiry_upload');
            table.string('eid_expiry');
            table.string('eid_expiry_upload');
            table.string('work_permit');
            table.string('personal_no');
            table.string('personal_acc_no');
            table.string('labour_card_upload');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('userid').references('id').inTable('users')
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
          }).createTable('users_advance', (table) => {
            table.uuid('id');
            table.uuid('userid');
            table.uuid('reason');
            table.string('amount');
            table.date('advance_date');
            table.text('description');
            table.string('receipt_upload');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('userid').references('id').inTable('users')
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
          }).createTable('users_overtime', (table) => {
            table.uuid('id');
            table.uuid('userid');
            table.string('hours_worked');
            table.string('amount');
            table.date('overtime_date');
            table.text('description');
            table.string('receipt_upload');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('userid').references('id').inTable('users')
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
          }).createTable('users_employee_role', (table) => {
            table.uuid('id');
            table.string('name');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
          }).createTable('users_reason', (table) => {
            table.uuid('id');
            table.string('name');
            table.uuid('created_by');
            table.uuid('updated_by');
            table.timestamps();
            table.primary('id');
            table.foreign('created_by').references('id').inTable('users')
            table.foreign('updated_by').references('id').inTable('users')
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