import React, { Fragment, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import localization from "../../localization";
import MyInventories from "./MyInventories";
import AvailableInventoriesList from "./AvailableInventories";
import Navigation from "./AvailableInventories/Navigation";

const InventoryControl = ({
  activeInventories,
  change,
  inventories,
  formData,
}) => {
  const userRole = useSelector((state) => state.auth.currentUser.role);
  const userActivation = useSelector(
    (state) => state.platformSettings.userActivation
  );
  const publishers = useSelector((state) => state.users.publishers);

  const [inventoriesList, setInventoriesList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectAllState, setSelectAllState] = useState(false);

  function initialData() {
    const initialInventories = inventories.map((el) => {
      let checked = false;
      let payout = "";
      activeInventories.forEach((data) => {
        if (el.id === data.publisherId) {
          checked = true;
          payout = data.payout;
        }
      });
      return { ...el, checked, payout };
    });
    return initialInventories.map((el) => ({ ...el, publisherId: el.id }));
  }

  useEffect(() => {
    const initialInventories = initialData();
    setInventoriesList(initialInventories);
    setFilteredList(initialInventories);
  }, []);

  useEffect(() => {
    if (!userActivation || !publishers.length) {
      return;
    }
    const initialInventories = initialData();

    const newInventories = initialInventories.map((inv) => {
      const publisher = publishers.find((el) => el.id === inv.publisherId);
      if (!publisher) {
        return;
      }
      if (!inv.payout && !publisher.payout) {
        return { ...inv, payout: userActivation.globalPayout };
      }
      if (!inv.payout) {
        return { ...inv, payout: publisher.payout };
      }
      return inv;
    });

    setFilteredList(newInventories);
  }, [userActivation, publishers, activeInventories]);

  useEffect(() => {
    if (
      filteredList.filter((el) => el && el.checked).length ===
      inventories.length
    ) {
      setSelectAllState(true);
    } else {
      setSelectAllState(false);
    }
  }, [filteredList]);

  useEffect(() => {
    const formattedInventories = {};
    filteredList
      .filter((el) => el && el.checked)
      .forEach((el) => {
        formattedInventories[el.id] = el;
      });
    change("inventories", formattedInventories);
  }, [inventoriesList]);

  function filterInventoriesHandler(inventory) {
    const newList = inventoriesList.map((el) =>
      inventory.id === el.id
        ? { ...el, checked: !el.checked, publisherId: inventory.publisherId }
        : el
    );
    setInventoriesList(newList);
    setFilteredList(newList);
  }

  function removeSelectedItem(id) {
    const newList = inventoriesList.map((el) =>
      id === el.id ? { ...el, checked: false } : el
    );
    setInventoriesList(newList);
    setFilteredList(newList);
  }

  function onInventoryPayoutChange(id, payout) {
    const inventories = { ...formData.inventories };
    if (~~payout <= 100 && inventories[id]) {
      inventories[id].payout = payout;
      change("inventories", inventories);
      setFilteredList(
        filteredList.map((el) => (el.id === id ? { ...el, payout } : el))
      );
    }
  }

  function selectAllHandler() {
    const newList = inventoriesList.map((el) => ({
      ...el,
      checked: !selectAllState,
    }));
    setSelectAllState(!selectAllState);
    setInventoriesList(newList);
    setFilteredList(newList);
  }
  
  function filterHandler({ target: { value } }) {
    setFilteredList(
      inventoriesList.filter(
        (el) =>
          el.name.toLowerCase().includes(value.toLowerCase()) ||
          `${el.id}`.includes(value)
      )
    );
  }
  return (

    <Fragment>
      <div className="card_body-item mr2">
        <h3 className="subheading">
          {localization.createCampaignForm.inventoryControl.labels.availableInv}
        </h3>
        <Navigation
          filterHandler={filterHandler}
          // selectAllState={selectAllState}
          // selectAllHandler={selectAllHandler}
        />
        <AvailableInventoriesList
          inventoriesList={filteredList}
          filterInventoriesHandler={filterInventoriesHandler}
          selectAllHandler={selectAllHandler}
          selectAllState={selectAllState}
        />
      </div>
      {filteredList && (
        <MyInventories
          userRole={userRole}
          removeSelectedItem={removeSelectedItem}
          onInventoryPayoutChange={onInventoryPayoutChange}
          inventoriesList={filteredList}
        />
      )}
    </Fragment>
  );
};

export default InventoryControl;
