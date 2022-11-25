import Settings from "../../assets/images/icons/settings.svg";
import { IoGitNetworkSharp } from "react-icons/io5";
import { BiUnite } from "react-icons/bi";
import Track from "../../assets/images/icons/track.svg";
import Setup from "../../assets/images/icons/setup.svg";
import Activate from "../../assets/images/icons/activate.svg";
import Home from "../../assets/images/icons/Home.svg";
import Dashboard from "../../assets/images/icons/Dashboard.svg";

export const MainMenuData = [
  {
    title: "Home",
    key: 1,
    roles: ["super", "admin", "developer"],
    icon: <img src={Home} alt="home" />,
    path: "/home",
  },
  {
    title: "Dashboard",
    key: 2,
    roles: ["super", "admin", "developer"],
    icon: <img src={Dashboard} alt="home" />,
    path: "/dashboard",
  },
  {
    title: "Setup",
    key: 3,
    roles: ["super", "admin", "developer"],
    icon: <img src={Setup} alt="setup" />,
    subMenu: [
      {
        title: "Events",
        key: 1,
        roles: ["super", "admin", "developer"],
        path: "/setup/events_",
      },
      {
        title: "Connectors",
        key: 2,
        roles: ["super", "admin", "developer"],
        path: "/setup/connectors",
      },
      {
        title: "Destinations",
        key: 3,
        roles: ["super", "admin", "developer"],
        path: "/setup/destinations",
      },
      {
        title: "Consents",
        key: 4,
        roles: ["super", "admin", "developer"],
        path: "/setup/consents",
      },
      {
        title: "Validations",
        key: 5,
        roles: ["super", "admin", "developer"],
        path: "/setup/validations",
      },
    ],
  },
  {
    title: "Track",
    key: 4,
    roles: ["super", "admin", "developer"],
    icon: <img src={Track} alt="track icon" />,
    subMenu: [
      {
        title: "Events",
        key: 1,
        roles: ["super", "admin", "developer"],
        path: "/track/events",
      },
      {
        title: "Sessions",
        key: 2,
        roles: ["super", "admin", "developer"],
        path: "/track/sessions",
      },
    ],
  },
  {
    title: "Unify",
    key: 5,
    icon: <BiUnite size={20} />,
    roles: ["super", "admin", "developer", "marketer"],
    path: "/unify/profiles",
    subMenu: [
      {
        title: "Profiles",
        key: 1,
        path: "/unify/profiles",
        roles: ["super", "admin", "developer", "marketer"],
      },
    ],
  },
  {
    title: "Segments",
    key: 6,
    roles: ["super", "admin", "developer", "marketer"],
    icon: <IoGitNetworkSharp size={20} />,
    subMenu: [
      {
        title: "All segments",
        key: 1,
        path: "/segments/view",
        roles: ["super", "admin", "developer", "marketer"],
      },
      {
        title: "Funnel",
        key: 2,
        path: "/segments/funnel",
        pending: true,
        roles: ["super", "admin", "developer", "marketer"],
      },
    ],
  },
  {
    title: "Activate",
    key: 7,
    roles: ["super", "admin", "developer", "marketer"],
    icon: <img src={Activate} alt="activate" />,
    subMenu: [
      {
        title: "Personalisation workflow",
        key: 1,
        path: "/activate/workflow",
        roles: ["super", "admin", "developer", "marketer"],
      },
      {
        title: "Routing rules",
        key: 2,
        path: "/activate/routing",
        roles: ["super", "admin", "developer", "marketer"],
      },
    ],
  },
  {
    title: "Settings",
    key: 8,
    roles: ["super", "admin", "developer", "marketer"],
    icon: <img src={Settings} alt="settings" />,
    subMenu: [
      {
        title: "Workflow plugins",
        key: 1,
        path: "/settings/plugins",
        roles: ["super", "admin", "developer", "marketer"],
      },
      {
        title: "Users",
        key: 2,
        path: "/settings/users",
        roles: ["super", "admin", "developer", "marketer"],
      },
      {
        title: "Event tags",
        key: 3,
        path: "/settings/tags",
        roles: ["super", "admin", "developer", "marketer"],
      },
    ],
  },
];
