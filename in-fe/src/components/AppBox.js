import React from "react";
import MainContent from "./MainContent";
import { Redirect, Route } from "react-router-dom";
import PrivateRoute from "./authentication/PrivateRoute";
import Resources from "./pages/Resources";
import Rules from "./pages/Rules";
import EventsAnalytics from "./pages/EventsAnalytics";
import ProfilesAnalytics from "./pages/ProfilesAnalytics";
import SessionsAnalytics from "./pages/SessionsAnalytics";
import FlowEditor from "./flow/FlowEditor";
import Flows from "./pages/Flows";
import urlPrefix from "../misc/UrlPrefix";
import ActionPlugins from "./pages/ActionPlugins";
import Segments from "./pages/Segments";
import FlowReader from "./flow/FlowReader";
import Instances from "./pages/Instances";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import TryOut from "./pages/TryOut";
import TestEditor from "./pages/TestEditor";
import NewUser from "./pages/NewUser";
import EventSources from "./pages/EventSources";
import InsightsPro from "./pages/InsightsPro";
import PageTabs from "./pages/groups/PageTabs";
import Consents from "./pages/Consents";
import Dashboard from "./pages/Dashboard";
import EventValidation from "./pages/EventValidation";
import Logs from "./pages/Logs";
import Users from "./pages/Users";
import Destinations from "./pages/Destinations";
import EventTags from "./pages/EventTags";
import UserLogs from "./pages/UserLogs";
import PrivateTab from "./authentication/PrivateTab";
import UserSelfInspect from "./pages/UserSelfInspect";
import Home from "./pages/Home";
import EventSourceForm from "./elements/forms/EventSourceForm";
import EventSourceDetails from "./elements/details/EventSourceDetails";
import ResourceForm from "./elements/forms/ResourceForm";
import ResourceDetails from "./elements/details/ResourceDetails";
import DestinationForm from "./elements/forms/DestinationForm";
import DestinationDetails from "./elements/details/DestinationDetails";
import ConsentDetails from "./elements/details/ConsentDetails";
import ConsentForm from "./elements/forms/ConsentForm";
import EventValidationForm from "./elements/forms/EventValidationForm";
import EventValidationDetails from "./elements/details/EventValidationDetails";

