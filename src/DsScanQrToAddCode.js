import React, { Component } from 'react'
import { View } from 'react-native'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderAddQrCode, dwdbfsOrderGetByQrCode } from 'DWcmn/dwdbfsOrder'

//20250208 added check to make sure that order exists
//20251012 changed to navigate back two levels from detail ... skipping us.

//A screen to input a QR code to get an order id to be used to re-identify the current order

//param order
export default class DsScanQrToAddCode extends Component {

   constructor() {
      super();

      this.state = {
         newCodeFromQr: null,
         isComponentInitialized: false,
         applyMask: false,
      };
      this.order = null
   }

   async componentDidMount() {
      this.order = this.props.navigation.getParam('order')
      this.setState({ isComponentInitialized: true })
   }
   render() {

      if (!this.state.isComponentInitialized) { //not finished our preparation yet
         return (
            <CdsSpinnerScreen />
         );
      } //end if 
      return (
         <DsScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            <GCHeader back titleI18n='cmnNEW.QrScanner' />
            {this.state.newCodeFromQr ? <>
               <View style={{ flex: 1 }}>

               </View>
               <GCFooterForIcons>
                  <GCFooterCmdIcon code="ADD_QR_CODE" onPress={async () => {
                     this.setState({ applyMask: true }) //
                     await dwdbfsOrderAddQrCode(this.order, this.state.newCodeFromQr)
                     this.setState({ applyMask: false }) //
                     //TODO CHECK THIS NEXT COMMENT????
                     //NOTE WE COMING FROM AN ORDER DETAIL THAT HAS CHANGED ...
                     //DON'T WANT TO GO BACK THERE ... SO POP 2 
                     this.props.navigation.pop(2)
                  }
                  } />
               </GCFooterForIcons>

            </> :
               <CmnQrScan onScan={this.onScan} />}
         </DsScreen >
      )
   } //end render

   //if we get an valid id from the QR code, we prompt to allow the change
   //TODO check shop is correct
   onScan = async (data, params) => {
      if (!data) { prjToast({ i18n: 'cmnNEW.MsgQRNoData' }) }
      else if (!params) { prjToast({ i18n: 'cmnNEW.MsgQRInvalid' }) }
      else if (!params.code) { prjToast({ i18n: 'cmnNEW.MsgQRNoCode' }) }
      else {
         let tempOrder = await dwdbfsOrderGetByQrCode(params.code)
         if (tempOrder) {
            prjToast({ i18n: 'cmnNEW.MsgQROrderAlreadyExists' }, { code: params.code, id: tempOrder.id })
         }
         else {
            this.setState({ newCodeFromQr: params.code })
         }
      }
   }

} //end DsScanQrToAddCode


