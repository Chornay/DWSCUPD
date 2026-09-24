import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import cloneDeep from 'lodash/cloneDeep'

import { ListItem } from 'native-base';
import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global'
import Modal from "react-native-modal";
import { strX } from 'DWcmn/I18n'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { GCI18n, GCText } from 'DWcmn/Gc'
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { ScTile } from './ScTile'
import { CST } from './CST'

import { prjStopInitialize, prjStopUpdate } from 'DWcmn/prjStopFunctions'
import { CstScreen } from './CdsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window') || {};
const { height: SCREEN_HEIGHT } = Dimensions.get('window') || {};

//20240916 created
//20240922 change usePickup processing .. now store code from pickup in destination
//         and remove highlighting from stop code choice (don't highlight current choice)


//CstCheckoutStop will display its children inside a TouchableOpacity
//when it will display a modal to select from a list of stops
//which may cause a sequential modal to enter a custom address
//THIS IS USED WHEN PLACING AN ORDER
//prop shop .. the shop record identifying the valid area
//prop stop .. the starting stop
//prop pickupStop .. specified iff this is a delivery stop
//prop titleI18n
//prop onChange()
//prop onCustom()
export class CstCheckoutStop extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isSelectModalActive: false, // true iff modal to select address type
         isComponentInitialized: false,
      };
   }
   componentDidMount() {
      // console.log('selection mount init stop', this.props.initStop)
      this.setState({ isComponentInitialized: true })
   }

   //check if we still need onChange
   render() {
      let stop = this.props.stop
      return (
         <View style={{}}>
            <ScTile stop={stop}
               checkoutMode
               shop = {this.props.shop}
               onChange={async (fields) => {
                  stop = { ...stop, ...fields }; //TODO check is this right?
                  this.props.onChange()
                  // this.changes = true
                  // this.toggle()
               }}
               onCodeSelect={() => {
                  // stop = { code: 'custom' }
                  this.setState({ isSelectModalActive: true })
                  // this.props.onChange()
               }}
               onRemove={() => {
                  console.log('checkout stop remove')
                  this.setState({ isSelectModalActive: true })
                  this.props.onChange()

               }}
            />
            {this.state.isSelectModalActive &&
               <SelectionModal
                  stop={stop}
                  pickupStop={this.props.pickupStop} //only iff this is a delivery
                  titleI18n={this.props.titleI18n}
                  onOkay={(stop) => {
                     this.setState({ isSelectModalActive: false });
                     this.props.onChange(stop)
                  }}
                  onCustom={() => {
                     this.props.onCustom()
                     this.setState({ isSelectModalActive: false });
                  }}
                  onCancel={() => { this.setState({ isSelectModalActive: false }) }}
               ></SelectionModal>
            }

         </View >
      )
   }

}//end CstCheckoutStop

//prop stop (code,address,location,instructions)
//prop pickupStop iff this is a delivery stop
//prop titleI18n
//prop onCancel()
//prop onOkay(stop)
//prop onCustom()
//NOTE *********** got tired of playing with spread operator etc to copy the stop contents ....
//NOTE *********** we cannot change what the stop property points to .. so just do field by field.
class SelectionModal extends Component {

   constructor(props) {
      // console.log('selection constructor stop', this.props.stop)
      super(props);
      this.state = {
         isComponentInitialized: false,
      };
      this.cust = CST.getCust()
   }

   componentDidMount() {

      this.setState({ isComponentInitialized: true });
   }

