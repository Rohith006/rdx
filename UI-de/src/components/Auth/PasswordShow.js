import React, {Component} from 'react';
import localization from '../../localization/en';

class PasswordShow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      icEye: 'icon-hidden',
      hidden: true,
      password: '',
    };

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.toggleShow = this.toggleShow.bind(this);
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  toggleShow() {
    let newState;
    newState = {
      icEye: (!this.state.hidden ? 'icon-hidden' : 'icon-visible'),
      hidden: !this.state.hidden,
      password: this.state.password,
    };
    this.setState(newState);
  }

  componentDidMount() {
    if (this.props.password) {
      this.setState({password: this.props.password});
    }
  }


  render() {
    const {input, meta: {touched, error}} = this.props;

    return (
      <div className={'form__text-field' + (touched && error ? ' errored' : '')}>
        <div className="form__text-field__wrapper">
          <span className="form__text-field__name">{localization.forms.password}</span>
          <input
            {...input}
            type={this.state.hidden ? 'password' : 'text'}
            value={this.state.password}
            onChange={this.handlePasswordChange}
            name="password"
          />
          <div className="form__text-field__error">
            <span>{touched && error}</span>
          </div>
          <span className={this.state.icEye} onClick={this.toggleShow}/>
        </div>
      </div>


    );
  }
}

export default PasswordShow;
