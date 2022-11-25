import React, { useEffect, useState } from "react";
import { asyncRemote, getError } from "../../remote_api/entrypoint";
import InsightsProAvailableServicesList from "../elements/lists/InsightsProAvailableServicesList";
import InsightsProSignUpForm from "../elements/forms/InsightsProSignUpForm";
import FormDrawer from "../elements/drawers/FormDrawer";
import InsightsProServiceConfigForm from "../elements/forms/InsightsProServiceConfigForm";
import "./InsightsPro.css";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupHeader,
} from "../elements/tui/TuiForm";
import CenteredCircularProgress from "../elements/progress/CenteredCircularProgress";
import ErrorsBox from "../errors/ErrorsBox";
import Button from "../elements/forms/Button";
import { BsStar, BsPlusCircle } from "react-icons/bs";
import { VscSignIn } from "react-icons/vsc";
import InsightsProSignInForm from "../elements/forms/InsightsProSignInForm";
import Resources from "./Resources";

export default function InsightsPro() {
  const [selectedService, setSelectedService] = useState(null);
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signIn, setSignIn] = useState(false);
  const [signUp, setSignUp] = useState(false);

  useEffect(() => {
    setLoading(true);
    let isSubscribed = true;
    asyncRemote({
      url: "/tpro/validate",
    })
      .then((response) => {
        if (response.status === 200 && isSubscribed === true) {
          if (response.data === true) {
            setStage(3);
          } else {
            if (response.data === false) {
              setSignIn(false);
              setSignUp(true);
            } else {
              setSignIn(true);
              setSignUp(false);
            }
            setStage(0);
          }
        }
      })
      .catch((e) => {
        if (isSubscribed === true) {
          if (e?.response?.status === 403) {
          } else {
            setError(getError(e));
          }
        }
      })
      .finally(() => {
        if (isSubscribed === true) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleServiceAddClick = (service) => {
    setSelectedService(service);
  };

  const handleServiceSaveClick = async () => {
    setSelectedService(null);
  };

  const EntryPoint = () => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          padding: 30,
        }}
      >
        <BsStar size={80} style={{ color: "gray", margin: 20 }} />
        <header
          style={{
            fontSize: "150%",
            fontWeight: 300,
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          Please join Insights Pro for more free and premium connectors and
          services. No credit card required. It is a free lifetime membership.
        </header>
        <nav style={{ display: "flex", marginTop: 20 }}>
          <Button
            label="Sign-in"
            icon={<VscSignIn size={20} />}
            onClick={() => setStage(2)}
            selected={signIn}
          ></Button>
          <Button
            label="Sign-up"
            icon={<BsPlusCircle size={20} />}
            onClick={() => setStage(1)}
            selected={signUp}
          ></Button>
        </nav>
      </div>
    );
  };

  const handleSingIn = (data) => {
    if (data === true) {
      setStage(3);
    }
  };

  const route = () => {
    if (stage === null) {
      return "";
    } else if (stage === 0) {
      return (
        <div style={{ padding: 20 }}>
          <EntryPoint />
        </div>
      );
    } else if (stage === 1) {
      return (
        <div style={{ padding: 20 }}>
          <InsightsProSignUpForm
            onSubmit={() => setStage(3)}
            onCancel={() => setStage(0)}
          />
        </div>
      );
    } else if (stage === 2) {
      return (
        <div style={{ padding: 20 }}>
          <InsightsProSignInForm
            onSubmit={handleSingIn}
            onCancel={() => setStage(0)}
          />
        </div>
      );
    } else if (stage === 3) {
      return (
        <>
          <TuiForm style={{ width: "100%", padding: 20 }}>
            <TuiFormGroup>
              <TuiFormGroupHeader header="Premium services" />
              <TuiFormGroupContent>
                <InsightsProAvailableServicesList
                  onServiceClick={handleServiceAddClick}
                />
              </TuiFormGroupContent>
            </TuiFormGroup>
          </TuiForm>
          <Resources />
          <FormDrawer
            width={550}
            label="Configure"
            onClose={() => setSelectedService(null)}
            open={selectedService !== null}
          >
            <div style={{ padding: 20 }}>
              <InsightsProServiceConfigForm
                service={selectedService}
                onSubmit={handleServiceSaveClick}
              />
            </div>
          </FormDrawer>
        </>
      );
    }
  };

  return (
    <div className="InsightsPro">
      {error && <ErrorsBox errorList={error} />}
      {loading && <CenteredCircularProgress />}
      {route()}
    </div>
  );
}
