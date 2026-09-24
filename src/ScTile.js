import React, { Component } from 'react'
import { Platform, StyleSheet, View, TouchableOpacity, Switch } from 'react-native';
import { GCText } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { PrjSpacer } from 'DWcmn/Prj'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { CstAddressInputTouchable } from './CstAddressInputTouchable'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { prjStopType } from 'DWcmn/prjStopFunctions'
import { prjStopLobbyFlagReadable } from 'DWcmn/prjStopFunctions'
import { PrjButtonWithConfirm } from 'DWcmn/PrjButtonWithConfirm'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { PrjIconButton } from 'DWcmn/Prj'
import { PrjIcon, prjIconEditableBox } from 'DWcmn/PrjIconComponents'

//20250629 added shop and implemented lobbyAccess and unattended flags


//ScTile allows the user to edit home and add/delete/edit alt stop
//save or cancel is done only on exit
//prop stop
//prop shop (currently used only in checkout mode)
//prop checkoutMode or profileHomeMode or profileAlternateMode or initialMode (one only pls)
//prop onChange(changedFields)
//  we inform parent when a change has been made and give the fields BUT we do change the stops that
//  we were given so probably no action required
//prop onCodeSelect()
//  called when the user change the stop code(type)
//  necessary only for Modes which allow this action (certainly not profileHomeMode)

export class ScTile extends Component {


   constructor() {
      super();
      this.state = {
         toggle: false
      };
      this.disableCodeEdit = false
      this.disableAddressEdit = false
      this.disableUnitEdit = false
      this.disableInstructionEdit = false
      this.disableUnattendedFlagEdit = false
      this.disableLobbyFlagEdit = true
      this.showCode = true
      this.showAddress = true
      this.showUnit = true
      this.showInstruction = true
      this.showUnattendedFlag = false
      this.showLobbyFlag = false
      this.showRemoveButton = false //only for alternate that is defined
   }


