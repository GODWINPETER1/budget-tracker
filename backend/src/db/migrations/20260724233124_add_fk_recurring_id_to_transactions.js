exports.up = function(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.foreign('recurring_id').references('recurring_rules.id').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropForeign('recurring_id');
  });
};