import React, { createRef, useEffect, useState } from "react";
import bell from "../../../../assets/images/icons/notification.svg";
import general from "../../../../assets/images/icons/general.svg";
import arrow from "../../../../assets/images/icons/arrow-down.svg";
import Read from "../../../../assets/images/icons/AllRead.svg";
import { notification_filter } from "../../../constants/common";
import { connect } from "react-redux";
import {
  loadNotification,
  updateAll,
  updateOne,
} from "../../../actions/notification";
import localization from "../../../localization";
import moment from "moment";
import { bindActionCreators } from "redux";

function Notification_Display(props) {
  const ref1 = createRef();
  const ref2 = createRef();
  const { email, notificationData } = props;
  const [open, setOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [checked, setChecked] = useState(0);
  const [label, setLabel] = useState("All");
  const [all, setAll] = useState(notificationData);
  const [temp, setTemp] = useState(all);
  const [markRead, setMarkRead] = useState(all.filter((item) => item.seen !== null));
  const [markUnRead, setMarkUnRead] = useState(all.filter((item) => item.seen === null));

  useEffect(() => {
    props.actions.loadNotification(email);
  }, []);

  useEffect(() => {
    setMarkRead(notificationData.filter((item) => item.seen !== null));
    setMarkUnRead(notificationData.filter((item) => item.seen === null));
  }, [notificationData]);

  useEffect(() => {
    const ifClickedOutside = (e) => {
      if (ref1.current && !ref1.current.contains(e.target)) {
        setOpen(false);
        setOpenFilter(false);
      }
      if (ref2.current && !ref2.current.contains(e.target)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener("click", ifClickedOutside);
    return () => {
      document.removeEventListener("click", ifClickedOutside);
    };
  }, [ref1, ref2]);

  function handleToggle() {
    setOpenFilter(!openFilter);
  }

  function handleNotification() {
    setOpen(!open);
    !open && props.actions.loadNotification(email);
  }

  const checkValue = (i) => {
    setChecked(i);
    setOpenFilter(!openFilter);
  };

  async function handleRead(data) {
    const updatedData = all.map((item) => {
      return item.notification_id === data.notification_id && item.seen === null
        ? { ...item, seen: moment().format() }
        : item;
    });
    setAll(updatedData);
    setMarkRead(updatedData.filter((item) => item.seen !== null));
    setMarkUnRead(updatedData.filter((item) => item.seen === null));
    const status = await props.actions.updateOne(email, data.notification_id);
    if (status === 200) {
      return;
    } else {
      setAll(temp);
      setMarkRead(temp.filter((item) => item.seen !== null));
      setMarkUnRead(temp.filter((item) => item.seen === null));
    }
  }

  async function handleReadAll() {
    const updatedData = notificationData.map((item) => {
      return {
        ...item,
        seen: moment().format(),
      };
    });
    setAll(updatedData);
    setMarkRead(updatedData);
    setMarkUnRead([]);
    const status = await props.actions.updateAll(email);
    if (status === 200) {
      return;
    } else {
      setAll(temp);
      setMarkRead(temp.filter((item) => item.seen !== null));
      setMarkUnRead(temp.filter((item) => item.seen === null));
    }
  }

  function changeFilter(data) {
    let filtered;
    if (data.label === "Read") {
      filtered = all.filter((item) => item.seen !== null);
      setLabel(data.label);
      setMarkRead(filtered);
      setOpenFilter(!openFilter);
    } else if (data.label === "Unread") {
      filtered = all.filter((item) => item.seen === null);
      setLabel(data.label);
      setMarkUnRead(filtered);
      setOpenFilter(!openFilter);
    } else {
      setAll(all);
      setLabel(data.label);
      setOpenFilter(!openFilter);
    }
  }

  useEffect(() => {
    const seen = notificationData.filter((item) => item.seen !== null);
    const unseen = notificationData.filter((item) => item.seen === null);
    const sortedArray = seen
      .sort(function (a, b) {
        return a.notification_id - b.notification_id;
      })
      .reverse();
    const sortedArray1 = unseen
      .sort(function (a, b) {
        return a.notification_id - b.notification_id;
      })
      .reverse();
    const notification1 = [...sortedArray1, ...sortedArray];
    setAll(notification1);
    setMarkRead(notificationData.filter((item) => item.seen !== null));
    setMarkUnRead(notificationData.filter((item) => item.seen === null));
    setTemp(notification1);
  }, [notificationData]);
  const count = all.filter(
    (item) => item.seen === null && item.notification_title !== null
  );
  return (
    <div ref={ref1} className="notifications">
      <div className="notifications_icon" onClick={handleNotification}>
        {count.length !== 0 && (
          <span className="badge">
            {count.length > 9 ? "9+" : count.length}
          </span>
        )}
        <img className="icon_position" src={bell} />
      </div>
      {open && (
        <div className="notifications_content">
          <div className="notifications_header">
            <div className="notifications_header-container">
              <span className="size">
                {localization.Notifications.notification}
              </span>
              <button
                ref={ref2}
                className="notifications_dropdown"
                onClick={handleToggle}
              >
                <label className="label_width">{label}</label>
                {openFilter && (
                  <div className="filters">
                    {notification_filter.map((item, index) => {
                      return (
                        <div key={index} className="filters_options">
                          <label
                            onClick={() => {
                              checkValue(index);
                              changeFilter(item);
                            }}
                            className="label_name"
                          >
                            <input
                              className="button_size"
                              checked={checked === index ? true : false}
                              type="radio"
                              value={item.value}
                            />
                            {item.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
                <img
                  src={arrow}
                  alt="Down arrow"
                  className={openFilter ? "up" : "down"}
                />
              </button>
            </div>
            <button className="mark_as" onClick={handleReadAll}>
              {localization.Notifications.MarkAllRead}
            </button>
          </div>
          {label === "Read" ? (
            markRead.length > 0 ? (
              <div className="notifications_block">
                {markRead.map((item, index) => {
                  return item.notification_title !== null ? (
                    <div
                      key={index}
                      className={`flex${item.seen === null ? " red" : ""}`}
                    >
                      <img
                        className="category"
                        src={general}
                        alt={item.category}
                      />
                      <div
                        onClick={() => handleRead(item)}
                        className="notifications_data"
                      >
                        <div className="inner_text">
                          <div className="notifications_title">
                            {item.notification_title}
                          </div>
                          <div className="notifications_body">
                            {item.notification_body}
                          </div>
                          {item.notification_link !== "" ? (
                            <a
                              href={item.notification_link}
                              target="_blank"
                              className="notifications_link"
                            >
                              {localization.Notifications.view}
                            </a>
                          ) : (
                            ""
                          )}
                          <div className="date_and_time">
                            {moment(item.created_at).startOf().fromNow()} at{" "}
                            {moment(item.created_at).format("LT")}
                          </div>
                        </div>
                        {item.seen === null && (
                          <div className="read_badge">
                            <div
                              className="unread"
                              value={item.notification_id}
                            ></div>
                            <span className="notifications_tooltip">
                              {localization.Notifications.markRead}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  );
                })}
                <div className="notifications_footer">
                  {localization.Notifications.end}
                </div>
              </div>
            ) : (
              <div className="notifications_message">
                <img alt="Bell Icon" className="message_icon" src={Read} />
                <div className="message_text">
                  {localization.Notifications.allUnread}
                </div>
              </div>
            )
          ) : label === "Unread" ? (
            markUnRead.length > 0 ? (
              <div className="notifications_block">
                {markUnRead.map((item, index) => {
                  return item.notification_title !== null ? (
                    <div
                      key={index}
                      className={`flex${item.seen === null ? " red" : ""}`}
                    >
                      <img
                        className="category"
                        src={general}
                        alt={item.category}
                      />
                      <div
                        onClick={() => handleRead(item)}
                        className="notifications_data"
                      >
                        <div className="inner_text">
                          <div className="notifications_title">
                            {item.notification_title}
                          </div>
                          <div className="notifications_body">
                            {item.notification_body}
                          </div>
                          {item.notification_link !== "" ? (
                            <a
                              href={item.notification_link}
                              target="_blank"
                              className="notifications_link"
                            >
                              {localization.Notifications.view}
                            </a>
                          ) : (
                            ""
                          )}
                          <div className="date_and_time">
                            {moment(item.created_at).startOf().fromNow()} at{" "}
                            {moment(item.created_at).format("LT")}
                          </div>
                        </div>
                        {item.seen === null && (
                          <div className="read_badge">
                            <div
                              className="unread"
                              value={item.notification_id}
                            ></div>
                            <span className="notifications_tooltip">
                              {localization.Notifications.markRead}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  );
                })}
                <div className="notifications_footer">
                  {localization.Notifications.end}
                </div>
              </div>
            ) : (
              <div className="notifications_message">
                <img alt="Bell Icon" className="message_icon" src={Read} />
                <div className="message_text">
                  {localization.Notifications.allRead}
                </div>
              </div>
            )
          ) : all.length > 0 ? (
            <div className="notifications_block">
              {all.map((item, index) => {
                return item.notification_title !== null ? (
                  <div
                    key={index}
                    className={`flex${item.seen === null ? " red" : ""}`}
                  >
                    <img
                      className="category"
                      src={general}
                      alt={item.category}
                    />
                    <div
                      key={index}
                      onClick={() => handleRead(item)}
                      className="notifications_data"
                    >
                      <div className="inner_text">
                        <div className="notifications_title">
                          {item.notification_title}
                        </div>
                        <div className="notifications_body">
                          {item.notification_body}
                        </div>
                        {item.notification_link !== "" ? (
                          <a
                            href={item.notification_link}
                            target="_blank"
                            className="notifications_link"
                          >
                            {localization.Notifications.view}
                          </a>
                        ) : (
                          ""
                        )}
                        <div className="date_and_time">
                          {moment(item.created_at).startOf().fromNow()} at{" "}
                          {moment(item.created_at).format("LT")}
                        </div>
                      </div>
                      {item.seen === null && (
                        <div className="read_badge">
                          <div
                            className="unread"
                            value={item.notification_id}
                          ></div>
                          <span className="notifications_tooltip">
                            {localization.Notifications.markRead}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                );
              })}
              <div className="notifications_footer">
                {localization.Notifications.end}
              </div>
            </div>
          ) : (
            <div className="notifications_message">
              <img alt="Bell Icon" className="message_icon" src={Read} />
              <div className="message_text">
                {localization.Notifications.all}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      loadNotification,
      updateOne,
      updateAll,
    },
    dispatch
  ),
});

const mapStateToProps = (state) => ({
  notificationData: state.notification.notificationData,
  email: state.auth.currentUser.email,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification_Display);
