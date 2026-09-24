
import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global'
import Modal from "react-native-modal";
import { strX } from 'DWcmn/I18n'

import { CstScreen } from './CdsScreen';
import { CmnAddressInput } from 'DWcmn/CmnAddressInput';
import { prjcmnInShopArea } from 'DWcmn/prjcmnLocationFunctions'
import { prjToast } from 'DWcmn/PrjToast'

const { width: SCREEN_WIDTH } = Dimensions.get('window') || {};
const { height: SCREEN_HEIGHT } = Dimensions.get('window') || {};


//CstAddressInputTouchable will display touchable text until pressed
//when it will display a modal to enter an address on map
//#######################################################################
//KLUGE ALERT when you receive the stop you MUST add in the code (home or alternate)
//#######################################################################
//THIS IS USED AT SIGNUP AND PROFILE
//prop address
//prop location
//prop buttonI18n .. the code for the text to display as button
//prop buttonStyle .. optional styling for the button (NOT the modal buttons)
//prop disabled
//prop titleI18n
//prop onOkay()
//prop onCancel()
//prop onRemove()
export class CstAddressInputTouchable extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isMapActive: false, // true iff modal to select custom address from map
         isComponentInitialized: false,
      };
   }
   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {

      if (!this.state.isComponentInitialized) return null


      //we always display our button but if it has been pressed we display our modal as well
      return (
         <View style={{ marginBottom: -6 }}>

            <TouchableOpacity
               disabled={this.props.disabled}
               onPress={() => this.setState({ isMapActive: true })}>
               {this.props.children}
            </TouchableOpacity>
            {/* <TouchableOpacity
               style={{ backgroundColor: GLOBALS.COLOR.EDITABLE }}
               onPress={() => this.setState({ isMapActive: true })}>
               <Text style={styles.button}>{strX(this.props.buttonI18n)}</Text>
            </TouchableOpacity> */}

            {this.state.isMapActive &&
               <MapModal
                  titleI18n={this.props.titleI18n}
                  address={this.props.address}
                  location={this.props.location}
                  shop={this.props.shop}
                  onSelect={(address, location) => {
                     this.props.onSelect(address, location)
                     this.setState({ isMapActive: false });
                  }}
                  onRemove={(this.props.onRemove) ? () => {
                     this.props.onRemove()
                     this.setState({ isMapActive: false });
                  } : null}
                  onCancel={() => {
                     this.setState({ isMapActive: false });
                  }}
               ></MapModal>}
         </View>
      )
   }

}//end CstAddressInputTouchable


//prop titleI18n ..
//prop address
//prop location
//prop shop .. shop record of the applicable shop
//prop onSelect(stop))
//prop onCancel()
class MapModal extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
      };
   }

   componentDidMount() {
   }

   render() {

      return (

         <Modal
            isVisible={true}
            coverScreen={true}
            style={{ height: '100%', width: '100%', marginLeft: 0 }}
         >
            <CstScreen>
               {/* remove title property */}
               <View style={styles.mapModal}>
                  <CmnAddressInput requestPermission
                     title={strX(this.props.titleI18n)}
                     titleI18n={this.props.titleI18n}
                     defaultAddress={this.props.address}
                     defaultLocation={this.props.location}
                     onCancel={this.props.onCancel}
                     onRemove={this.props.onRemove}
                     onSelect={(address, location) => {
                        const response = prjcmnInShopArea(location, this.props.shop)
                        if (response) {
                           this.props.onSelect(address, location)
                        }
                        else {
                           prjToast({ modalParent:true, i18n: 'cmnNEW.notInArea', duration:2000 }) //OK
                        }
                     }}
                  />
               </View>
            </CstScreen>
         </Modal >
      )
   }
}


const styles = StyleSheet.create({
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

   address: {
      backgroundColor: '#FFFFFF',
      width: '100%',
      padding: 5,
      marginRight: 100,
      borderRadius: 10
   },
   button: {
      backgroundColor: GLOBALS.COLOR.EDITABLE, //test for now
      // backgroundColor: '#b3b3b3', //test for now
      textAlign: 'center',
      width: 'auto',
      height: 'auto',
      fontSize: 18,
      fontWeight: 'bold',
      padding: 5,
   },
   choice: {
      marginLeft: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderColor: 'black'
   },
   choiceActive: {
      marginLeft: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderColor: COLORS.GC_HIGHLIGHT_SELECTED,
      backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED
   }

});
