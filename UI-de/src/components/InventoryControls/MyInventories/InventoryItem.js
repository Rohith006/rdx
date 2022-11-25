import React, {useEffect} from 'react';
import * as userConstants from '../../../constants/user';
import {AccordionItemPanel} from 'react-accessible-accordion';

export default function InventoryItem({inventory, onInventoryPayoutChange, userRole}) {

  return (
    <AccordionItemPanel>
      <div className="inventories_item-desc">
        {
          userRole === userConstants.ADMIN && (
            <div className="form-group">
              <div className="form-group_row">
                <div className="form__text-field__wrapper">
                  <span className="form__text-field__name">Payout (%)</span>
                  <input type="text" className='input-sm' name="payout" autoComplete="off"
                    value={inventory.payout}
                    onChange={(e) => onInventoryPayoutChange(inventory.id, e.target.value)}/>
                </div>
              </div>
            </div>
          )
        }
        <ul>
          <li><span className="label">Daily impressions:</span><span>{inventory.impressionsDaily || 0}</span></li>
          <li><span className="label">Average CPM:</span><span>{`${inventory.averageCpm || 0}`}</span></li>
          <li><span className="label">Traffic type:</span><span>{`${inventory.trafficType}`}</span></li>
          <li><span className="label">Ad type: </span><span>{inventory.adType}</span></li>
          <li><span className="label">Top 3 dimensions</span><span>{inventory.dimensions}</span></li>
          <li><span className="label">Top 10 countries: </span><span>{inventory.countries}</span></li>
        </ul>
      </div>
    </AccordionItemPanel>
  );
}
