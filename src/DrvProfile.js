import React, { Component } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { ListItemXYZ } from 'DWcmn/GCNB';

import { DrvScreen } from './CdsScreen';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import I18n from 'i18n-js';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { GC_STD_MARGIN } from 'DWcmn/Global'

const MODES = {
   MAIN: 0,
}

export default class DrvProfile extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         mode: MODES.MAIN,
      };
   }
   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {

      if (!this.state.isComponentInitialized) return null

      switch (this.state.mode) {

         case MODES.MAIN:
            return (

               <DrvScreen>
                  <GCHeader back titleI18n='cmnNEW.Profile'/>
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <ProfileField
                        onPress={async () => { await cmnSignout() }}
                        id={"LOGOUT"}
                        i18n='cmnNEW.Logout'
                     />

                  </View>
               </DrvScreen>
            )
            break;
         default:
            return null
            break;

      }//end switch
   } //end render

   doPress = (val) => {
      I18n.locale = val;
      this.setState({ displayLanguage: false });
   }
} //end DrvProfile

//prop onPress
//prop id   //icon to display
//prop i18n //followed by text
class ProfileField extends Component {

   constructor() {
      super();
      this.state = {
         displayLanguage: false,
      };
   }

   render() {

      return (
         <ListItemXYZ>
            <TouchableOpacity
               onPress={this.props.onPress}>
               <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                  <PrjIcon style={{}} id={this.props.id} />
                  <GCText>  </GCText>
                  <GCI18n code={this.props.i18n} />
               </View>
            </TouchableOpacity>
         </ListItemXYZ>

      )
   }//end render
}//end ProfileField
