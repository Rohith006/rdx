import React from 'react';
import {
  // Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import localization from '../../localization';

const LayoutList = (props) => (
  <AccordionItem uuid={'4'}>
    <AccordionItemHeading>
      <AccordionItemButton>
        <div className="card_header bordered">
          <h3 className="subheading">
            {/* Publisher {props.listTitle}*/}
            {localization.createCampaignForm.inventoryControl.title}
          </h3>
          <span className="icon"/>
        </div>
      </AccordionItemButton>
    </AccordionItemHeading>
    <AccordionItemPanel>
      <div className="card_body w100">
        <div className="card_body-item w100">
          <div className="form-group w100 ">
            <p className="form__text-field__name">Whitelist</p>
            {/* <div className="form-group_label">{props.listLabel}</div>*/}

            {props.children}
          </div>
        </div>
      </div>
    </AccordionItemPanel>
  </AccordionItem>
);

export default LayoutList;
