import React                from 'react';
import lightBaseTheme       from 'material-ui/styles/baseThemes/lightBaseTheme';
import darkBaseTheme        from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme          from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider     from 'material-ui/styles/MuiThemeProvider';
import CircularProgress     from 'material-ui/CircularProgress';
import {Tabs, Tab}          from 'material-ui/Tabs';
import TextField            from 'material-ui/TextField';
import Dialog               from 'material-ui/Dialog';
import FlatButton           from 'material-ui/FlatButton';
import {green500}           from 'material-ui/styles/colors';

import Web3 from 'web3';
import PROVIDER_URL         from './provider';
import API                  from './tokenAPI';
import TokenInfo            from './TokenInfo';
import TokenEvents          from './TokenEvents';
import TokenActions         from './TokenActions';
import TokenAppBar          from './TokenAppBar';
import TokenAddressTextField from './TokenAddressTextField'
import muiThemeable         from 'material-ui/styles/muiThemeable';
import './App.css';

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  var web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
}

const _isReadOnly = !(PROVIDER_URL && /localhost/gi.test(PROVIDER_URL));
//console.log('PROVIDER_URL: ', PROVIDER_URL, ', _isReadOnly: ',_isReadOnly);

Object.values = (obj) => Object.keys(obj).map(key => obj[key]);

