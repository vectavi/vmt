import React from 'react';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {green500} from 'material-ui/styles/colors';

const TokenAddressTextField = (props) => (
  <TextField
    hintText="Token address"
    fullWidth={true}
    disabled={true}
    inputStyle={{
      textAlign: 'center',
      fontSize: '20px',
      backgroundColor: props.muiTheme.palette.canvasColor,
      color: props.muiTheme.palette.disabledColor
    }}
    errorStyle={props.tokenMsg && props.tokenMsg.ok
      ? {
          backgroundColor: props.muiTheme.palette.canvasColor,
          padding: '0 0 10px 10px',
          color: green500
        }
      : {
          backgroundColor: props.muiTheme.palette.canvasColor,
          padding: '10px 10px'
        }
    }
    errorText={props.tokenMsg && props.tokenMsg.text}
    value={props.tokenAddress}
  />
);

export default muiThemeable()(TokenAddressTextField);
