exports.up = function(knex) {
  return knex.schema.createTable('budgets', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('users.id').onDelete('CASCADE');
    table.integer('category_id').unsigned().notNullable()
      .references('categories.id').onDelete('CASCADE');
    table.decimal('amount_limit', 10, 2).notNullable();
    table.date('month').notNullable(); // store as first day of month, e.g. 2026-08-01
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'category_id', 'month']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('budgets');
};