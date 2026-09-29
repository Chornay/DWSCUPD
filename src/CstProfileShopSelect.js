import React, { Component } from 'react'

import { View, FlatList } from 'react-native'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { CstShopTile } from './CstShopTile'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { dwdbfsCustUpdate } from 'DWcmn/dwdbfsCust'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { prjcmnFindNearbyShops } from 'DWcmn/prjcmnLocationFunctions'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjStopInitialize, prjStopInitHomeStopFromBuildingService } from 'DWcmn/prjStopFunctions'
import { prjStopInitHomeStopWithAddressLoc } from 'DWcmn/prjStopFunctions'
import { prjStopAltRemove } from 'DWcmn/prjStopFunctions'
import { CST } from './CST'

//24040923 set isBuildingService in cust and building/home in cust.homeStop
//20240923 removed usage of dwdbfsCustUpdateFields
//20241112 changed shop?.id to set field in db. can return undefined which firestore ignores

//prop shop ... record
//prop user
//prop onOkay()
//prop onCancel()
//NOTE that we check the user.isDemoUser flag. A demo user will only see the DEMO account.
//  no other users will see it because it is in the middle of the Pacific ocean.
// NOTE on exit this guy has only changed the Database. Caller must fix up local CST stuff
export class CstProfileShopSelect extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isCustomerDbInProgress: false,
         shopHasChanged: false,
         toggle: false,  //toggled iff we need to rerender (because of location or shop change)
         selectedShop: null,
         isComponentInitialized: false,
      }

      this.nearbyShops = []
      this.user = this.props.user
   }

   async componentDidMount() {
      let stop = this.user.homeStop
      this.nearbyShops = await prjcmnFindNearbyShops(stop.location, this.user.isDemoUser)
      this.setState({ isComponentInitialized: true });
      this.setState({ selectedShop: this.props.shop })
   }

   render() {

      if (!this.state.isComponentInitialized) return null

      return (
         <CdsScreen>

            {/* if the caller is doing something lengthy he will set the disabled flag */}
            {/* and we will cover the screen with a modal to prevent clicking         */}
            {this.state.isCustomerDbInProgress && <PrjBusyMask />}

            <GCHeader back={!this.state.shopHasChanged && this.props.onCancel}
               titleI18n='cmnNEW.SelectAShop'
            />
            <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
               <View style={{ flex: .5 }}>
               </View>
               <View style={{ flex: .5 }}>
                     <FlatList
                        data={this.nearbyShops}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                           return (
                              <CstShopTile
                                 shop={item}
                                 selected={this.state.selectedShop?.id == item.id}
                                 clickable={true}
                                 onPress={() => {
                                    if (this.state.selectedShop?.id == item.id) { //we allow them to have no shops
                                       this.setState({ selectedShop: null })
                                    } else {
                                       this.setState({ selectedShop: item })
                                    }
                                    this.setState({ shopHasChanged: true })
                                 }
                                 }
                              />
                           )
                        }}
                     ></FlatList>
               </View>
            </View>
            {(this.state.shopHasChanged) &&
               <GCFooterWithTwoIcons
                  onOkayCode='NEXT_IS_SAVE'
                  onOkay={async () => {
                     //remember selected shop can be null
                     //and remember that we can not use shop?.id because firestore does NOT like undefined
                     let fields = {}
                     let shop = this.state.selectedShop
                     let cust = CST.getCust()
                     //TODO if building should we set address to shop address?
                     //TODO if building service should check that unit is not blank
                     // we 'remove' the Alternate Address by setting code to null
                     cust.shopId = shop ? shop.id : null
                     cust.shopIsABuildingService = Boolean(shop?.isBuildingService)
                     if (cust.shopIsABuildingService) {
                        //NOTE this will set home address to the shop address
                        prjStopInitHomeStopFromBuildingService(cust.homeStop, shop)
                        // cust.homeStop.code = 'building'
                        // cust.homeStop.buildingName = shop.buildingName
                     }
                     else {
                        //TODO note that there are some stop flags that are not being reset here
                        cust.homeStop.code = 'home'
                        cust.homeStop.buildingName = null
                     }
                     prjStopAltRemove(cust.altStop)
                     this.setState({ isCustomerDbInProgress: true })
                     if (await dwdbfsCustUpdate(cust)) {
                        CST.setCust(cust)
                        CST.setShop(cust.shopId ? await dwdbfsShopGet(cust.shopId) : null)
                        this.setState({ isCustomerDbInProgress: false })
                        this.props.onOkay()
                     }
                     else {
                        this.setState({ isCustomerDbInProgress: false })
                     }
                  }
                  }
                  onCancel={this.props.onCancel}
                  disable={this.props.disabled}

               />}
         </CdsScreen >
      )
   }
   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 


}// end CstProfileShopSelect

