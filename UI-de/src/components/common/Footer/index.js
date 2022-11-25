import React from 'react';
import localization from '../../../localization';
import {Link} from 'react-router-dom';

const Footer = () => {
  // const isAdmin = getRole();
  return (
    <footer className="footer" style={{justifyContent: 'flex-end'}}>
      {/* {*/}
      {/*  isAdmin ? null :*/}
      {/*    <div className="footer__copyright">*/}
      {/*      {localization.footer.copyright} © 2019.*/}
      {/*    </div>*/}
      {/* }*/}
      {/* <div className="footer__links">*/}
      {/*  <Link to="/support/privacy-policy"> {localization.footer.privacyPolicy}</Link>*/}
      {/* </div>*/}
    </footer>
  );
};

// function getRole() {
//   const href = window.location.href;
//   return href.includes(__ADMIN_DOMAIN__);
// }

export default Footer;
