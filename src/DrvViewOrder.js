import React, { Component } from 'react'
import firestore from '@react-native-firebase/firestore';
import { View } from 'native-base';

import GCHeader from 'DWcmn/GCHeader'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'

import CmnIdList from 'DWcmn/CmnIdList'
import CmnItemsList from 'DWcmn/CmnItemsList'
import CmnHistoryList from 'DWcmn/CmnHistoryList';
import CmnNotesList from 'DWcmn/CmnNotesList'
import { drvGenerateOrderDetailActions } from './drvOrderActionProcessing';
import { drvProcessOrderAction, drvProcessOrderActionOnEvent } from './drvOrderActionProcessing'
import { dwdbfsOrderExtract } from 'DWcmn/DWDBfs'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'

import { OrderActionEnum } from 'DWcmn/Global'
import { DrvScreen } from './CdsScreen';
import { strX } from 'DWcmn/I18n';

//20250207 added the onBack parameter
//20250207 added selectedTab parameter defaulting to 1 ... see Items tab by default



//navigation param - onBack() if you want the back key to do anything other than goBack
//navigation param - id
//navigation param - readonly
//navigation param - selectedTab .. default 1 (to see the items in the order)

export default class DrvViewOrder extends Component {

   constructor() {
      super();
      this.state = {
         order: null,
         action: OrderActionEnum.noop,
         waitingForFirstQueryResult: true,
         selectedTab: 0
      };
      this.tabFields = [
         { key: 0, i18n: 'cmn.ID' },
         { key: 1, i18n: 'cmn.Items' },
         { key: 2, i18n: 'cmn.Notes' },
         { key: 3, i18n: 'cmn.History' }
      ]
   }

   componentDidMount() {
      const orderId = this.props.navigation.getParam('id', null);
      this.setState({ selectedTab: this.props.navigation.getParam('selectedTab', 1) })
      this.unsubscribeOrder = firestore().collection("Orders").doc(orderId)
         .onSnapshot(this.getOrder);
   } //end componentDidmount

   //get rid of the database listeners
   componentWillUnmount() {
      this.unsubscribeOrder();
   } //end componentWillUnmount

   getOrder = (docSnapshot) => {
      this.setState({ order: dwdbfsOrderExtract(docSnapshot.data()) })
      if (this.state.waitingForFirstQueryResult) { this.setState({ waitingForFirstQueryResult: false }) }
   } //end getOrder


   render() {

      //TODO spinner
      if (this.state.waitingForFirstQueryResult) {
         return null
      }

      const order = this.state.order
      const readonly = this.props.navigation.getParam('readonly', false)
      const actions = readonly ? [] : drvGenerateOrderDetailActions(order)


      const notes = order.notes
      const notesCount = notes.length
      // NOTE in the normal case where there is no onBack set then TRUE will just do the default back
      const backParam = this.props.navigation.getParam('onBack', true)

      return (
         <DrvScreen>
            {(this.state.action != OrderActionEnum.noop) &&
               drvProcessOrderAction(order, this.state.action, () => { this.setState({ action: OrderActionEnum.noop }) })}
            <GCHeader back={backParam} titleI18n='cmn.Order_Detail' />
            <PrjTabBar fields={this.tabFields}
               selectedTab={this.state.selectedTab}
               onPress={(index) => this.setState({ selectedTab: index })} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
               {this.state.selectedTab == 0 && <CmnIdList order={order} />}
               {this.state.selectedTab == 1 && <CmnItemsList order={order} readonly={readonly} />}
               {this.state.selectedTab == 2 && <CmnNotesList notes={order.notes} NoHeader />}
               {this.state.selectedTab == 3 && <CmnHistoryList order={order} />}
            </View>

            {/* FOOTER */}
            <GCFooterForIcons>
               {actions.map((action, index) =>
                  <GCFooterCmdIcon
                     key={index}
                     code={getIconCodeForAction(action)}
                     onPress={async () => { //if we don't handle now, we will handle during render
                        if (!await drvProcessOrderActionOnEvent(this.props.navigation, order, action)) {
                           this.setState({ action: action })
                        }
                     }} //handle command in modal
                  />
               )}
            </GCFooterForIcons>

         </DrvScreen >
      ); //end return
   } //end render

} //end class DrvViewOrder
