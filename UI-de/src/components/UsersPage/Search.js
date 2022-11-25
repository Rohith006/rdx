import { Component } from "react";
import React from "react";
import { Link } from "react-router-dom";
import localization from "../../localization";
import { SvgSearch } from "../common/Icons";
import Select from "react-select";
import { REMOVED, PAUSED, PENDING } from "../../constants/user";
import { ACTIVE } from "../../constants/campaigns";
import { ADD_ADMINS } from "../../constants/app";

export default class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {
        selectStatusData: [
          { label: "-", value: null },
          { label: "Pending", value: PENDING },
          { label: "Active", value: ACTIVE },
          { label: "Removed", value: REMOVED },
          { label: "Paused", value: PAUSED },
        ],
        selectedStatus: null,
      },
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.props.actions.filterByName(e.target.value);
  }

  render() {
    const { filterValue, auth } = this.props;
    return (
      <div className="card-bd">
        {/* <div className="card_body"> */}
          <form className="form_cover">
            <div style={{width: '840px', height:'40px'}} className="search_cover">
              <span className="icon" title="">
                <SvgSearch />
              </span>
              <input
                type="text"
                className=""
                placeholder={localization.forms.search}
                autoComplete="off"
                onChange={this.handleChange}
                value={filterValue || ""}
              />
            </div>
            {!auth.currentUser.permissions.includes(ADD_ADMINS) ? null : (
              <Link to="/users/create">
                <button type="submit" className="btn neutral add">
                  <span className="btn_text">{localization.forms.addNew}</span>
                </button>
              </Link>
            )}
          </form>
        </div>
      // </div>
    );
  }

  onSelectChange(attribute, filter) {
    this.setState(
      (prevState) => ({
        rowSelected: false,
        filters: {
          ...prevState.filters,
          [attribute]: filter.value ? filter : null,
        },
      }) /* , () => {
            this.submitFilter()
        }*/
    );
  }
}
