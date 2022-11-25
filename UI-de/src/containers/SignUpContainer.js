import React, { Fragment } from "react";
import AdvertiserSignUpPage from "../components/Auth/AdvertiserSignUpPage";
import PublisherSignUpPage from "../components/Auth/PublisherSignUpPage";
import { ADVERTISER, PUBLISHER } from "../constants/user";
import localization from "../localization";
import Select from "react-select";
import "./scss/signup-container.scss";

class SignUpContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      role: { value: ADVERTISER, label: "Advertiser" },
      selectRoleData: [
        { label: "Advertiser", value: ADVERTISER },
        { label: "Publisher", value: PUBLISHER },
      ],
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ role: { value: ADVERTISER, label:"Advertiser"  } });
  }

  render() {
    const { value } = this.state.role;
    return (
      <Fragment>
        <div className="custom-form">
          <div className="logo_cover">
            <img src="/assets/images/desk-logo.png" alt="" />
          </div>
          {__NOT_HAS_SUB_DOMAINS__ ? (
            <div className="form_text-field">
              <div className="form_text-field_wrapper">
                <div className="form_text-field_name-wrapper">
                  <span className="form_text-field_name">
                    {localization.forms.yourRole}
                  </span>
                </div>
                <div className="form_text-field_input-wrapper">
                <div style={{backgroundColor:"#fdd0d5",color:'black', border:'1px solid rgba(137, 142, 151, 0.5)',padding: '2% 2%', borderRadius: '3px/3px'}} > Advertiser</div>
                  {/* <Select
                    options={this.state.selectRoleData}
                    value={this.state.role}
                    onChange={(e) => this.handleChange(e)}
                    styles={{
                      option: (
                        provided,
                        { isFocused, isSelected, isDisabled }
                      ) => ({
                        ...provided,
                        backgroundColor: isDisabled
                          ? null
                          : isSelected
                          ? "#fdd0d5"
                          : isFocused
                          ? "#fee8eb"
                          : null,
                        color: isSelected ? "black" : "black",
                      }),
                    }}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: "#000000",
                      },
                    })}
                    
                  /> */}
                </div>
              </div>
            </div>
          ) : (
            <div className="form_title">Sign Up</div>
          )}
          {value === ADVERTISER ? (
            <AdvertiserSignUpPage {...this.props} />
          ) : (
            <PublisherSignUpPage {...this.props} />
          )}
        </div>
      </Fragment>
    );
  }
}

export default SignUpContainer;
