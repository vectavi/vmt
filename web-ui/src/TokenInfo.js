import React                from 'react';
import TextField            from 'material-ui/TextField';
import RandomIcon           from 'material-ui/svg-icons/places/ac-unit';

import
  { Table, TableBody, TableRow, TableRowColumn
  } from 'material-ui/Table';

import TextFieldContainer   from './TextFieldContainer';
import TokenPhaseText       from './TokenPhaseText';

export default class TokenInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      etherVal: '',
      refundAccount: props.refundAccount,
      migrateAccount: props.migrateAccount
    };
  }


  _etherValChanged = ev => this.setState({
    etherVal: ev.target.value.replace(/[^\.0-9]/g, '')
  });

  _validateRefundAccount = ev => this.setState({
    refundAccount: ev.target.value.replace(/[^xX\.0-9A-Fa-f]/g, '')
  });

  _validateMigrateAccount = ev => this.setState({
    migrateAccount: ev.target.value.replace(/[^xX\.0-9A-Fa-f]/g, '')
  });

  _buyTokens = () => this.props.onBuyTokens(this.state.etherVal);
  _claimRefund = () => this.props.onClaimRefund(this.state.refundAccount);
  _migrateToken = () => this.props.onMigrateToken(this.state.migrateAccount);


  render() {
    const {info} = this.props;

    const row = (name, value) => (
      <TableRow>
        <TableRowColumn>{name}</TableRowColumn>
        <TableRowColumn>{value}</TableRowColumn>
      </TableRow>
    );

    const buttonStyle = {
      marginLeft: '5em'
    };

    const phaseBlock =
      [ <p><b>ICO sale is not yet started.</b> Please check this page later.</p>
      , <div>
          <TokenPhaseText
            boldText={'ICO sale is in progress.'}
            normalText={' You can buy some tokens here.'}
          />
          <TextFieldContainer txtHintText="Value in Ether"
              txtValue={this.state.etherVal}
              txtOnChange={this._etherValChanged}
              btnSecondary={true}
              btnIcon={<RandomIcon/>}
              btnLabel="Buy tokens"
              btnStyle={{margin: '12px'}}
              btnOnClick={this._buyTokens}
              btnDisabled={this.state.isReadOnly || !this.state.etherVal}
          />
          <TextFieldContainer txtHintText="Migrate Address"
              txtValue={this.state.migrateAccount}
              txtOnChange={this._validateMigrateAccount}
              btnSecondary={true}
              btnIcon={<RandomIcon/>}
              btnLabel="Migrate Presale Tokens"
              btnStyle={{margin: '12px'}}
              btnOnClick={this._migrateToken}
              btnDisabled={this.state.isReadOnly || !this.state.migrateAccount}
          />
        </div>
      , <TokenPhaseText
          boldText={'ICO sale is paused.'}
          normalText={' Please come back later.'}
        />
      , <TokenPhaseText
          boldText={'ICO sale is over.'}
          normalText={' Please come back later, token is finalizing.'}
        />
      , <div>
          <TokenPhaseText
            boldText={'ICO sale is over.'}
            normalText={' Goal not met, you can now claim your refund.'}
          />
          <TextFieldContainer txtHintText="Refund Account"
              txtValue={this.state.refundAccount}
              txtOnChange={this._validateRefundAccount}
              btnSecondary={true}
              btnIcon={<RandomIcon/>}
              btnLabel="Claim Refund"
              btnStyle={{margin: '12px'}}
              btnOnClick={this._claimRefund}
              btnDisabled={this.state.isReadOnly || !this.state.refundAccount}
          />
        </div>
      , <TokenPhaseText
          boldText={'ICO sale is over.'}
          normalText={' Goal was met, thank you for your support.'}
        />
      , <TokenPhaseText
          boldText={'ICO sale is over.'}
          normalText={' You can now migrate your tokens.'}
        />
      , <TokenPhaseText
          boldText={'ICO sale is over.'}
          normalText={' Migration is over too.'}
        />
      ];

    return (
      <div>
        <Table selectable={false}>
          <TableBody displayRowCheckbox={false}>
            {row("Name", info.name)}
            {row("Symbol", info.symbol)}
            {row("Price", `${info.price} ${info.symbol} per 1 ETH`)}
            {row("Tokens sold", `${info.supply} ${info.symbol}`)}
            {row("Current balance", `${info.balance} ETH`)}
          </TableBody>
        </Table>
        { phaseBlock[info.currentPhase] }
      </div>
    );
  }
}
