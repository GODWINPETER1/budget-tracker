const dayjs = require('dayjs');
const db = require('../config/db');
const recurringModel = require('../models/recurringModel');
const transactionModel = require('../models/transactionModel');

function getNextDate(date, frequency) {
  const unitMap = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' };
  return dayjs(date).add(1, unitMap[frequency]);
}

async function generateForRule(rule) {
  const today = dayjs();
  const endDate = rule.end_date ? dayjs(rule.end_date) : null;

  // Where do we start generating from?
  // If we've never generated before, start at start_date.
  // If we have, start from the day AFTER the last one we generated.
  let cursor = rule.last_generated
    ? getNextDate(rule.last_generated, rule.frequency)
    : dayjs(rule.start_date);

  const toInsert = [];

  while (
    (cursor.isBefore(today) || cursor.isSame(today, 'day')) &&
    (!endDate || cursor.isBefore(endDate) || cursor.isSame(endDate, 'day'))
  ) {
    toInsert.push({
      user_id: rule.user_id,
      category_id: rule.category_id,
      amount: rule.amount,
      type: rule.type,
      description: rule.description,
      date: cursor.format('YYYY-MM-DD'),
      is_recurring: true,
      recurring_id: rule.id,
    });
    cursor = getNextDate(cursor, rule.frequency);
  }

  if (toInsert.length === 0) {
    return { generated: 0 };
  }

  // Insert all generated transactions, then update last_generated to the last one we created
  await db.transaction(async (trx) => {
    await trx('transactions').insert(toInsert);
    const lastDate = toInsert[toInsert.length - 1].date;
    await trx('recurring_rules').where({ id: rule.id }).update({ last_generated: lastDate });
  });

  return { generated: toInsert.length };
}

async function generateForUser(userId) {
  const rules = await db('recurring_rules').where({ user_id: userId });
  let totalGenerated = 0;
  for (const rule of rules) {
    const result = await generateForRule(rule);
    totalGenerated += result.generated;
  }
  return { totalGenerated };
}

async function generateForAllUsers() {
  const rules = await recurringModel.findAllActive();
  let totalGenerated = 0;
  for (const rule of rules) {
    const result = await generateForRule(rule);
    totalGenerated += result.generated;
  }
  return { totalGenerated };
}

module.exports = { generateForRule, generateForUser, generateForAllUsers };