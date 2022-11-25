import { ACTIVE, CPC, CPM, NEW, PAUSED, REMOVED } from "./campaigns";
import { DAY, HOUR, WEEK } from "./caps";

export const selectConfig = {
  status: [
    { value: null, label: "-" },
    { value: NEW, label: "New" },
    { value: ACTIVE, label: "Active" },
    { value: PAUSED, label: "Paused" },
    { value: REMOVED, label: "Removed" },
  ],
  rtb: [
    { value: 2.3, label: 2.3 },
    { value: 2.5, label: 2.5 },
  ],
};

export const notification_filter = [
  {label: "All", value: "ALL"},
  {label: "Read", value: "READ"},
  {label: "Unread", value: "UNREAD"}
]

export const AD_TYPES = {
  oRTB: [
    { name: "All", value: "ALL", active: true },
    { name: "Banner", value: "BANNER", active: true },
    { name: "Native", value: "NATIVE", active: true },
    { name: "Video", value: "VIDEO", active: true },
    { name: "Audio", value: "AUDIO", active: true },
    { name: "Connected TV", value: "VIDEO", active: true },
  ],
};

export const selectAdType = [
  { label: "-", value: null, active: true },
  { label: "Banner", value: "BANNER", active: true },
  { label: "Video", value: "VIDEO", active: true },
  { label: "Native", value: "NATIVE", active: true },
  { label: "Audio", value: "AUDIO", active: true },
  { label: "Connected TV", value: "VIDEO", active: true },
];

export const selectInventoryType = [
  { label: "-", value: null, active: true },
  { label: "Web", value: "WEB", active: true },
  { label: "In App", value: "IN APP", active: true },
];

export const BANNER = "BANNER";
export const POP = "POP";

export const ORTB = "oRTB";
export const IN_APP = "IN APP";
export const WEB = "WEB";

export const FIRST_PRICE = "FIRST PRICE";
export const SECOND_PRICE = "SECOND PRICE";

export const PLATFORM_LIST = [
  "All",
  "Android",
  "iOS",
  "Windows Mobile OS",
  "Bada OS",
  "FireFox OS",
  "Hiptop OS",
  "JavaOS",
  "KaiOS",
  "Linux Smartphone OS",
  "MTK/Nucleus OS",
  "MeeGo",
  "Nokia Series 40",
  "Palm OS",
  "RIM OS",
  "RIM Tablet OS",
  "Rex Qualcomm OS",
  "Symbian OS",
  "Windows CE",
  "Windows Phone OS",
  "Windows RT",
  "webOS",
  "Mac (Desktop)",
  "Mac OS (Desktop)",
  "Mac OS X (Desktop)",
  "MacOS (Desktop)",
  "MacOSX (Desktop)",
  "Windows (Desktop)",
  "Windows 10 (Desktop)",
  "Windows 7 (Desktop)",
  "Windows 8 (Desktop)",
  "Windows 8.1 (Desktop)",
  "Windows Vista (Desktop)",
  "Windows XP (Desktop)",
];

export const DEVICE_LIST = [
  "All",
  "Mobile",
  "Tablet",
  "Mobile / Tablets",
  "Desktop",
  "Connected Device",
  "Connected TV",
];
export const PUSH_DEVICE = ["ALL", "MOBILE", "DESKTOP"];
export const ADM = "ADM";
export const NURL = "NURL";
export const BURL = "BURL";
export const AUTO = "auto";
export const RTB = "RTB";

export const selectFreqCapTypeData = [
  { label: "-", value: null },
  { label: "Hour", value: HOUR },
  { label: "Day", value: DAY },
  { label: "Week", value: WEEK },
];
