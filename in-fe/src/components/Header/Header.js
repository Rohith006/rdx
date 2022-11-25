import React, { useEffect, useRef, useState } from "react";
import logo from "../../assets/images/insights.png";
import help from "../../assets/images/icons/help.svg";
import user from "../../assets/images/user.png";
import logOut from "../../assets/images/icons/logout.svg";
import AppToggle from "./AppToggle";
import { useDispatch } from "react-redux";
import { LogoutUser } from "../../redux/actions/auth";
import arrow from "../../assets/images/icons/arrow-down.svg";
import AuthService from "../../services/authServices";

function Header() {
  const [show, setShow] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const dispatch = useDispatch();
  const ref1 = useRef();

  useEffect(() => {
    const ifClickedOutside = (e) => {
      if (ref1.current && !ref1.current.contains(e.target)) {
        setShow(false);
        setOpenFilter(false);
      }
    };
    document.addEventListener("click", ifClickedOutside);
    return () => {
      document.removeEventListener("click", ifClickedOutside);
    };
  }, [ref1]);

  const triggerDropdown = () => {
    setShow(!show);
    setOpenFilter(!openFilter);
  };

  return (
    <header className="header_container">
      <div className="header_left">
        <AppToggle />
        <img className="header_logo" src={logo} alt="product-logo" />
      </div>
      <div className="header_right">
        <div className="flex flex-col items-center cursor-pointer p-1 rounded-[7%] hover:bg-[#e8e8e8]">
          <img src={help} alt="help-center" className="w-6" />
          <label className="appToggle_text">Help center</label>
        </div>
        <div
          ref={ref1}
          onClick={triggerDropdown}
          className="flex gap-2 cursor-pointer"
        >
          <img className="w-6 rounded-[50%] " src={user} alt="User-profile" />
          <span className = "header-title">
            {AuthService.userDetails()?.name}
          </span>
          <img
            src={arrow}
            alt="Down arrow"
            className={`w-3${openFilter ? " up" : " down"}`}
          />
          {show && (
            <div className="header_right_profile-container">
              <div className="flex items-center ">
                <img
                  className="w-7 h-7 ml-4 mr-2 rounded-[50%]"
                  src={user}
                  alt="User-profile"
                /> 
                <div>
                  <div className="header_right_profile-container_name">
                    {AuthService.userDetails()?.name}
                  </div>
                  <div className="header_right_profile-container_email">
                    {AuthService.userDetails()?.email}
                  </div>
                </div>
              </div>
              <div
                onClick={() => dispatch(LogoutUser())}
                className="header_right_profile-content"
              >
                <img src={logOut} alt="Logout" />
                <span>Signout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
