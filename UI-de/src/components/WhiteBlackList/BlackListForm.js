import React from "react";
import classNames from "classnames";
import LayoutList from "./LayoutList";
import { Field, reduxForm } from "redux-form";
import GridList from "./Grid";
import Select from "react-select";
import localization from "../../localization";
import { SvgBlackList } from "../common/Icons";

const columnDefsWlist = [
  {
    headerName: localization.users.table.name,
    field: "name",
    headerClass: "ag-grid-header-cell",
  },
  {
    headerName: "Edit",
    field: "userEditor",
    cellRenderer: "renderEditor",
    width: 20,
  },
];

class BlackListForm extends React.Component {
  constructor(props) {
    super(props);
    this.renderSelectField = this.renderSelectField.bind(this);
    this.renderTextField = this.renderTextField.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  async onSelect(selectedPublisher) {
    await this.props.onSelectPublisher(selectedPublisher);
    this.props.change("publisherId", this.props.selectedPublisher.value);
  }

  renderSelectField({
    meta: { touched, error },
    selectPublisherData,
    selectedPublisher,
  }) {
    return (
      <div className={classNames({ "input-error-wrapper": touched && error })}>
        <Select
          options={selectPublisherData}
          value={selectedPublisher}
          onChange={this.onSelect}
          placeholder="Select publisher"
        />
        <div className="input-error-wrapper__error-container">
          <span>{touched && error}</span>
        </div>
      </div>
    );
  }

  renderTextField({ input, meta: { touched, error }, placeholder }) {
    return (
      <div
        className={classNames({
          "input-error-wrapper input-error-wrapper--with-border":
            touched && error,
        })}
      >
        <input {...input} type="text" placeholder={placeholder} />
        <div className="input-error-wrapper__error-container">
          <span>{touched && error}</span>
        </div>
      </div>
    );
  }

  render() {
    const { options, selectedPublisher, handleSubmit } = this.props;
    return (
      <LayoutList listTitle={"Blacklist"} listSvg={SvgBlackList}>
        <div className="form-group_field">
          <div className="flex justify-start mb2">
            <div className="input-lg--fixed mr2">
              <Field
                name="publisherId"
                component={this.renderSelectField}
                selectPublisherData={options}
                selectedPublisher={selectedPublisher}
              />
            </div>
            {this.props.selectedPublisher &&
            this.props.selectedPublisher.value > 0 ? (
              <span className="btn ml2" onClick={handleSubmit}>
                Add
              </span>
            ) : null}
          </div>

          <GridList {...this.props} columnDefs={columnDefsWlist} />
        </div>
      </LayoutList>
    );
  }
}

export default reduxForm({ form: "BlackListForm" })(BlackListForm);
