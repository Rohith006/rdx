-- dsp.ip_local_v1 definition

CREATE TABLE dsp.ip_local_v1
(

    `id` String,

    `wlid` String,

    `ip` String,

    `didsha1` String,

    `didmd5` String,

    `dpidsha1` String,

    `dpidmd5` String,

    `macsha1` String,

    `macmd5` String,

    `ua` String,

    `buyeruid` String,

    `yob` UInt8,

    `gender` String,

    `createdAt` DateTime,

    `updatedAt` DateTime,

    `createdDate` Date DEFAULT toDate(createdAt),

    `audienceId` UInt32
)
    ENGINE = MergeTree
PARTITION BY (toYYYYMMDD(createdAt),
 wlid)
ORDER BY createdAt
SETTINGS index_granularity = 8192;