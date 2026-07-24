exports.up = function(knex) {
  return knex.schema.createTable('recurring_rules', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('users.id').onDelete('CASCADE');
    table.integer('category_id').unsigned()
      .references('categories.id').onDelete('SET NULL');
    table.decimal('amount', 10, 2).notNullable();
    table.enum('type', ['income', 'expense']).notNullable();
    table.string('description', 255);
    table.enum('frequency', ['daily', 'weekly', 'monthly', 'yearly']).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.date('last_generated').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('recurring_rules');
};