import Button from "../forms/Button";
import { BiTimeFive } from "react-icons/bi";
import React from "react";
import PropTypes from "prop-types";

const NowDateTime = ({ onDateSelect }) => {
  const onNowClick = () => {
    const date = {
      absolute: null,
      delta: null,
    };
    onDateSelect(date);
  };

  return (
    <div className="DateNow">
      <div>
        Setting the time to "now" means that on every refresh this time will be
        set to current date and time.
      </div>
      <Button
        label="Set to now"
        style={{ width: 240, marginLeft: 20 }}
        icon={<BiTimeFive size={20} style={{ marginRight: 5 }} />}
        onClick={() => onNowClick()}
      />
    </div>
  );
};

NowDateTime.propTypes = {
  onDateSelect: PropTypes.func,
};

export default NowDateTime;