   //NOTE we do not expect to be called if profileAlternateMode and a building service
   render() {

      let stop = this.props.stop
      let shop = this.props.shop

      //by default everything is edittable except the lobby flag
      this.disableCodeEdit = false
      this.disableAddressEdit = false
      this.disableUnitEdit = false
      this.disableInstructionEdit = false
      this.disableLobbyFlagEdit = true
      this.disableUnattendedFlagEdit = false
      //by default everything is displayed except the lobby flag and the remove (alternte) button
      this.showCode = true
      this.showAddress = true
      this.showUnit = true
      this.showInstruction = true
      this.showLobbyFlag = false
      this.showUnattendedFlag = true
      this.showRemoveButton = false //only for alternate that is defined

      if (this.props.checkoutMode) {
         this.disableInstructionEdit = false //can always add/edit instructions
         //for custom they must enter address and may enter unit
         if (prjStopType(stop) == 'custom') {
            //everything remains edittable
         }
         //if 'building' you can't change the stop code .. by definition we are the address of the building service
         else if (prjStopType(stop) == 'building') {
            this.disableCodeEdit = true
            this.showAddress = false
            this.disableAddressEdit = true
            this.showUnit = false; this.disableUnitEdit = true
            //REMEBER this is the only time we display lobby/unit choice .. checkout for building
            this.setParcelFlags(shop, stop)
            // this.showLobbyFlag = true
            // this.disableLobbyFlagEdit = false
         }
         else { //could be home or alternate .. can't change address or unit
            this.disableAddressEdit = true
            this.disableUnitEdit = true
         }

      }
      else if (this.props.profileHomeMode) {
         this.disableCodeEdit = true //can't change in profile home mode
         if (prjStopType(stop) == 'home') {
         }
         //if 'building' you can't change the stop code .. by definition we are the address of the building service
         else if (prjStopType(stop) == 'building') {
            this.showAddress = false
            this.disableAddressEdit = true
            this.disableUnitEdit = false
         }
         else if (stop.code == 'alternate') {
            cmnAlertPopup({ title: 'Invalid code alternate in profileHome' })
            return null
         }
         else {
            cmnAlertPopup({ title: 'Invalid code ' + stop.code + ' in profileHome' }) //TESTED
            return null
         }

      }
      else if (this.props.profileAlternateMode) { //profileAlternateMode
         //we expect only  'alternate' code NOTE stop.code can be null
         if ((prjStopType(stop) == 'alternate')) {
            this.showRemoveButton = true
         }
         if (!prjStopType(stop)) { // no alternate stop exists
            this.showCode = true
            this.showAddress = false
            this.showUnit = false
            this.showInstruction = false
            this.disableCodeEdit = false
            this.disableAddressEdit = true
            this.disableUnitEdit = true
            this.disableInstructionEdit = true
         }
         else if (prjStopType(stop) == 'alternate') {
            //without an address hide (and disable) unit and instruction
            if (!Boolean(stop.address)) {
               this.showUnit = false
               this.showInstruction = false
               this.disableUnitEdit = true
               this.disableInstructionEdit = true

            }
            else {
               //there is an address .. everything is displayed (the default)
               //disable change on the code (alternate) but display the Remove button
               this.disableAddressEdit = false
               this.disableUnitEdit = false
               this.disableInstructionEdit = false
            }
            //disable change on the code (alternate) but display the Remove button
            this.disableCodeEdit = true; this.showRemoveButton = true
         }
      }
      else if (this.props.initialMode) {
         //never display the code ... we are always dealing with home stop coded home or building
         this.showCode = false; this.disableCodeEdit = true
         this.disableInstructionEdit = false //can always add/edit instructions
         //if 'building' you can't change the stop code .. by definition we are the address of the building service
         if (prjStopType(stop) == 'building') {
            this.disableAddressEdit = true
         }
         else { //home
         }
      }
      else {
         cmnAlertPopup({ title: 'Invalid code in profileAlternate' }) //TESTED
         return null
      }
      //the following rules apply to all situations
      if (!Boolean(stop?.address)) {
         this.showUnit = false
         this.showInstruction = false
      }



      // following superceded by setting show flags
      // //If we don't have an address yet, then we will not display other fields (unit, instructions etc)
      // let weHaveAnAddress = Boolean(stop?.address)
      //TODO make touchable area larger like specialEditBox
      return (
         <View style={styles.tile}>

            {(this.showCode) && this.renderCodeLine(stop)}

            {(this.showAddress) && <View>
               {this.renderSpacedLine()}
               <View style={styles.flexRow}>
                  <GCText tile bold  >{"Address  "}</GCText>
                  {!this.disableAddressEdit && <CstAddressInputTouchable
                     titleI18n='cmnNEW.YourAddress'
                     address={stop.address}
                     location={stop.location}
                     onSelect={(address, location) => {
                        stop.address = address
                        stop.location = { ...location } //TODO  check
                        this.props.onChange({ 'address': address, 'location': location })
                     }}
                     onCancel={{}}
                  //no onDelete
                  >
                     {prjIconEditableBox()}

                  </CstAddressInputTouchable>}
               </View>
               <PrjSpacer size={5} />
               <GCText>{stop.address}</GCText>
            </View>}

            {this.showUnit && <View>
               {this.renderSpacedLine()}
               <View style={styles.flexRow}>
                  <GCText tile bold >{"Unit  "}</GCText>
                  {(!this.disableUnitEdit) && <CmnTouchableEdit
                     titleI18n='cmnNEW.YourUnit'
                     initial={stop.unit}
                     specialEditBox
                     onOkay={(value) => {
                        stop.unit = value
                        this.props.onChange({ 'unit': stop.unit })
                     }}
                     onCancel={() => { }}
                  // onDelete={() => { }}
                  >
                     {prjIconEditableBox()}

                  </CmnTouchableEdit>
                  }
               </View>
               <PrjSpacer size={5} />
               <GCText light>{stop.unit}</GCText>
            </View>}

            {/* Enter Pickup in Lobby/Unit */}
            <PrjSpacer size={5} />
            {this.showLobbyFlag &&
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <GCText light>{prjStopLobbyFlagReadable(stop)}</GCText>
                  <View style={{ width: 10 }} />
                  {this.disableLobbyFlagEdit || <Switch
                     trackColor={{ false: COLORS.GC_SWITCH_LIGHT_BLUE, true: COLORS.GC_SWITCH_LIGHT_BLUE }} //lighter t
                     thumbColor={stop.lobbyFlag ? COLORS.GC_THEME_DARK : COLORS.GC_ABS_WHITE}
                     ios_backgroundColor={COLORS.GC_SWITCH_LIGHT_BLUE}
                     onValueChange={(val) => {
                        stop.lobbyFlag = !stop.lobbyFlag; this.toggle()
                     }}
                     value={stop.lobbyFlag}
                     style={{ transform: Platform.OS === 'ios' ? [{ scaleX: .6 }, { scaleY: .6 }] : [{ scaleX: 1 }, { scaleY: 1 }] }}
                  />}
               </View>
            }

            {/* Can we leave unattended */}
            <PrjSpacer size={5} />
            {this.showUnattendedFlag &&
               <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <GCText light>Can we leave your order unattended?</GCText>
                  <View style={{ width: 10 }} />
                  <Switch
                     trackColor={{ false: COLORS.GC_SWITCH_LIGHT_BLUE, true: COLORS.GC_SWITCH_LIGHT_BLUE }} //lighter t
                     thumbColor={stop.allowUnattended ? COLORS.GC_THEME_DARK : COLORS.GC_ABS_WHITE}
                     ios_backgroundColor={COLORS.GC_SWITCH_LIGHT_BLUE}
                     onValueChange={(val) => {
                        stop.allowUnattended = !stop?.allowUnattended; this.toggle()
                     }}
                     value={stop?.allowUnattended}
                     style={{ transform: Platform.OS === 'ios' ? [{ scaleX: .6 }, { scaleY: .6 }] : [{ scaleX: 1 }, { scaleY: 1 }] }}
                     disabled={this.disableUnattendedFlagEdit}
                  />
               </View>

            }
            {this.showInstruction && <View>
               {this.renderSpacedLine()}
               <PrjSpacer size={5} />
               <View style={styles.flexRow}>
                  <GCText tile bold>{"Driver Instruction  "}</GCText>
                  {(!this.disableInstructionEdit) && <CmnTouchableEdit
                     specialEditBox
                     titleI18n='cmnNEW.DriverInstructions'
                     initial={stop.instruction}
                     onOkay={(value) => {
                        stop.instruction = value
                        this.props.onChange({ 'instruction': stop.instruction })
                     }}
                     onCancel={() => { }}
                  // onDelete={() => { }}//NO DELETE
                  >
                     {prjIconEditableBox()}
                  </CmnTouchableEdit>}
               </View>
               <PrjSpacer size={5} />
               <GCText light >{stop.instruction}</GCText>
            </View>
            }
         </View>
      )
   }//end render
   //TODO replace EDITABLE BOX with method
   renderCodeLine = (stop) => {
      return (
         <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <GCText fit large bold  >{this.getTitleFromCode(stop)}</GCText>
               <PrjSpacer size={5} />
               {(!this.disableCodeEdit) && <TouchableOpacity
                  specialEditBox
                  disabled={this.disableCodeEdit}
                  onPress={() => {
                     this.props.onCodeSelect()
                  }}>
                  <PrjIcon
                     style={{ fontSize: 18 }}
                     id='EDITABLE_BOX'
                     onPress={{}}
                  >
                  </PrjIcon>

               </TouchableOpacity>}
               {(this.showRemoveButton) && <PrjButtonWithConfirm
                  icon="DELETE"
                  buttonStyle={[PRJ_STYLES.headerIcon, this.props.iconStyle]}
                  confirmI18n={"cmnNEW.DeleteYourAlternateAddress"}
                  onConfirm={() => {
                     this.props.onCodeSelect()
                  }}
               />}
            </View>
            {/* {this.showRemoveButton && <PrjButtonWithConfirm
               text='remove'
               onCancel={() => { }}
               onConfirm={() => {
                  this.props.onCodeSelect()
               }}
            />} */}
         </>
      )
   }

