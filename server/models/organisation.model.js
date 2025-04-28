// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
// -- public.organization definition

// -- Drop table

// -- DROP TABLE public.organization;

// CREATE TABLE public.organization (
// 	id serial4 NOT NULL,
// 	uuid uuid DEFAULT uuid_generate_v4() NOT NULL,
// 	created_at timestamptz NOT NULL,
// 	updated_at timestamptz DEFAULT now() NOT NULL,
// 	is_deleted bool DEFAULT false NOT NULL,
// 	"domain" varchar(400) NOT NULL,
// 	name varchar(400) NOT NULL,
// 	auth_id varchar(400) NULL,
// 	auth_token varchar(400) NULL,
// 	allow_personal_caller_ids bool DEFAULT false NOT NULL,
// 	show_personal_numbers bool DEFAULT false NOT NULL,
// 	calling_component varchar(100) DEFAULT 'call_forward'::character varying NOT NULL,
// 	conference_addition varchar(100) DEFAULT 'warm'::character varying NOT NULL,
// 	max_numbers int4 DEFAULT 2 NULL,
// 	communication_emails varchar(5000) NULL,
// 	call_recording bool DEFAULT false NOT NULL,
// 	allow_user_recording_override bool DEFAULT true NOT NULL,
// 	reorder_contact_tabs bool DEFAULT false NOT NULL,
// 	salesforce_sync_enabled bool DEFAULT false NOT NULL,
// 	salesforce_contacts_visibility varchar(50) DEFAULT 'all'::character varying NOT NULL,
// 	always_collect_feedback bool DEFAULT false NOT NULL,
// 	plivo_account_id varchar(100) NULL,
// 	plivo_account_email varchar(1000) NULL,
// 	chat_session_timeout int4 DEFAULT 86400 NOT NULL,
// 	skip_contact_creation bool DEFAULT true NOT NULL,
// 	skip_case_creation bool DEFAULT true NOT NULL,
// 	transfer_disposition int4 NULL,
// 	allow_transfer_type bool DEFAULT true NULL,
// 	default_transfer_type varchar(10) DEFAULT 'warm'::character varying NULL,
// 	allow_acw_post_transfer bool DEFAULT false NULL,
// 	pubnub_keyset_data json NULL,
// 	call_recording_inbound bool DEFAULT false NOT NULL,
// 	call_recording_outbound bool DEFAULT false NOT NULL,
// 	allow_recording_pause_play bool DEFAULT true NOT NULL,
// 	allow_recording_announcement bool DEFAULT false NOT NULL,
// 	region varchar(20) NULL,
// 	is_active bool DEFAULT false NULL,
// 	cdp_tenant_id varchar(255) NULL,
// 	CONSTRAINT organization_pkey PRIMARY KEY (id)
// );

async function createOrganisationTable(knex) {
  const hasTable = await knex.schema.hasTable("organisations");
  if (!hasTable) {
    await knex.schema.createTable("organisations", (table) => {
      table.increments("id").primary();
      table.uuid("uuid").notNullable().defaultTo(knex.fn.uuid());
      table.timestamps(false, true);
      table.boolean("is_deleted").notNullable().defaultTo(false);
      table.string("domain").notNullable();
      table.string("name").notNullable();
      table.string("auth_id");
      table.string("auth_token");
      table.boolean("allow_personal_caller_ids").notNullable().defaultTo(false);
      table.boolean("show_personal_numbers").notNullable().defaultTo(false);
      table.string("calling_component").notNullable().defaultTo("call_forward");
      table.string("conference_addition").notNullable().defaultTo("warm");
      table.integer("max_numbers");
      table.string("communication_emails");
      table.boolean("call_recording").notNullable().defaultTo(false);
      table
        .boolean("allow_user_recording_override")
        .notNullable()
        .defaultTo(true);
      table.boolean("reorder_contact_tabs").notNullable().defaultTo(false);
      table.boolean("salesforce_sync_enabled").notNullable().defaultTo(false);
      table
        .string("salesforce_contacts_visibility")
        .notNullable()
        .defaultTo("all");
      table.boolean("always_collect_feedback").notNullable().defaultTo(false);
      table.string("plivo_account_id");
      table.string("plivo_account_email");
      table.integer("chat_session_timeout").notNullable().defaultTo(86400);
      table.boolean("skip_contact_creation").notNullable().defaultTo(true);
      table.boolean("skip_case_creation").notNullable().defaultTo(true);
      table.integer("transfer_disposition");
      table.boolean("allow_transfer_type").notNullable().defaultTo(true);
      table.string("default_transfer_type").notNullable().defaultTo("warm");
      table.boolean("allow_acw_post_transfer").notNullable().defaultTo(false);
      table.json("pubnub_keyset_data");
      table.boolean("call_recording_inbound").notNullable().defaultTo(false);
      table.boolean("call_recording_outbound").notNullable().defaultTo(false);
      table.boolean("allow_recording_pause_play").notNullable().defaultTo(true);
      table
        .boolean("allow_recording_announcement")
        .notNullable()
        .defaultTo(false);
      table.string("region");
      table.boolean("is_active");
      table.string("cdp_tenant_id");
    });
  }
}

module.exports = {
  createOrganisationTable,
};
