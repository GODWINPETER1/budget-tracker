exports.up = function(knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('users.id').onDelete('CASCADE');
    table.integer('category_id').unsigned()
      .references('categories.id').onDelete('SET NULL');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('type', ['income', 'expense']).notNullable();
    table.string('description', 255);
    table.date('date').notNullable();
    table.boolean('is_recurring').notNullable().defaultTo(false);
    table.integer('recurring_id').unsigned().nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('transactions');
};