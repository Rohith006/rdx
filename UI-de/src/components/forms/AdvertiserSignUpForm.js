import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import * as EmailValidator from "email-validator";
import localization from "../../localization";
import { ButtonRegular, CheckBoxField, TextField } from "../UI";
import PasswordShow from "../Auth/PasswordShow";
import { strongPassRegex } from "../../utils/regExp";
import { Link } from "react-router-dom";
// import Modal from 'react-modal';



const validate = (values) => {
  const errors = {};
  if (!values.email) {
    errors.email = localization.validate.required;
  }
  if (values.email && !EmailValidator.validate(values.email.toLowerCase())) {
    errors.email = localization.validate.invalidEmail;
  }
  if (!values.name) {
    errors.name = localization.validate.required;
  }
  if (!values.password) {
    errors.password = localization.validate.required;
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = localization.validate.required;
  }
  if (values.password) {
    if (!strongPassRegex.test(values.password)) {
      errors.password = localization.validate.passwordLong;
    }
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = localization.validate.passwordMatch;
  }
  return errors;
};

// const customStyles = {
//   content : {
//     top                   : '50%',
//     left                  : '50%',
//     right                 : 'auto',
//     bottom                : 'auto',
//     marginRight           : '-50%',
//     transform             : 'translate(-50%, -50%)'
//   }
// };
// Modal.setAppElement('#root')

class AdvertiserSignUpForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      allowRegistration: false,
      // showModel : false,
      // modalIsOpen : false,
      // checkBox : false
    };
    //this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleAgreeToTerms = this.handleAgreeToTerms.bind(this);
    //this.handleCloseModal = this.handleCloseModal.bind(this);
  }
  // handleOpenModal () {
  //   console.log("hello")
  //   this.setState({modalIsOpen: false , allowRegistration: true });
  // }
  // handleCloseModal () {
  //   this.setState({ modalIsOpen: false , allowRegistration: false , checkBox : false});

  // }
  handleAgreeToTerms(e) {
    let { checked } = e.target;
    this.setState({ allowRegistration: checked });
    // console.log(checked)
    // if(checked===true){
    //   this.setState({ modalIsOpen: true, checkBox : true});
    // } else {
    //   this.setState({ allowRegistration: false, checkBox : false});
    // }
  }

  render() {
    const { state, props } = this;
    return ( 
      <form className="form" onSubmit={this.props.handleSubmit}>  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px",
          }}
        >
          <Field
            component={TextField}
            type="text"
            name="name"
            title={localization.forms.name}
          />
          <Field
            component={TextField}
            type="text"
            name="email"
            title={localization.forms.email}
          />
          <Field
            type="password"
            name="password"
            title={localization.forms.password}
            component={PasswordShow}
          />
          {/* <Field
            component={TextField}
            type="text"
            name="skype"
            title={localization.forms.skype}
          /> */}

          <Field
            type="password"
            name="confirmPassword"
            title={localization.forms.confirmPassword}
            component={PasswordShow}
          />
        </div>  
        <Field
          type = "checkbox"
          component={CheckBoxField}
          onChange={(e)=>this.handleAgreeToTerms(e)}
          // name="agreementCheckbox"
          // checked = {this.state.checkBox}
        />
{/* 
        <Modal
          isOpen={this.state.modalIsOpen}
          ariaHideApp={false}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <div className="agreement-page">
          <p>You can decide which country's laws apply to govern the agreement. This is otherwise known as choosing the jurisdiction. You will generally choose the country where the website, or business, is based.
You can remove or delete abusive accounts. For example, say you run a social media platform and explain that people who post inflammatory, abusive, or explicit content will be blocked from the service. Someone posts abusive content. You can block their account without worry, because you can rely on your Terms and Conditions agreement.
You can limit your responsibility. You can include disclaimer clauses in your agreement that say you're not liable for third party content, and you don't endorse it. You can also say that you're not responsible for mistakes and typos, or content uploaded by users which other users may find offensive.
You can manage a user's expectations of your website or platform. When the terms are clear, users know what they can and cannot expect from you.
You can set your own site rules and the consequences for violating these rules, within legal limits. You can't contract out of certain rules such as the law of negligence.
It's vital that you protect your intellectual property rights. By setting out what your rights are in the Terms and Conditions agreement, you can take action against users who infringe your rights. It should be clear that the logo, brand, and content belong to you.</p>
          </div>
            
          <div className = "TC_button_container">
          <ButtonRegular color="btn light-blue" width="100px" onClick={this.handleOpenModal}>{localization.agreementPage.agree}</ButtonRegular>
          <ButtonRegular color="btn light-blue ml2" width="120px" onClick={this.handleCloseModal}>{localization.forms.cancel}</ButtonRegular>
          </div>
        </Modal>
         */}
        <div className="agreement">
          <span>
            I have read and agree to the{" "}
            <Link to="/support/terms-and-conditions">Terms and Conditions</Link>{" "}
            and <Link to="/support/privacy-policy">Privacy Policy</Link>
          </span>
        </div>
        <div className="form_submit-btn" style={{ justifyContent: "center" }}>
          <ButtonRegular
            type="submit"
            color="dark-blue"
            width="188px"
            disabled={!this.state.allowRegistration}
            margin="0 2px"
          >
            {localization.forms.signUp}
          </ButtonRegular>
          <Link to={`/login`} className="adv-pub-name">
            <ButtonRegular type="button" color="dark-blue" width="188px">
              {localization.forms.signIn}
            </ButtonRegular>
          </Link>
        </div>
      </form>
    );
  }
}

export default reduxForm({
  form: "AdvertiserSignUpForm",
  validate,
})(AdvertiserSignUpForm);
