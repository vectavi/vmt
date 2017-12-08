import React from 'react';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {green500} from 'material-ui/styles/colors';

const TokenInfoTextField = (props) => (
  <TextField
    style={{
      width: '50%',
    }}
    value={props.value}
    floatingLabelText={props.hintText}
    floatingLabelStyle={{
      paddingLeft: '10px',
      top: '28px'
    }}
    floatingLabelShrinkStyle={{
      transform: 'scale(0.75) translate(0, -28px)',
      pointerEvents: 'none'
    }}
    inputStyle={{
      width: '26em',
      textAlign: 'center',
      fontSize: '12px',
      margin: '0 5px 0 0',
      paddingLeft: '10px',
      backgroundColor: props.muiTheme.palette.canvasColor,
      color: props.muiTheme.palette.textColor
    }}
    underlineStyle={{width: '0'}}
    underlineFocusStyle={{width: '19.5em'}}
    errorStyle={props.tokenMsg && props.tokenMsg.ok
      ? {
          backgroundColor: props.muiTheme.palette.canvasColor,
          color: green500
        }
      : {
          backgroundColor: props.muiTheme.palette.canvasColor
        }
    }
    errorText={props.tokenMsg && props.tokenMsg.text}
    onChange={props.onChange}
  />
);

export default muiThemeable()(TokenInfoTextField);