   setParcelFlags = (shop, stop) => {

      if (shop.allowLobbyAccess) { //we have lobby facilities to pickup or leave items

         if (shop.allowUnitAccess) { //we can go to the unit
            this.showLobbyFlag = true; this.disableLobbyFlagEdit = false
            this.showUnattendedFlag = true; this.disableUnattendedFlagEdit = false
         } else { //can't go to the unit
            this.showLobbyFlag = true; this.disableLobbyFlagEdit = true
            shop.lobbyFlag = true
            this.showUnattendedFlag = true; this.disableUnattendedFlagEdit = false

         }

      } else { //no lobby facilities available

         if (shop.allowUnitAccess) { //we can go to the unit

            this.showLobbyFlag = true; this.disableLobbyFlagEdit = false

            if (stop.lobbyFlag) { //lobby .. no unattended allowed
               this.showUnattendedFlag = false; this.disableUnattendedFlagEdit = true
               stop.allowUnattended = false
            } else { //unit
               this.showUnattendedFlag = true; this.disableUnattendedFlagEdit = false
            }

         } else { //can't go to the unit .. we have lobby attended
            this.showLobbyFlag = true; this.disableLobbyFlagEdit = true
            shop.lobbyFlag = true
            this.showUnattendedFlag = false; this.disableUnattendedFlagEdit = true
            stop.allowUnattended = false

         }

      }

   }

