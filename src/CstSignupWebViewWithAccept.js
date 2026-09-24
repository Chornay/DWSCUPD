import React, { Component } from 'react'

import { View } from 'react-native'
import { SpinnerXYZ } from 'DWcmn/GCNB';
import { CdsScreen } from './CdsScreen';
import { WebView } from 'react-native-webview';
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import GLOBALS from 'DWcmn/Global';

//20211111 changed to call onForward when ACCEPT is pressed
//20221003 add spinner while !pageIsLoaded

//prop titleI18n optional
//prop onDecline() back arrow (REQUIRED ... IT IS HOW THEY REFUSE)
//prop onAccept() forward arrow (WILL BE DISPLAYED AFTER THEY HAVE CLICKED OKAY)
//prop url
//when the webpage has loaded we set the pageIsLoaded state variable enabling the ACCEPT button
//when ACCEPTed that button disappears and a Forward arrow appears
//BACK arrow is always there it means reject the conditions.
export default class CstSignupWebViewWithAccept extends Component {

   constructor() {
      super();
      this.state = {
         pageIsLoaded: false
      };

   }

   render() {
      return (
         <CdsScreen>
            <GCHeader titleI18n={this.props.titleI18n} />
            <View style={{ flex: 1, justifyContent: 'center' }}>
               {(!this.state.pageIsLoaded) && <SpinnerXYZ />}
               <WebView
                  originWhitelist={['*']}
                  source={{ uri: this.props.url }}
                  onLoadEnd={(syntheticEvent) => {
                     const { nativeEvent } = syntheticEvent;
                     this.setState({ pageIsLoaded: !nativeEvent.loading });
                  }}
               />
            </View>

            <GCFooterWithTwoIcons
               disable={!this.state.pageIsLoaded}
               onOkayCode='NEXT_IS_ACCEPT'
               onCancelCode='PREV_IS_DECLINE'
               onOkay={this.props.onAccept}
               onCancel={this.props.onDecline}
            />
         </CdsScreen >
      )
   }
}



