import React, { Component } from 'react'

import { View, FlatList, TouchableOpacity, StyleSheet } from 'react-native'


import { PrjSpacer } from 'DWcmn/Prj';
import { CdsScreen } from './CdsScreen';
import firestore from '@react-native-firebase/firestore';
import GLOBALS from 'DWcmn/Global';
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { dwdbfsShopLoadSnapshots } from 'DWcmn/dwdbfsShop'
import CdsQuestionScreen from './CdsQuestionScreen'
import {GCFooterWithTwoIcons} from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import { CstShopTile } from './CstShopTile'
import { GCI18n, GCText } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import { prjcmnFindNearbyShops } from 'DWcmn/prjcmnLocationFunctions'


import CdsSpinnerScreen from './CdsSpinnerScreen'

//20210901 made selection displays look like questionScreen
//20230326 changed to use CstShopTile
//20230525 changed to use prjcmnFindNearbyShops

//prop title
//prop custLocation MUST BE SPECIFIED
//prop onSelect(shop)
//prop onNoShop()
//prop onCancel()

export default class CstSignupShopSelect extends Component {

   constructor() {
      super();
      this.state = {
         selectedShop: null,
         isComponentInitialized: false,
         selectedShopId:''
      };
      this.shops = [];
   } //end constuctor

   async componentDidMount() {
      
      try {
         this.shops = await prjcmnFindNearbyShops(this.props.custLocation)
         //if there is only one shop, it is (and will stay) selected
         if (this.shops.length == 1) { this.setState({ selectedShop: this.shops[0] }) }
      }
      catch (error) { // unexpected failure accessing db
         prjAlert(error.message)
      };
      this.setState({ isComponentInitialized: true });

   }//end componentDidMount

   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CdsSpinnerScreen />
         );
      } //end if

      if (this.shops.length == 0) { // none available
         return (
            <CdsQuestionScreen
               text='cst.serviceNotAvailable'
               onOkayCode='NEXT_IS_WHATS_NEXT'
               onCancelCode='PREV_IS_NEW_ADDRESS'
               onOkay={this.props.onNoShop}
               onCancel={this.props.onCancel}
            />
         )
      }

      if (this.shops.length == 1) { // one shop available and it is selected
         return (this.renderSingleShop())
      }
  
      //else more than one shop available
      return (this.renderShopList())


   }//end render


   //if only one shop found then display it (it is already selected)
   renderSingleShop(singleShop) {
      return (
         <CdsScreen>
            {/* <GCHeader titleI18n='cmnNEW.ShopSelection' /> */}

            <PrjSpacer size={40} />
            <View style={{flex:.2}}>
            <GCI18n large code='cmnNEW.YouHaveService' style={{ textAlign: 'center' }} />
            </View>
            <View style={{flex:.8}}>
               {this.renderShop(this.state.selectedShop, false)}
            </View>

            <GCFooterWithTwoIcons
               onOkay={() => this.props.onSelect(this.state.selectedShop)}
               onCancel={this.props.onCancel}
            />
         </CdsScreen >
      )
   }

   renderShopList() {
      return (
         <CdsScreen>
            {/* <GCHeader titleI18n='cmnNEW.ShopSelection' /> */}

            <PrjSpacer size={20} />

            <GCI18n large code='cmnNEW.ChooseYourShop' style={{ textAlign: 'center' }} />

            <PrjSpacer size={20} />

            <FlatList
               data={this.shops}
               keyExtractor={(item, index) => index.toString()}
               renderItem={({ item }) => {
                  return (
                     <View>{this.renderShop(item, true)}</View>
                  )
               }}
            ></FlatList>

            <GCFooterWithTwoIcons
               onOkay={this.state.selectedShop && (() => this.props.onSelect(this.state.selectedShop))}
               onCancel={this.props.onCancel}
            />
         </CdsScreen >
      )
   }


   //if we have only one shop then changeable will be false
   //NOTE the shop is still clickable but nothing happens
   renderShop = (shop, changeable) => {
      let maybeHighlightStyle = shop == this.state.selectedShop ? styles.highlight : null

      return(
         <CstShopTile
         shop={shop}
         selected={shop == this.state.selectedShop}
         clickable={changeable}
         onPress={() => { this.setState({ selectedShop: shop }) }}
         />

      )
   }

}//end CstSignupShopSelect

const styles = StyleSheet.create({
   highlight: {
      backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: .1,
      elevation: 5,
      shadowRadius: .8,
   },

})