   renderSpacedLine = () => {
      return (
         <>
            <PrjSpacer size={5} />
            <View style={styles.horizontalLine} />
            <PrjSpacer size={5} />
         </>
      )
   }

   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 

   getTitleFromCode = (stop) => {
      switch (stop.code) {
         case null: return ('ADD ALTERNATE ADDRESS?')
         case 'building': return (stop.buildingName || "BUILDING SERVICE")
         case 'home': return ('HOME')
         case 'alternate': return ('ALTERNATE ADDRESS')
         case 'custom': return ('CUSTOM ADDRESS')
         default: return ('ERROR ADDRESS')
      }
   }
   //    if (!Boolean(stop.code)) {
   //       return ('Add Alternate?')
   //    }
   //    // 20250510 return building name if stop is a building 
   //    else if (prjStopType(stop) == 'building') {
   //       //TODO return short name of the building...maybe we want to return stop name "Lily @Residence 1 @Tiara"
   //       let dummy = 'Residence 1 @Tiara'
   //       return (dummy.toUpperCase())
   //    }
   //    else {
   //       return stop.code
   //    }
   // } //

}//end ScTile

const styles = StyleSheet.create({
   tile: {
      flexDirection: 'column',
      alignSelf: 'center',
      justifyContent: 'center',
      // justifyContent: 'space-between',
      width: '100%',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      marginBottom: 10,
      borderColor: COLORS.GC_TILE_BORDER,
      borderWidth: 1.5,
      // backgroundColor: COLORS.GC_TILE_BK
      backgroundColor: COLORS.GC_ABS_WHITE

   },
   flexColumn: {
      flexDirection: 'column',
      alignItems: 'flex-start'
   },
   flexRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   horizontalLine: {
      borderBottomColor: COLORS.GC_HORIZONTAL_LINE,
      borderBottomWidth: 0.5,
      width: '100%',
   },
});
