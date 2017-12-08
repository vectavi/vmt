import React from 'react';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';

const TokenPhaseText = (props) => (
    <p
      style={{
        margin: '5px 0',
        padding: '10px',
        backgroundColor: props.muiTheme.palette.canvasColor,
        color: props.muiTheme.palette.textColor
      }}
    ><b>{props.boldText}</b>{props.normalText}</p>
);

export default muiThemeable()(TokenPhaseText);
