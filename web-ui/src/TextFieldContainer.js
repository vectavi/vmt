import React from 'react';
import RaisedButton         from 'material-ui/RaisedButton';
import TokenInfoTextField   from './TokenInfoTextField';
import muiThemeable from 'material-ui/styles/muiThemeable';

import
  { Table, TableBody, TableRow, TableRowColumn
  } from 'material-ui/Table';

const TextFieldContainer = (props) => (

  <div style={{
    margin: '0 5px 0 0',
    textAlign: 'center',
    borderTop: '1px',
    borderRight: '0',
    borderBottom: '1px',
    borderLeft: '0',
    borderStyle: 'solid',
    borderColor: props.muiTheme.tableRow.borderColor
  }}>
    <TokenInfoTextField hintText={props.txtHintText}
      value={props.txtValue}
      onChange={props.txtOnChange}
    />
    <RaisedButton
      secondary={props.btnSecondary}
      icon={props.btnIcon}
      label={props.btnLabel}
      style={props.btnStyle}
      onClick={props.btnOnClick}
      disabled={props.btnDisabled}
    />
  </div>
);

export default muiThemeable()(TextFieldContainer);
