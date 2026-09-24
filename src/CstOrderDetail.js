import React, { Component } from 'react'
import { LogBox, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';



import CmnIdList from 'DWcmn/CmnIdList'
import CmnItemsList from 'DWcmn/CmnItemsList'
import CmnHistoryList from 'DWcmn/CmnHistoryList';
import {CmnPhotosList} from 'DWcmn/CmnPhotosList'
import GCHeader from 'DWcmn/GCHeader'
import { COLORS } from 'DWcmn/Global'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { cstGenerateDetailActions, cstProcessAction, cstProcessActionOnEvent } from './cstActionProcessing'
import { dwdbfsOrderExtract } from 'DWcmn/DWDBfs'

import { OrderActionEnum } from 'DWcmn/Global'
import { CstScreen } from './CdsScreen';
//20230523 replaced Notes with Photos
//20250214 action processing re-org




//navigation param - id
//navigation param - readonly

export default class CstOrderDetail extends Component {

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
         { key: 2, i18n: 'cmnNEW.Photos' },
         { key: 3, i18n: 'cmn.History' }
      ]
   }

   componentDidMount() {
      const orderId = this.props.navigation.getParam('id', null);
      this.unsubscribeOrder = firestore().collection("Orders").doc(orderId)
         .onSnapshot(this.getOrder);
      //tunn off warnings because we get a pesky warning when items get removed by decrementing
      LogBox.ignoreAllLogs(true)
   } //end componentDidmount

   //get rid of the database listeners
   componentWillUnmount() {
      LogBox.ignoreAllLogs(false)
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
      const actions = readonly ? [] : cstGenerateDetailActions(order)

      return (
         <CstScreen>
            {(this.state.action == OrderActionEnum.noop) ? null :
               cstProcessAction(this.props.navigation, order,
                  this.state.action, () => { this.setState({ action: OrderActionEnum.noop }) })}

            {/* Header */}
            <GCHeader back titleI18n='cmn.Order_Detail' />
            <PrjTabBar fields={this.tabFields}
               selectedTab={this.state.selectedTab}
               onPress={(index) => this.setState({ selectedTab: index })} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
               {this.state.selectedTab == 0 && <CmnIdList order={order} />}
               {this.state.selectedTab == 1 && <CmnItemsList order={order} readonly={true} />}
               {this.state.selectedTab == 2 && <CmnPhotosList order={order} NoHeader />}
               {this.state.selectedTab == 3 && <CmnHistoryList order={order} />}
            </View>

            {/* FOOTER ..NOTE we have to set to standard background colour .. footer usually wants to be dark*/}
            <GCFooterForIcons
               style={{ backgroundColor: COLORS.GC_BACKGROUND }}>
               {actions.map((action, index) =>
                  <GCFooterCmdIcon
                     key={index}
                     code={getIconCodeForAction(action)}
                     onPress={() => {
                        if (!cstProcessActionOnEvent(this.props.navigation, order, action)) {
                           this.setState({ action: action })
                        }
                     }}
                  />
               )}
            </GCFooterForIcons>

         </CstScreen >
      ); //end return
   } //end render


} //end class CstOrderDetail
