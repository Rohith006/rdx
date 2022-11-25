import React from "react";
import { asyncRemote, getError } from "../../../remote_api/entrypoint";
import {
  TuiForm,
  TuiFormGroup,
  TuiFormGroupContent,
  TuiFormGroupField,
  TuiFormGroupHeader,
} from "../tui/TuiForm";
import ErrorsBox from "../../errors/ErrorsBox";
import { Checkbox, FormControlLabel, Switch, TextField } from "@mui/material";
import Button from "./Button";
import ErrorLine from "../../errors/ErrorLine";

export default function EditUserForm({ user, onSubmit }) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState(user.fullName);
  const [email, setEmail] = React.useState(user.email);
  const [admin, setAdmin] = React.useState(user.roles.includes("admin"));
  const [marketer, setMarketer] = React.useState(
    user.roles.includes("marketer")
  );
  const [developer, setDeveloper] = React.useState(
    user.roles.includes("developer")
  );
  const [enabled, setEnabled] = React.useState(!user.disabled);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const mounted = React.useRef(false);

  const handleSave = async () => {
    if (password === confirmPassword && fullName && email) {
      setErrorMessage(null);
      setLoading(true);
      setError(false);
      try {
        let rolesToSend = [];
        if (admin) rolesToSend.push("admin");
        if (marketer) rolesToSend.push("marketer");
        if (developer) rolesToSend.push("developer");

        await asyncRemote({
          url: `/user/${user.id}`,
          method: "POST",
          data: {
            password: password || user.password,
            full_name: fullName,
            email: email,
            roles: rolesToSend,
            disabled: !enabled,
          },
        });

        if (onSubmit) {
          onSubmit();
        }
      } catch (error) {
        if (mounted.current) {
          setError(true);
          setErrorMessage(getError(error));
        }
      }
      if (mounted.current) setLoading(false);
    } else {
      if (mounted.current) setError(true);
    }
  };

  React.useEffect(() => {
    mounted.current = true;
    return () => (mounted.current = false);
  }, []);

  return (
    <TuiForm style={{ padding: 20 }}>
      <TuiFormGroup>
        <TuiFormGroupHeader
          header="Edit user"
          description="Here you can edit selected user."
        />
        {errorMessage && <ErrorsBox errorList={errorMessage} />}
        <TuiFormGroupContent>
          <TuiFormGroupField
            header="Edit password"
            description="Type new user password."
          >
            <TextField
              fullWidth
              variant="outlined"
              label="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              size="small"
            />
          </TuiFormGroupField>
          <TuiFormGroupField
            header="Confirm new password"
            description="Please retype the new password ."
          >
            <TextField
              fullWidth
              variant="outlined"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              size="small"
              error={password !== confirmPassword && error}
              helperText={
                <p className="helper_error">
                  {password !== confirmPassword &&
                    error &&
                    `Passwords don't match`}
                </p>
              }
            />
          </TuiFormGroupField>
          <TuiFormGroupField
            header="Full name"
            description="User's name and surname."
          >
            <TextField
              fullWidth
              variant="outlined"
              className="mt-2"
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              size="small"
              error={!fullName && error}
              helperText={
                !fullName &&
                error && (
                  <p className="helper_error">Full name cannot be empty</p>
                )
              }
            />
          </TuiFormGroupField>
          <TuiFormGroupField header="E-mail">
            <TextField
              fullWidth
              variant="outlined"
              className="mt-4"
              label="E-mail"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              size="small"
              error={!email && error}
              helperText={
                !email &&
                error && <ErrorLine>E-mail address cannot be empty</ErrorLine>
              }
            />
          </TuiFormGroupField>
        </TuiFormGroupContent>
      </TuiFormGroup>
      <TuiFormGroup>
        <TuiFormGroupHeader header="Roles in the system" />
        <TuiFormGroupField>
          <FormControlLabel
            style={{ padding: 10, marginLeft: 10 }}
            control={
              <Checkbox
                size="medium"
                checked={admin}
                onChange={() => setAdmin(!admin)}
              />
            }
            label="Admin"
          />
          <FormControlLabel
            style={{ padding: 10, marginLeft: 10 }}
            control={
              <Checkbox
                size="medium"
                checked={marketer}
                onChange={() => setMarketer(!marketer)}
              />
            }
            label="Marketer"
          />
          <FormControlLabel
            style={{ padding: 10, marginLeft: 10 }}
            control={
              <Checkbox
                size="medium"
                checked={developer}
                onChange={() => setDeveloper(!developer)}
              />
            }
            label="Developer"
          />
        </TuiFormGroupField>
      </TuiFormGroup>
      <TuiFormGroup>
        <TuiFormGroupHeader
          header="Active user account"
          description="User account can be turned off with this switch."
        />
        <TuiFormGroupField>
          <FormControlLabel
            style={{ padding: 10, marginLeft: 10 }}
            control={
              <Switch
                size="medium"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
              />
            }
            label="Activate user account"
          />
        </TuiFormGroupField>
      </TuiFormGroup>
      <Button
        label="Save"
        onClick={handleSave}
        progress={loading}
        style={{ justifyContent: "center" }}
        error={error}
      />
    </TuiForm>
  );
}