export default muiThemeable()(class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tokenAddress: '',
      tokenMsg: null,
      tokenInfo: null,
      tokenEvents: null,
      defaultAccount: null,
      isDialogOpen: false,
      migrationManager: '',
      networkName: null,
      spin: false,
      theme: "dark",
      muiTheme: darkBaseTheme,
      isReadOnly: _isReadOnly
    };
  }

  _trackAccountInterval = null;

  componentDidMount() {
    if(!web3) return;
    API.checkNetwork().then(res => {
      this.setState(
        { tokenAddress: res.tokenAddress,
          tokenMsg: {text: res.networkName, ok: true},
          networkName: res.networkName,
          spin: true
        },
        this._loadTokenInfo
      )

      if (!this.state.isReadOnly) {
        // track account changes
        this._trackAccountInterval = setInterval(() => {
          if (web3.eth.accounts[0] !== this.state.defaultAccount) {
            web3.eth.defaultAccount = web3.eth.accounts[0];
            this.setState({defaultAccount: web3.eth.accounts[0]});
          }
        }, 600);
      }
    })
    .catch(err => {
      this._setErrorState(err)
    })
  }


  componentWillUnmount() {
    if (!this.state.isReadOnly) {
      clearInterval(this._trackAccountInterval);
    }
  }


  _setErrorState = err => {
    //console.log('ERROR', err.toString());
    this.setState({spin: false})
    this.setState({tokenMsg: {text: "Unexpected error, sorry"}})
    if(err.INVALID_TOKEN_ADDRESS) {
      this.setState({tokenMsg: {text: "Invalid address format"}})
    } else if(err.INVALID_TOKEN_NAME) {
      this.setState({tokenMsg: {text: "Unexpected token name"}})
    } else if(err.message) {
      this.setState({tokenMsg: {text: "Unexpected error, "+err.message}})
    }
  }

  _loadTokenInfo = () =>
    API.getTokenInfo(this.state.tokenAddress)
      .then(tokenInfo => this.setState({
        tokenInfo,
        defaultAccount: this.state.isReadOnly ? '' : web3.eth.accounts[0],
        spin: false
      }))
      .catch(err => {
        this._setErrorState(err)
      })


  _changeTab = tab => {
    switch(tab.props.value) {
      case "events": {
        this.setState({tokenEvents: null})
        API.getTokenEvents(this.state.tokenInfo.tokenManager.address)
          .then(tokenEvents => this.setState({tokenEvents}))
          .catch(err => {
            this._setErrorState(err)
          })
        break;
      }
      default: break;
    }
  }

  _closeDialog = () => this.setState({isDialogOpen: false}, this._loadTokenInfo)

  _toggleTheme = () => {
    //console.log("_toggleTheme from theme ", this.state.theme)
    switch(this.state.theme) {
      case "light": {
        this.setState({muiTheme: darkBaseTheme})
        this.setState({theme: "dark"})
        break;
      }
      case "dark": {
        this.setState({muiTheme: lightBaseTheme})
        this.setState({theme: "light"})
        break;
      }
      default: break;
    }
  }


  _notifyTransaction = res => {
    const txUrl = "https://rinkeby.etherscan.io/tx/" + res.tx;
    this.setState({
      spin: false,
      isDialogOpen: true,
      dialogTitle: "Transaction submitted",
      dialogText: <p>
        You can see submitted transaction here <a href={txUrl}>here</a>.
        Please wait while it is mined and refresh the page.
      </p>
    })
  }


  _onActionSetPhase = newPhase => {
    const {tokenInfo} = this.state;
    this.setState({spin: true})
    API.setPhase(tokenInfo.address, newPhase, tokenInfo.tokenManager.address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }


  _onActionWithdraw = () => {
    const {tokenInfo} = this.state;
    this.setState({spin: true})
    API.withdrawEther(tokenInfo.address, tokenInfo.tokenManager.address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }

  _onActionConfirmTx = tx => {
    const {tokenInfo} = this.state;
    this.setState({spin: true})
    API.confirmTransaction(tx, tokenInfo.tokenManager.address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }


  _buyTokens = value => {
    this.setState({spin: true})
    API.buyTokens(this.state.tokenAddress, value)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }

  _claimRefund = address => {
    this.setState({spin: true})
    API.claimRefund(this.state.tokenAddress, address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }

  _migrateToken = address => {
    this.setState({spin: true})
    API.migrateToken(this.state.tokenAddress, address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }


  _migrationManagerChanged = address => this.setState({
    migrationManager: address
  });

  _onActionSetMigrationManager = address => {
    const {tokenInfo} = this.state;
    this.setState({spin: true})
    API.setMigrationManager(tokenInfo.address, address, tokenInfo.tokenManager.address)
      .then(this._notifyTransaction)
      .catch(err => {
        this._setErrorState(err)
      })
  }


  render() {
    if(!window.web3) {
      return <div className="App"><NoWeb3Notification/></div>;
    }

    const spinner = (
      <CircularProgress
         size={80} thickness={5}
         style={{display: 'block', margin: '20px auto'}}
      />);

    const state = this.state;

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(state.muiTheme)}>
        <div className="App"
          style={{
            backgroundColor: state.muiTheme.palette.canvasColor,
            color: state.muiTheme.palette.textColor
          }}
        >
          <TokenAppBar onToggleTheme={this._toggleTheme}/>
          <TokenAddressTextField
            tokenAddress={state.tokenAddress}
            tokenMsg={state.tokenMsg}
          />
          { // address is not validated yet
            this.state.spin
            ? <div>
              <p>Interacting with contract may at times be slow. Please be patient.</p>
              { spinner }
              </div>
            : <span></span>
          }
          { // address is not validated yet
            window.web3 && !this.state.tokenInfo && !this.state.tokenMsg && spinner
          }
          { this.state.tokenInfo &&
            <Tabs>
              <Tab label="Token Info" value="info">
                <TokenInfo
                    info={this.state.tokenInfo}
                    onBuyTokens={this._buyTokens}
                    onClaimRefund={this._claimRefund}
                    onMigrateToken={this._migrateToken}
                    refundAccount={this.state.defaultAccount}
                    migrateAccount={this.state.defaultAccount}
                />
              </Tab>
              <Tab label="Events" value="events" onActive={this._changeTab}>
                { this.state.tokenEvents
                    ? <TokenEvents events={this.state.tokenEvents}/>
                    : <div>
                      <p>Fetching events is quite a slow operation. Please sit back and relax.</p>
                      { spinner }
                      </div>
                }
              </Tab>
              <Tab label="Actions" value="actions">
                <TokenActions
                  info={this.state.tokenInfo}
                  defaultAccount={this.state.defaultAccount}
                  migrationManager={this.state.migrationManager}
                  isReadOnly={this.state.isReadOnly}
                  onSetPhase={this._onActionSetPhase}
                  onWithdraw={this._onActionWithdraw}
                  onConfirmTx={this._onActionConfirmTx}
                  onSetMigrationManager={this._onActionSetMigrationManager}
                  onMigrationManagerChanged={this._migrationManagerChanged}
                />
                { this.state.spin
                  ? <div>
                    <p>Interacting with contract may at times be slow. Please be patient.</p>
                    { spinner }
                    </div>
                  : <span></span>
                }
              </Tab>
            </Tabs>
          }
          <Dialog
            open={this.state.isDialogOpen}
            onRequestClose={this._closeDialog}
            title={this.state.dialogTitle}
            actions={[
              <FlatButton label="Close" primary={true} keyboardFocused={true}
                onTouchTap={this._closeDialog}
              />
            ]}
          >
           { this.state.dialogText }
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
})

const NoWeb3Notification = () =>
  <div>
    <p>
      No Ethereum network provider is detected.
      There are several ways to fix this:
    </p>
    <ul>
      <li>install <a href="https://metamask.io">MetaMask</a> browser plugin</li>
      <li>install <a href="https://github.com/ethcore/parity-extension">Parity</a> browser plugin</li>
      <li>open this page in <a href="https://github.com/ethereum/mist/releases">Mist</a> browser</li>
    </ul>
    <p>
      Find more info on this project on <a href="https://github.com/vectavi/vmt">github</a>.
    </p>
  </div>;
