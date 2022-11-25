import React from 'react'
import { Field } from 'redux-form'
import { AccordionItem, AccordionItemPanel } from 'react-accessible-accordion'
import ChooseFile from './ChooseFile'
import { TextField } from '../../../UI'
import { AccordionHeading } from '../../../UI/accordion'
import { maxLength, required } from '../../../../utils/validatorUtils'

const maxInputLength = maxLength(100)

const Retargeting = ({ change, formData }) => (
  <AccordionItem uuid={'1'}>
    <AccordionItemPanel>
      <div className="card_body">
        <div className="card_body-item">
          <Field
            component={TextField}
            name="name"
            title="Name"
            validate={[required, maxInputLength]}
          />
          <ChooseFile
            change={change}
            initialLabel="choose csv file"
            formData={formData}
          />
        </div>
      </div>
    </AccordionItemPanel>
  </AccordionItem>
)

export default Retargeting
