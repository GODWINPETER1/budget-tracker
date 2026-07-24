exports.up = function(knex) {
  return knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.string('name', 50).notNullable();
    table.enum('type', ['income', 'expense']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('categories');
};