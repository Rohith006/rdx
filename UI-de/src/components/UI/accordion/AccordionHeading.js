import React from 'react';
import {AccordionItemButton, AccordionItemHeading} from 'react-accessible-accordion';

const AccordionHeading = ({title}) => (
  <AccordionItemHeading>
    <AccordionItemButton>
      <div className="card_header bordered">
        <h3 className="subheading">{title}</h3>
        <span className="icon"/>
      </div>
    </AccordionItemButton>
  </AccordionItemHeading>
);

export default AccordionHeading;
