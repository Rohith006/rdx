import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { MainMenuData } from "./MainMenuData";
import { NavLink } from "react-router-dom";
import ConditionalDisplay from "../../UI/ConditionalDisplay/ConditionalDisplay";

export default function Sidebar({
  isOpen,
  setIsOpen,
  setSubMenu,
  active,
  selectMenu,
  setSelectMenu,
}) {
  const [arrow, setArrow] = useState(null);
  const history = useHistory();
  const ref1 = useRef();

  useEffect(() => {
    const ifClickedOutside = (e) => {
      if (ref1.current && !ref1.current.contains(e.target)) {
        setIsOpen(false);
        setSubMenu([]);
      }
    };
    document.addEventListener("click", ifClickedOutside);
    return () => {
      document.removeEventListener("click", ifClickedOutside);
    };
  }, [ref1, setIsOpen, setSubMenu]);

  const handleSubMenu = (nav) => {
    if (isOpen && nav.key === arrow) {
      setIsOpen(false);
    } else {
      setIsOpen(
        nav.subMenu.length > 1
          ? true
          : history.push(nav.subMenu && nav.subMenu[0].path)
      );
    }
    setSubMenu(nav.subMenu);
    setArrow(nav.key);
  };

  const handleMenu = () => {
    setIsOpen(false);
    setSelectMenu(false);
  };

  return (
    <nav ref={ref1} className="sidebar">
      {MainMenuData.map((item) => {
        return (
          <>
            <ConditionalDisplay roles={item.roles}>
              {item.subMenu ? (
                <span
                  key={item.key}
                  className={
                    active.hasOwnProperty(item.title.toLowerCase()) &&
                    selectMenu
                      ? "sidebar_nav-link active"
                      : isOpen && item.key === arrow
                      ? "sidebar_nav-link click"
                      : "sidebar_nav-link"
                  }
                  onClick={() => {
                    handleSubMenu(item);
                  }}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="sidebar_nav-link_text">{item.title}</span>
                  {isOpen && item.key === arrow && (
                    <div className="sidebar_arrow"></div>
                  )}
                </span>
              ) : (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? "sidebar_nav-link active" : "sidebar_nav-link"
                  }
                  onClick={() => handleMenu()}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="sidebar_nav-link_text">{item.title}</span>
                  {isOpen && item.key === arrow && (
                    <div className="sidebar_arrow"></div>
                  )}
                </NavLink>
              )}
            </ConditionalDisplay>
          </>
        );
      })}
      <div className="sidebar-transition" />
    </nav>
  );
}
