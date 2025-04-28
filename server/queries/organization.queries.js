const knex = require("../knex");

async function find(match) {
  const organization = await knex("organization").where(match).first();
  return organization;
}

module.exports = {
  find
};
