export const getAdvertiserListSql = (where, limit, offset) => (
  `select
  a."id", a."name", a."email", a."managerId", a."createdAt", a."role", a."skype", a."status", a."statusReason",a."apiKey",
  count(distinct c.id) AS "campaignsCount", m."name" AS "managerName", b."country", b."companyName"
  from advertisers a
  left join "campaigns" c on a."id" = c."advertiserId"
  left join "admins" m on a."managerId" = m."id"
  left join "billingDetails" b on a."id" = b."userId" and b."userType" = 'ADVERTISER'
  ${where}
  group by a."id", m."name", b."id" order by a."createdAt" desc limit ${limit} offset ${offset};`
);

export const getAdvertiserStatusCountSql = (condition) => (
  `select (select count(*) from advertisers where "status"='ACTIVE' ${condition}) as active,
 (select count(*) from advertisers where "status"='PENDING' ${condition}) as pending,
 (select count(*) from advertisers where "status"='PAUSED' ${condition}) as paused`
);


