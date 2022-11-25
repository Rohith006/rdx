import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import FlowNodeIcons from "../../../flow/FlowNodeIcons";
import { asyncRemote } from "../../../../remote_api/entrypoint";
import MultiSelect from "../../../../UI/MultiSelect/MultiSelect";

export default function DestinationInput({
  value: initValue,
  onChange,
  errorMsg,
  open,
  setOpen,
  delete_,
  setDelete,
  setSelected,
}) {
  const [destinations, setDestinations] = useState([]);
  const [destinationsDb, setDestionationsDb] = useState({});
  const [value, setValue] = useState(initValue);

  useEffect(() => {
    let isSubscribed = true;
    asyncRemote({
      url: "/destinations/entity",
    })
      .then((response) => {
        setDestinations(Object.values(response.data));
        setDestionationsDb(response.data);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {});

    return () => (isSubscribed = false);
  }, []);

  const handleOnChange = (ev) => {
    const id = ev;
    setValue(id);
    if (onChange && id in destinationsDb) {
      onChange(id, destinationsDb[id]);
    }
  };

  return (
    <MultiSelect
      initValue={value}
      onSetValue={handleOnChange}
      data={destinations}
      open={open}
      setOpen={setOpen}
      type="destination"
      delete_={delete_}
      setDelete={setDelete}
      setSelected_={setSelected}
    />
    // <TextField
    //   select
    //   variant="outlined"
    //   size="small"
    //   value={value}
    //   style={{ width: 150 }}
    //   error={
    //     typeof errorMsg !== "undefined" && errorMsg !== "" && errorMsg !== null
    //   }
    //   onChange={handleOnChange}
    //   helperText={<p className="helper_error">{errorMsg}</p>}
    // >
    //   {destinations.map((item) => {
    //     return (
    //       <MenuItem value={item.id} key={item.id}>
    //         <div style={{ display: "flex", alignItems: "center" }}>
    //           <FlowNodeIcons icon={item.icon} />{" "}
    //           <span style={{ marginLeft: 10 }}>{item.name}</span>
    //         </div>
    //       </MenuItem>
    //     );
    //   })}
    // </TextField>
  );
}
