CREATE TYPE public."enum_audiences_type" AS ENUM (
	'IFA',
	'IP');

ALTER TABLE audiences ADD COLUMN "type" enum_audiences_type;