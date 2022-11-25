CREATE TABLE public."campaignAudiences" (
	id serial PRIMARY KEY,
	"segments" jsonb DEFAULT '"{}"'::jsonb,
	"groupsToggle" public."enum_campaignAudiences_groupsToggle",
	"createdAt" timestamptz DEFAULT now(),
	"updatedAt" timestamptz DEFAULT now(),
	"campaignId" int references campaigns(id),
);