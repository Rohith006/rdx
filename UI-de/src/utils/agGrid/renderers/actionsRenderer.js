import React from 'react';
import {SvgEdit} from '../../../components/common/Icons';

export default function(url, onEdit) {
  return (
    <div className="icon_cover">
      <span className="editor-control" onClick={() => onEdit}> <SvgEdit/></span>
    </div>);
}