   render() {

      if (!this.state.isComponentInitialized) return null
      let stop = this.props.stop
      let isDelivery = Boolean(this.props.pickupStop)

      return (

         <Modal
            isVisible={true}
         >
            {/* <View style={styles.selectionModal}> */}
            <View style={[PRJ_STYLES.modalNew, this.props.style]}>
               <View style={{ flex: 1 }}>
                  <View style={{ flex: 0, height: '20%', justifyContent: 'center', alignItems: 'center' }}>
                     <GCI18n title bold code={this.props.titleI18n} color={COLORS.GC_PULLUP_TITLE} />
                  </View>
                  <View style={{ flex: 0, flexGrow: 1 }}>
                     {isDelivery && this.renderChoiceNEW('usePickup', 'ARROW_UP_OUTLINE', 'cmnNEW.UsePickupAddress',
                        () => {
                           //Please note that usePickup is just an action. We move over the pickStop details and forget that we did it.
                           //Hmm. ie if you go back and change pickup stop when you proceed to delivery the details will not change.
                           //Not the best behaviour perhaps but it would seldom happen and it is consistent
                           prjStopUpdate(stop, this.props.pickupStop)
                           this.props.onOkay()
                        }
                     )}
                     {this.renderChoiceNEW('home', 'HOME', 'cmnNEW.UseHomeAddress',
                        () => {
                           prjStopUpdate(stop, this.cust.homeStop)
                           this.props.onOkay()
                        }
                     )}

                     {this.cust.altStop && this.cust.altStop.code &&
                        this.renderChoiceNEW('alternate', 'TWO', 'cmnNEW.UseAlternateAddress',
                           () => {
                              //offer the alternate address if customer has specified one
                              prjStopUpdate(stop, this.cust.altStop)
                              this.props.onOkay()
                           }
                        )}

                     {this.renderChoiceNEW('custom', 'NEW_FOLDER', 'cmnNEW.UseCustomAddress',
                        () => {
                           prjStopInitialize(stop)
                           stop.code = 'custom'
                           this.props.onCustom()
                        }
                     )}
                  </View>
                  <View style={{ flex: 0, paddingHorizontal: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}></View>
                  <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, alignItems: 'flex-end', paddingBottom: 10 }}>
                     <TouchableOpacity
                        onPress={() => { this.props.onCancel() }}>
                        <GCI18n bold code="cmn.CANCEL" color={COLORS.GC_PULLUP_CMD} />
                     </TouchableOpacity>
                  </View>
               </View>
            </View>

         </Modal >

      )
   }//render

   // renders a single line of an address choice
   // if it is the 'active' button it is highlighted (and disabled)
   //NOTE that the custom button is not disabled if active
   // because we can change a custom address to a different custom address
   renderChoiceNEW = (lineCode, iconId, i18n, onPress) => {
      return (
         <ListItem style={styles.choice}
            onPress={onPress}
         >
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
               <PrjIcon style={{ fontSize: 20, color: 'grey' }} id={iconId} />
               <GCText>    </GCText>
               <GCI18n detail style={{ color: 'grey' }} code={i18n} />
            </View>
         </ListItem>
      )
   }//end renderChoiceNEW

   // // renders a single line of an address choice
   // // if it is the 'active' button it is highlighted (and disabled)
   // //NOTE that the custom button is not disabled if active
   // // because we can change a custom address to a different custom address
   // renderChoice = (activeCode, lineCode, iconId, i18n, onPress) => {
   //     const isActive = lineCode == activeCode
   //     const style = isActive ? styles.choiceActive : styles.choice
   //     return (
   //         <ListItem style={style}
   //             onPress={onPress}
   //             disabled={isActive && activeCode != 'custom'}
   //         >
   //             <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
   //                 <PrjIcon style={{ fontSize: 20, color: 'grey' }} id={iconId} />
   //                 <GCText>    </GCText>
   //                 <GCI18n style={{ fontSize: 20, color: 'grey' }} code={i18n} />
   //             </View>
   //         </ListItem>
   //     )
   // }//end renderChoice

} //end SelectionModal

const styles = StyleSheet.create({
   selectionModal: {
      height: '60%',
      width: SCREEN_WIDTH,
      backgroundColor: COLORS.GC_PULLUP_BKG,
      justifyContent: 'center',
      margin: 0,
      marginTop: 'auto',
      marginBottom: -18,
      alignSelf: 'center',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,

   },
   mapModal: {
      flex: 1,
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      backgroundColor: COLORS.GC_BACKGROUND,
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: -20, //TODO KLUGE ALERT ... expands the modal to cover screen
      marginTop: -22     //couldn't find any other way ....
   },

   choice: {
      marginLeft: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderColor: 'black'
   },
   // choiceActive: {
   //    marginLeft: 10,
   //    flexDirection: 'row',
   //    justifyContent: 'space-between',
   //    borderColor: COLORS.GC_HIGHLIGHT_SELECTED,
   //    backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED
   // }

});
