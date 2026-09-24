import React, { Component } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'

//TODO GCFooterWithSingleIcon not tested yet

//nav param order
class CstPayment extends Component {

   constructor() {
      super();
      this.state = {
         confirmationAvailable: false,
         isComponentInitialized: false,
      };
      this.order = null
   }

   async componentDidMount() {
      this.order = this.props.navigation.getParam('order', null)
      //TODO check totalPrice etc


      this.setState({ isComponentInitialized: true })
   }
   render() {

      if (!this.state.isComponentInitialized) return null
      return (
         <CstScreen background>
            <GCHeader style={{ backgroundColor: 'transparent' }} />
            <View style={{ flex: 1 }} >
               <WebView
                  //There are several stages after the Form is submitted by our web page
                  //We can tell when ipay88 is displaying the final status by the title
                  //Confirmation means they are displaying a transaction summary (pass or fail)
                  //PaymentCancel means there is no display but we are finished
                  //In both the above cases a final navstate change follows (immediately for cancel)
                  onNavigationStateChange={(navState)=>{
                     // console.log(navState)
                     //if we already have a success/failure screen, next state change is a timeout
                     //or if we are at the last screen (ipay88response)
                     if(this.state.confirmationAvailable ||
                        navState.url.includes("ipay88response")){
                        this.props.navigation.popToTop()
                     }
                     //ow if it is the confirmation screen give them a button to navigate away
                     else if (navState.title.includes("Confirmation") ||
                        navState.title.includes("PaymentCancel") ){
                        this.setState({confirmationAvailable:true})
                     }
                  }} 
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  originWhitelist={['*']}
                  source={{
                     uri: "https://asia-southeast2-dobby-ba6e8.cloudfunctions.net/ipay88payment" +
                     "?RefNo=" + this.order.id +
                        // "&Amount=1.00" + //INTEGRATION TESTING
                        "&Amount=" + this.order.totalPrice.toFixed(2) +
                        "&UserName=" + this.order.name +
                        "&UserEmail=" + this.order?.email +
                        "&UserContact=" + this.order.phoneNumber
                  }}
               />
            </View>

            {this.state.confirmationAvailable&&<GCFooterWithSingleIcon
               onPress={async () => {
                  //NOTE the payment status will be changed by cloud function called by ipay88
                  //TOTO but we could verify the paid status here perhaps
                  this.props.navigation.popToTop()
               }}
            />}
         </CstScreen>
      )
   } //end render


} //end CstPayment

export default CstPayment;
