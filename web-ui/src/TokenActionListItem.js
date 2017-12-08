import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import muiThemeable from 'material-ui/styles/muiThemeable';

const TokenActionListItem = (props) => (
  <ListItem key={props.key} disabled={props.disabled}
    leftIcon={props.leftIcon}
    primaryText={props.primaryText}
    style={{
      backgroundColor: props.muiTheme.palette.canvasColor,
      color: props.muiTheme.palette.textColor
    }}
  />
);

export default muiThemeable()(TokenActionListItem);
