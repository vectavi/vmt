import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import NavigationClose from 'material-ui/svg-icons/navigation/close';

/**
 * This example is taking advantage of the composability of the `AppBar`
 * to render different components depending on the application state.
 */
class TokenAppBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logged: true,
      valueSingle: '1'
    };
  }

  _handleChangeSingle = (event, value) => {
    var value = value || event.target.value;
    console.log("_handleChangeSingle: value = ", value);
    switch (value) {
      case "1":
        break;
      case "2":
        this._logout();
        break;
      default:
        break;
    }
    this.setState({
      valueSingle: value
    });
  };

  _login = () => {
    console.log("_login called");
    this.setState({logged: true});
  }

  _logout = () => {
    console.log("_logout called");
    this.setState({logged: false});
  }

  _toggleTheme = () => this.props.onToggleTheme();


  render() {
    return (
      <div>
        <AppBar
          title="Vectavi ICO Sale"
          iconElementLeft={
            <IconButton onClick={this._toggleTheme}>
              <span>
                <i className="material-icons">power_settings_new</i>
                </span>
            </IconButton>
          }
          /**
          iconElementRight={
            this.state.logged
              ? <IconMenu
                  iconButtonElement={
                    <IconButton><MoreVertIcon /></IconButton>
                  }
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                  onChange={this._handleChangeSingle}
                >
                  <MenuItem value="1" primaryText="Help"/>
                  <MenuItem value="2" primaryText="Sign out"/>
                </IconMenu>
              : <FlatButton label="Login" onClick={this._login}/>
          }
          */
        />
      </div>
    );
  }
}

export default TokenAppBar;
