CREATE TYPE public."enum_advertiser_statusReason" AS ENUM (
	'DL_EXHAUST',
	'ML_EXHAUST',
	'',
	'PAYMENT_FAILED');



ALTER TABLE advertisers
    add column "statusReason" public."enum_advertiser_statusReason";