export const DASHBOARD = "DASHBOARD";
export const CAMPAIGN = "CAMPAIGN";
export const ADVERTISERS = "ADVERTISERS";
export const PUBLISHERS = "PUBLISHERS";
export const LOGS = "LOGS";
export const SETTINGS = "SETTINGS";
export const eCPM = "eCPM";

export const SEE_PROFIT = "SEE_PROFIT";
export const ADD_ADMINS = "ADD_ADMINS";
export const DELETE_USERS = "DELETE_USERS";
export const SET_ACTION_VALUE_EDIT = "SET_ACTION_VALUE_EDIT";
export const RESET_FORM_STATE = "RESET_FORM_STATE";
export const EDIT = "EDIT";
export const CHANGE_PAGINATION_VALUE = "CHANGE_PAGINATION_VALUE";

export const EVENT_TYPES = [
  { value: "USER_LOGIN", label: "User login" },
  { value: "USER_LOGOUT", label: "User logout" },
  { value: "USER_PASSWORD_RECOVERY", label: "User password recovery" },
  { value: "USER_REPORTS_EXPORT", label: "Reports export" },
  { value: "USER_DELETE", label: "User delete" },
  { value: "CAMPAIGN_NEW", label: "Campaign new" },
  { value: "CAMPAIGN_EDIT", label: "Campaign edit" },
  { value: "ADVERTISER_NEW", label: "Advertiser new" },
  { value: "ADVERTISER_EDIT", label: "Advertiser edit" },
  { value: "ADVERTISER_PAUSED", label: "Advertiser pause" },
  { value: "ADVERTISER_ACTIVE", label: "Advertiser activation" },
  { value: "ADVERTISER_DELETED", label: "Advertiser delete" },
  { value: "PUBLISHER_DELETED", label: "Publisher delete" },
  { value: "PUBLISHER_REJECTED", label: "Publisher reject" },
  { value: "PUBLISHER_PAUSED", label: "Publisher pause" },
  { value: "PUBLISHER_ACTIVE", label: "Publisher activation" },
];

export const RULES = [SEE_PROFIT, ADD_ADMINS, DELETE_USERS];
export const PERMISSIONS = [ADVERTISERS, PUBLISHERS, LOGS, SEE_PROFIT];
export const ADMIN = "ADMIN";
export const ACCOUNT_MANAGER = "ACCOUNT_MANAGER";
export const ADVERTISER = "ADVERTISER";
export const PUBLISHER = "PUBLISHER";

/* Creatives */
export const CREATIVE_EXTENSIONS = [
  ".jpeg",
  ".jpg",
  ".png",
  ".tiff",
  ".bmp",
  ".gif",
];
export const MAX_CREATIVE_FILE_SIZE = 500 * 1024; // in Kb
export const BANNER_RESOLUTIONS = [
  "250x250",
  "200x200",
  "468x60",
  "468x80",
  "728x90",
  "300x250",
  "336x280",
  "120x600",
  "160x600",
  "300x600",
  "970x90",
  "300x550",
  "320x50",
  "300x250",
  "320x480",
  "480x320",
  "728x90",
];
/* Native Ad Creative */
export const MAX_NATIVE_AD_CREATIVE_FILE_SIZE = 150 * 1024; // in Kb
export const NATIVE_ADS_CREATIVE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];
export const NATIVE_ADS_CREATIVE_MAIN_IMAGE_RESOLUTION = ["1200x627"];
export const NATIVE_ADS_CREATIVE_ICON_IMAGE_RESOLUTION = ["80x80"];
/**
 * Video Ad
 */
export const VIDEO_ADS_VIDEO_RESOLUTIONS = [
  "300x250",
  "320x320",
  "320x480",
  "480x320",
  "480x800",
  "360x640",
  "640x360",
  "480x640",
  "640x480",
  "480x720",
  "720x480",
  "960x640",
  "1280x720",
  "768x1024",
  "1024x768",
  "1280x800",
  "1920x1080",
  "2560x1440",
  "1280x720",
  "960x480",
  "480x960",
];
export const VIDEO_ADS_VIDEO_FILE_SIZE = 50 * 1024 * 1024; // in Mb
export const VIDEO_ADS_VIDEO_EXTENSIONS = ["mp4"];
export const VIDEO_ADS_END_CARD_EXTENSIONS = ["jpg", "png", "gif"];
export const VIDEO_ADS_END_CARD_RESOLUTIONS = ["600x800", "800x600"];
export const VIDEO_ADS_END_CARD_FILE_SIZE = 500 * 1024; // in Kb
export const VIDEO_ADS_SELECT_DELAY = ["Pre-Roll", "Mid-Roll", "Post-Roll"];

export const AUDIO_ADS_AUDIO_FILE_SIZE = 20 * 1024 * 1024; // in Mb

export const THIRD_PARTY_SEGEMENTS = 'THIRD_PARTY_SEGEMENTS';
export const MY_SEGMENTS = 'MY_SEGMENTS';
export const AUDIO_ADS_EXTENSIONS = ["mp3", "mp4", "acc", "ogg", "wav", "flac"];