const AppBox = () => {
  return (
    <MainContent>
      {/*Redirects*/}
      <PrivateRoute
        exact
        path={urlPrefix("/")}
        roles={["super", "admin", "developer"]}
      >
        <Redirect to={urlPrefix("/home")} />
      </PrivateRoute>

      {/* <PrivateRoute
        exact
        path={urlPrefix("/")}
        roles={["super", "admin", "developer"]}
      >
        <Redirect to={urlPrefix("/setup/web-app-events")} />
      </PrivateRoute> */}

      {/* <PrivateRoute exact path={urlPrefix("*")} roles={["admin", "developer"]}>
        <Redirect to={urlPrefix("/setup/data-sources")} />
      </PrivateRoute> */}

      {/*Dashboard*/}

      {/* <Route exact path={urlPrefix("/dashboard")}>
        <PageTabs
          title="Dashboard"
          tabs={[
            new PrivateTab(
              ["admin", "marketer"],
              <Dashboard />,
              "/dashboard/events",
              "Events"
            ),
          ]}
        />
      </Route> */}

      {/*Pro*/}

      {/* <PrivateRoute path={urlPrefix("/pro")} roles={["admin"]}>
        <InsightsPro />
      </PrivateRoute> */}

      {/*Processing*/}

      <PrivateRoute
        exact
        path={urlPrefix("/activate/edit/:id")}
        roles={["admin", "developer"]}
      >
        <FlowEditor />
      </PrivateRoute>
      <PrivateRoute
        exact
        path={urlPrefix("/activate/preview/:id")}
        roles={["admin", "developer", "marketer"]}
      >
        <FlowReader />
      </PrivateRoute>

      {/*Monitoring*/}

      {/* <PrivateRoute path={urlPrefix("/monitoring")} roles={["admin"]}>
        <PageTabs
          title="Monitoring"
          tabs={[
            new PrivateTab(
              ["admin"],
              <Instances />,
              "/monitoring/instances",
              "Running instances"
            ),
            new PrivateTab(
              ["admin"],
              <Tasks />,
              "/monitoring/schedule",
              "Scheduled tasks"
            ),
            new PrivateTab(["admin"], <Logs />, "/monitoring/log", "Logs"),
            new PrivateTab(
              ["admin"],
              <UserLogs />,
              "/monitoring/user-log",
              "User logs"
            ),
          ]}
        />
      </PrivateRoute> */}

      {/* Home */}
      <PrivateRoute path="/home" roles={["super", "admin", "developer"]}>
        <Home />
      </PrivateRoute>

      {/* Dashboard */}
      <PrivateRoute path="/dashboard" roles={["super", "admin", "developer"]}>
        <Dashboard />
      </PrivateRoute>

      {/*Setup*/}

      <PrivateRoute
        path="/setup/connectors"
        roles={["super", "admin", "developer"]}
      >
        <Resources />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/connector/create"
        roles={["super", "admin", "developer"]}
      >
        <ResourceForm />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/connector/view/:id"
        roles={["super", "admin", "developer"]}
      >
        <ResourceDetails />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/events_"
        roles={["super", "admin", "developer"]}
      >
        <EventSources />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/event/create"
        roles={["super", "admin", "developer"]}
      >
        <EventSourceForm />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/event/view/:id"
        roles={["super", "admin", "developer"]}
      >
        <EventSourceDetails />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/destinations"
        roles={["super", "admin", "developer"]}
      >
        <Destinations />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/destination/create"
        roles={["super", "admin", "developer"]}
      >
        <DestinationForm />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/destination/view/:id"
        roles={["super", "admin", "developer"]}
      >
        <DestinationDetails />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/consents"
        roles={["super", "admin", "developer"]}
      >
        <Consents />
      </PrivateRoute>
      <PrivateRoute
        path="/setup/consent/create"
        roles={["super", "admin", "developer"]}
      >
        <ConsentForm />
      </PrivateRoute>
      <PrivateRoute
        path="/setup/consent/view/:id"
        roles={["super", "admin", "developer"]}
      >
        <ConsentDetails />
      </PrivateRoute>

      <PrivateRoute
        path="/setup/validations"
        roles={["super", "admin", "developer"]}
      >
        <EventValidation />
      </PrivateRoute>
      <PrivateRoute
        path="/setup/validation/create"
        roles={["super", "admin", "developer"]}
      >
        <EventValidationForm />
      </PrivateRoute>
      <PrivateRoute
        path="/setup/validation/view/:id"
        roles={["super", "admin", "developer"]}
      >
        <EventValidationDetails />
      </PrivateRoute>

      {/* Track */}
      <PrivateRoute
        path="/track/events"
        roles={["super", "admin", "developer"]}
      >
        <EventsAnalytics />
      </PrivateRoute>

      <PrivateRoute
        path="/track/sessions"
        roles={["super", "admin", "developer"]}
      >
        <SessionsAnalytics />
      </PrivateRoute>

      {/*Unify*/}

      <PrivateRoute
        path="/unify/profiles"
        roles={["super", "admin", "marketer", "developer"]}
      >
        <ProfilesAnalytics />
      </PrivateRoute>

      {/*Segments*/}

      {/* <PrivateRoute
        path="/segments/funnel"
        roles={["admin", "developer", "marketer"]}
      >
        <Users />
      </PrivateRoute> */}
      <PrivateRoute
        path="/segments/view"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <Segments />
      </PrivateRoute>

      {/* Activate */}
      <PrivateRoute
        path="/activate/workflow"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <Flows />
      </PrivateRoute>
      <PrivateRoute
        path="/activate/routing"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <Rules />
      </PrivateRoute>

      {/* Settings */}
      <PrivateRoute
        path="/settings/plugins"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <ActionPlugins />
      </PrivateRoute>
      <PrivateRoute
        path="/settings/users"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <Users />
      </PrivateRoute>
      <PrivateRoute
        path="/settings/tags"
        roles={["super", "admin", "developer", "marketer"]}
      >
        <EventTags />
      </PrivateRoute>

      {/*Testing

      <PrivateRoute
        exact
        path={urlPrefix("/testing")}
        roles={["admin", "developer"]}
      >
        <TestEditor />
      </PrivateRoute>

      {/*Current user account info*/}

      <PrivateRoute
        exact
        path={urlPrefix("/my-account")}
        roles={["super", "admin", "developer", "marketer"]}
      >
        <UserSelfInspect />
      </PrivateRoute>

      {/*Other*/}

      <Route exact path={urlPrefix("/tryout")}>
        <TryOut />
      </Route>
      <Route exact path={urlPrefix("/user/new")}>
        <NewUser />
      </Route>
    </MainContent>
  );
};

export default AppBox;
