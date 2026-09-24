import React, { Component } from 'react'
import { View, FlatList } from 'react-native'

import firestore from '@react-native-firebase/firestore';
import { SpinnerXYZ } from 'DWcmn/GCNB'

import { CstScreen } from './CdsScreen';
import { GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import CstOrderTile from './CstOrderTile'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { CST } from './CST'

//20250302 removed readonly from CstOrderTile render

//TODO disable back handler?
//prop onOkay
export class CstProfileHistory extends Component {

   constructor() {
      super();
      this.state = {
         orders: [],
         isComponentInitialized: false,
      };
   }

   async componentDidMount() {
      let querySnapshot = await firestore().collection("Orders")
         .where("custId", "==", CST.getCustId())
         .where("archive", "==", true)
         .orderBy("creationDate", "desc")
         .get();
      this.setState({ orders: dwdbfsOrderLoadSnapshots(querySnapshot) })
      this.setState({ isComponentInitialized: true })
   }

   render() {

      return (
         <CstScreen>
            <GCHeader back={this.props.onOkay} titleI18n='cmnNEW.OrderHistory' />
            <View style={{ height: 10 }} />
            {this.renderContent()}
         </CstScreen >
      )

   } //end render

   renderContent() {

      if (!this.state.isComponentInitialized) {
         return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <SpinnerXYZ />
            </View>)
      }

      if (this.state.orders.length == 0) {
         return (
            <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN, justifyContent: 'center', alignItems: 'center' }}>
               <GCI18n large code='cmnNEW.NoOrdersArchived' style={{ textAlign: 'center' }} />
            </View>)
      }

      return (
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <FlatList
               data={this.state.orders}
               keyExtractor={(item, index) => index.toString()}
               renderItem={({ item }) => {
                  return (
                     <CstOrderTile order={item} />
                  )
               }}
            ></FlatList>
         </View>)

   }//end renderContent

} //end CstProfileHistory


