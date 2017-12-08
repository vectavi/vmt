import React from 'react';
import Subheader from 'material-ui/Subheader';
import muiThemeable from 'material-ui/styles/muiThemeable';

const TokenActionSubheader = (props) => (
    <Subheader inset={props.inset}
      style={{
        backgroundColor: props.muiTheme.palette.canvasColor,
        color: props.muiTheme.palette.textColor
      }}
    >
      {props.children}
    </Subheader>
);

export default muiThemeable()(TokenActionSubheader);
