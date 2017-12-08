import React                from 'react';
import TextField            from 'material-ui/TextField';
import RaisedButton         from 'material-ui/RaisedButton';
import List                 from 'material-ui/List/List';
import ListItem             from 'material-ui/List/ListItem';
import Subheader            from 'material-ui/Subheader';

import IconPerson           from 'material-ui/svg-icons/social/person';
import IconMoney            from 'material-ui/svg-icons/editor/attach-money';
import IconMoneyOff         from 'material-ui/svg-icons/editor/money-off';
import IconBusiness         from 'material-ui/svg-icons/places/business-center';
import IconBlur             from 'material-ui/svg-icons/image/blur-on';
import IconSync             from 'material-ui/svg-icons/notification/sync';
import IconCheck            from 'material-ui/svg-icons/navigation/check';
import {green500, yellow500, grey500} from 'material-ui/styles/colors';
import muiThemeable from 'material-ui/styles/muiThemeable';

import
  { Table, TableBody, TableRow, TableRowColumn
  } from 'material-ui/Table';

import TokenActionTextField from './TokenActionTextField';
import TokenActionListItem from './TokenActionListItem';
import TokenActionSubheader from './TokenActionSubheader';
import TokenActionActionListItem from './TokenActionActionListItem';
import Phase from './phase';


export default muiThemeable()(function(props) {
  const {info, tokenMsg, defaultAccount, migrationManager, isReadOnly} = props;

  const row = (name, value) => (
    <TableRow>
      <TableRowColumn style={{width: '35%'}}>{name}</TableRowColumn>
      <TableRowColumn>{value}</TableRowColumn>
    </TableRow>
  );

  const managerIcon = addr =>
    <IconPerson
      color={addr === defaultAccount ? yellow500 : grey500}
    />;

  const isManager = info.tokenManager.managers.includes(defaultAccount);

  const buttonStyle = {
    marginLeft: '5em'
  };
  const button = (icon, label, action, active=true) =>
    <RaisedButton secondary={true}
      icon={icon}
      label={label}
      onTouchTap={action}
      disabled={props.isReadOnly && !active}
      style={buttonStyle}
    />;

  const textFieldContainerStyle = {
    textAlign: 'center',
    borderTop: '1px',
    borderRight: '0',
    borderBottom: '1px',
    borderLeft: '0',
    borderStyle: 'solid',
    borderColor: props.muiTheme.tableRow.borderColor
  }

  const action = (text1, text2, icon, act) =>
    <TokenActionActionListItem insetChildren={true}
      primaryText={text1}
      secondaryText={text2}
      primaryTogglesNestedList={true}
      leftIcon={icon}
      nestedItems={[
        <ListItem key={0} disabled={true} insetChildren={false} style={{padding: '0'}}>
          {act}
        </ListItem>
      ]}
    />;

  const validateMigrationManagerAddress = ev => {
    ev.target.value.replace(/[^xX\.0-9A-Fa-f]/g, '');
    props.onMigrationManagerChanged(ev.target.value);
  }

  const PhaseStr = {};
  Object.keys(Phase).forEach(k => PhaseStr[Phase[k]] = k);

  return (
    <div className="Actions">
    { !props.isReadOnly &&
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          {row("Multisig address", info.tokenManager.address)}
          {row("Multisig balance", `${info.tokenManager.balance} ETH`)}
          {row("Migration Manager address", info.migrationManager.address)}
        </TableBody>
      </Table>
    }
      <List style={{margin: '5px 0', padding:0}}>
        <TokenActionSubheader inset={true} children={"ICO sale managers"}/>
        { !props.isReadOnly && info.tokenManager.managers.map((man, i) =>
          <TokenActionListItem key={i} disabled={true}
            leftIcon={managerIcon(man)}
            primaryText={man}
          />
        )}
        { !props.isReadOnly && info.tokenManager.pendingActions.length > 0 &&
          <div>
            <TokenActionSubheader inset={true} children={"Pending actions"}/>
            {info.tokenManager.pendingActions.map((act, i) =>
              <ListItem key={i}
                insetChildren={true}
                primaryTogglesNestedList={true}
                primaryText={act.name}
                secondaryText={`Confirmed by ${act.confirmations.length} manager(s)`}
                nestedItems={
                  act.confirmations.map((man, i) =>
                    <ListItem key={i} disabled={true}
                      leftIcon={managerIcon(man)}
                      primaryText={man}
                    />
                  ).concat(
                    <ListItem key={-1} disabled={true} insetChildren={true}>
                      {!act.confirmations.includes(defaultAccount) &&
                        button(<IconCheck/>, "Confirm", () => props.onConfirmTx(act.txId))}
                    </ListItem>
                  )
                }
              />
            )}
          </div>
        }

        { !isManager &&
          <ListItem disabled={true}
            primaryText="You have no power here"
            secondaryText="Only ICO sale managers can execute actions."
          />
        }

        { isManager &&
          <div>
            <TokenActionSubheader inset={true} children={"Available actions"}/>
            { info.currentPhase === Phase['Created'] &&
              action(
                "Start ICO sale",
                "ICO sale is not running. Investors can't buy tokens yet.",
                <IconMoney/>,
                button(<IconMoney/>, "Start ICO sale", () => props.onSetPhase(Phase['Running'])))
            }
            { info.currentPhase === Phase['Running'] &&
              action(
                "Pause ICO sale",
                "You can pause ICO sale to prevent investors from buying tokens.",
                <IconMoneyOff/>,
                button(<IconMoneyOff/>, "Pause ICO sale", () => props.onSetPhase(Phase['Paused'])))
            }
            { info.currentPhase === Phase['Paused'] &&
              action(
                "Resume ICO sale",
                "ICO sale is paused. Investors can't buy tokens until you resume it.",
                <IconMoney/>,
                button(<IconMoney/>, "Resume ICO sale", () => props.onSetPhase(Phase['Running'])))
            }
            { (info.currentPhase === Phase['Running'] || info.currentPhase === Phase['Paused']) &&
              action(
                "Finalize ICO sale",
                "You can end ICO sale and switch to finalized if goal is met, refunding otherwise.",
                <IconMoneyOff/>,
                button(<IconMoneyOff/>, "Finalize ICO sale", () => props.onSetPhase(Phase['Finalizing'])))
            }
            { info.balance > 0 && false && // withdrawEther depletes refundVault that will cause claimRefund to fail
              action(
                "Withdraw funds to escrow account",
                "There are some Ether on ICO sale contract.",
                <IconBusiness/>,
                button(<IconBusiness/>, "Withdraw ether", props.onWithdraw))
            }
            { info.currentPhase < Phase['Migrating'] &&
              action(
                "Set migration manager address",
                "Must set before token migration to enable tokens migration/convertion.",
                <IconBlur/>,
                <div className="set-cs-addr" style={textFieldContainerStyle}>
                  <TokenActionTextField
                    tokenMsg={props.tokenMsg}
                    hintText="Migration Manager Address"
                    value={migrationManager}
                    onChange={validateMigrationManagerAddress}
                  />

                  { button(<IconBlur/>, "Set address", () => props.onSetMigrationManager(migrationManager), migrationManager) }
                </div>
              )
            }
            { info.currentPhase === Phase['Finalized'] &&
              info.migrationManager.address !== "0x0000000000000000000000000000000000000000" &&
              action(
                "Start token migration",
                "Token migration is controlled by migration manager.",
                <IconSync/>,
                button(<IconBlur/>, "Start migration", () => props.onSetPhase(Phase['Migrating'])))
            }
          </div>
        }
      </List>
    </div>
  );
})
