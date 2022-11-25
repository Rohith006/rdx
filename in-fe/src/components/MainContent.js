import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import Header from "../components/Header/Header";
import { NavLink } from "react-router-dom";
import { isAuth } from "./authentication/login";
import { SubMenuData } from "./Sidebar/SubMenuData";
import { motion } from "framer-motion";
import ConditionalDisplay from "../UI/ConditionalDisplay/ConditionalDisplay";

export default function MainContent({ children }) {
  let token = isAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subMenuOption, setSubMenuOption] = useState([]);
  const [isActive, setIsActive] = useState({});
  const [selectMenu, setSelectMenu] = useState(false);
  const currentRoute = window.location.pathname;

  useEffect(() => {
    setTransition(currentRoute);
  }, [currentRoute]);

  const handleSubMenu = (path) => {
    setIsOpen(!isOpen);
    setSubMenuOption([]);
    setTransition(path);
  };

  const setTransition = (path) => {
    const route = path && path.split(["/"])?.[2];
    if (route) {
      Object.keys(SubMenuData).forEach(function (key) {
        if (SubMenuData[key].includes(route)) {
          setIsActive({ [key]: true });
          setSelectMenu(true);
        }
      });
    }
  };

  return (
    <>
      {token && <Header />}
      <main className="MainContainer">
        {isOpen && (
          <div className="sidebar_submenu fixed flex left-[104px] justify-left h-screen bg-white z-[60]">
            {subMenuOption.length > 0 && (
              <div className="mt-[20px] ml-4 mr-4 w-[240px]">
                {subMenuOption.map((item) => {
                  return (
                    <ConditionalDisplay roles={item.roles}>
                      <NavLink
                        key={item.key}
                        to={!item.pending && item.path}
                        className={({ isActive }) =>
                          isActive
                            ? "sidebar_subNav_active"
                            : item.pending
                            ? "sidebar_subNav coming"
                            : "sidebar_subNav"
                        }
                        onClick={() =>
                          !item.pending && handleSubMenu(item.path)
                        }
                      >
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 180 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.title}</span>
                            {item.pending && (
                              <span className="sidebar_subNav_pending">
                                Coming soon
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </NavLink>
                    </ConditionalDisplay>
                  );
                })}
              </div>
            )}
          </div>
        )}
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setSubMenu={setSubMenuOption}
          active={isActive}
          selectMenu={selectMenu}
          setSelectMenu={setSelectMenu}
        />
        <div
          className="px-6 py-6 w-screen h-[calc(100vh-60px)] overflow-auto"
          id="MainWindowScroll"
        >
          {children}
        </div>
      </main>
    </>
  );
}
