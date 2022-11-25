import React, { useState } from "react";
import Properties from "../details/DetailProperties";
import Button from "../forms/Button";
import { VscUnlock, VscLock } from "react-icons/vsc";
import { isEmptyObjectOrNull } from "../../../misc/typeChecking";
import lock from "../../../assets/images/icons/lock.svg";
import unlock from "../../../assets/images/icons/unlock.svg";
import { TuiFormGroupField } from "../tui/TuiForm";

export default function CredentialsVault({ production, test }) {
  const [display, setDisplay] = useState(false);

  const handleReveal = () => {
    setDisplay(!display);
  };

  return (
    <div>
      {display && !isEmptyObjectOrNull(production) && (
        <div style={{ marginBottom: 10 }}>
          <TuiFormGroupField
            margin="none"
            header="Credentials for production"
            description="Credentials that will be used when the workflow is deployed on
            production."
          />
          <Properties properties={production} />
        </div>
      )}
      {display && !isEmptyObjectOrNull(test) && (
        <div style={{ marginBottom: 10, marginTop: 32 }}>
          <TuiFormGroupField
            margin="none"
            header="Credentials for test"
            description="Credentials that will be used when the workflow is being debugged
            and tested."
          />
          <Properties properties={test} />
        </div>
      )}
      {display &&
        isEmptyObjectOrNull(production) &&
        isEmptyObjectOrNull(test) && (
          <div style={{ marginBottom: 10 }}>
            No credentials were provided for this resource.
          </div>
        )}
      <div style={{ display: "grid", justifyContent: "center" }}>
        <Button
          label={!display ? "Show credentials" : "Hide credentials"}
          onClick={handleReveal}
          style={{
            padding: "6px 10px",
            width: "fit-content",
            textTransform: "uppercase",
          }}
          icon={
            !display ? (
              <img src={unlock} alt="unlock" />
            ) : (
              <img src={lock} alt="lock" />
            )
          }
        />
      </div>
    </div>
  );
}
