import React from 'react';
import ListItem from 'material-ui/List/ListItem';
import muiThemeable from 'material-ui/styles/muiThemeable';

const TokenActionActionListItem = (props) => (
  <ListItem insetChildren={props.insetChildren}
    primaryText={props.primaryText}
    secondaryText={props.secondaryText}
    primaryTogglesNestedList={props.primaryTogglesNestedList}
    leftIcon={props.leftIcon}
    nestedItems={[
      <ListItem key={0} disabled={true} insetChildren={false} style={{padding: '0'}}>
        {props.nestedItems}
      </ListItem>
    ]}
    nestedListStyle={{padding: '5px 0 0 0'}}
    style={{
      margin: '5px 0 0 0',
      padding: '10px',
      backgroundColor: props.muiTheme.palette.canvasColor,
      color: props.muiTheme.palette.textColor
    }}
    />
);

export default muiThemeable()(TokenActionActionListItem);
