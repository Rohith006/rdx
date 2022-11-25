import nodemailer from 'nodemailer';
import {email as emailConfig} from '../../config';
import {templates} from '../constants/emails';
import path from 'path';
import ejs from 'ejs-html';
import fs from 'fs';

const sendEmail = (mailOptions) => new Promise((resolve) => {
  nodemailer.createTestAccount(() => {
    const {host, port, isSecure, authUser, authPassword, sender, rejectUnauthorized} = emailConfig;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user: authUser,
        pass: authPassword,
      },
      tls: {
        rejectUnauthorized,
      },
    });

    transporter.sendMail({
      ...mailOptions,
      from: sender,
    }, (err) => {
      if (err) {
        console.error(err);
      }
      resolve();
    });
  });
});

const sendTemplatedEmail = (mailOptions, variables, type) => new Promise((resolve) => {
  const templatePath = path.join(process.cwd(), templates[type]);
  const source = fs.readFileSync(templatePath, 'utf8');
  const html = ejs.render(source, variables, {vars: Object.keys(variables)});
  mailOptions = {...mailOptions, html};

  const {host, port, isSecure, authUser, authPassword, sender, rejectUnauthorized} = emailConfig;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: authUser,
      pass: authPassword,
    },
    tls: {
      rejectUnauthorized,
    },
  });

  transporter.sendMail({
    ...mailOptions,
    from: sender,
  }, (err) => {
    if (err) {
      console.error(err);
    }
    resolve();
  });
});

export {sendEmail, sendTemplatedEmail};
