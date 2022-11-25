import React, {useState, useEffect} from 'react';
import AdvertiserWidget from '../components/home/advertiserSummury'
import GettingStartedWidget from '../components/home/gettingStartedWidget.js'
import AnnouncementWidget from '../components/home/AnnouncementWidget.js'
import {QuickLinksWidget} from '../components/home/QuickLinksWidget.js'
import Tips from "../assets/images/icons/tips.svg";

export const RandomPlatormTip = () => {
    const tips = [
      "You can go through our help centre any time for help with onboarding steps",
      "External advertiser ids need to be linked to ReBid Advertisers",
      "Authenticate credentials for your integrations partners at the ReBid Company screen",
      "You can bulk edit campaigns across channels and platform from our campaigns section",
      "You can share reports from our one click reporting dashboards with view only access from our analyse tab",
      "Add all you creatives inside our creative library under activate tab, and access them anytime",
      "Naming convention for campaigns, campaign groups, mediaplans can be enforced at company level",
      "Only company manager can approve/reject insertion orders",
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const [tip, setTip] = useState(randomTip);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setTip(tips[Math.floor(Math.random() * tips.length)]);
      }, 10000);
      return () => clearInterval(interval);
    }, []);
  
    return <span className="home-tip_content">{tip}</span>;
};

export const getGreeting = () => {
    const userTimezone = new Date();
    const hour = userTimezone.getHours();
    if (hour < 12) {
      return `Good morning`;
    }
    if (hour >= 12 && hour < 16) {
      return `Good afternoon`;
    }
    return `Good evening`;
};

export const onboardingContent = [
  {
    id: 1,
    completed: true,
    title: "Add setup events",
    href: "/setup/events_",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 2,
    completed: false,
    title: "Add connectors",
    href: "/setup/connectors",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 3,
    completed: false,
    title: "Add setup destinations",
    href: "/setup/destinations",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 4,
    completed: false,
    title: "Add/View segments",
    href: "/segments/view",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 5,
    title: "Add Workflow",
    completed: false,
    href: "/activate/workflow",   
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 6,
    title: "Create/merge profile",
    completed: false,
    href: "/settings/users",
    url: "https://support.rebid.co/portal/en/kb/articles/audience-18-5-2022",
  },
];

export const widgets = [
    {
      key: 1,
      widgetTitle: "Advertiser Summary",
      widgetType: "advertiserSummary",
      widgetSize: "small",
      widgetComponent: <AdvertiserWidget />,
    },
    {
      key: 2,
      widgetTitle: "Getting started with Rebid Insights",
      widgetType: "onboarding",
      widgetSize: "small",
      widgetComponent: <GettingStartedWidget />,
    },
    {
      key: 3,
      widgetTitle: "Live Announcement",
      widgetType: "liveAnnouncement",
      widgetSize: "medium",
      widgetComponent: <AnnouncementWidget />,
    },
    {
      key: 4,
      widgetTitle: "Quick Setup Links",
      widgetType: "quickLinks",
      widgetSize: "medium",
      widgetComponent: <QuickLinksWidget />,
    },
];

export const quickLinks = [
  {
    id: 1,
    name: "Setup events",
    title: "Setup events",
    description: "This will help you to add events",
    href: "/setup/events_",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 2,
    name: "Add connectors",
    title: "Add connectors",
    description: "This will help you to add connectors",
    href: "/setup/connectors",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 3,
    name: "Add setup destinations",
    title: "Add setup destinations",
    description: "This will help you to add destinations setup",
    href: "/setup/destinations",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 4,
    name: "Add or view segments",
    title: "Add/View segments",
    description: "This will help you to add/view segments",
    href: "/segments/view",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 5,
    name: "Add workflow",
    title: "Add Workflow",
    description: "This will help you to add Workflow",
    href: "/activate/workflow",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
  {
    id: 6,
    name: "Create/merge profile",
    title: "Create/merge profile",
    description: "This will help you to add/merge profile",
    href: "/settings/users",
    icon: Tips,
    target: "_top",
    url: "https://support.rebid.co/portal/en/kb/articles/campaign-management-18-5-2022"
  },
];