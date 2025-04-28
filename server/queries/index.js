const domain = require("./domain.queries");
const visit = require("./visit.queries");
const link = require("./link.queries");
const user = require("./user.queries");
const host = require("./host.queries");
const organization = require("./organization.queries.js");

module.exports = {
  domain,
  host,
  link,
  user,
  visit,
  organization
};
