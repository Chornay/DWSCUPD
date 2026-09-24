import React, { Component } from 'react'
import { TouchableOpacity, Alert, Image } from 'react-native'
import { Input, Item, Label } from 'native-base'
import { ListItemXYZ } from 'DWcmn/GCNB'
import { View, Button, TextInput } from 'react-native'
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';

import RNQRGenerator from 'rn-qr-generator';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import storage from '@react-native-firebase/storage';
import { CdsScreen } from './CdsScreen';
import { GCText } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { dwdbfsDrvGet } from 'DWcmn/dwdbfsDrv'
import { dwdbfsCustGet } from 'DWcmn/dwdbfsCust'
import { dwdbfsCouponsGetForCustomer, dwdbfsCouponsGetAvailable } from 'DWcmn/dwdbfsCoupons'
import { dwdbfsCouponsAddNew, dwdbfsCouponsDelete } from 'DWcmn/dwdbfsCoupons'
import { CstProfileAboutUs } from './CstProfileAboutUs'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import DsSearch from './DsSearch'

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { prjcmnCalculateEnclosingMapRegionWithLocArray } from 'DWcmn/prjcmnLocationFunctions'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { prjcmnInShopArea } from 'DWcmn/prjcmnLocationFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import moment from 'moment'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { CstCouponList } from './CstCouponList'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';


const MODES = {
   MAIN: 0,
   SHOP_MAIN: 2,
   SHOP_PRICELIST: 5,
   SHOP_UPDATE: 10,
   SHOP_DELETE_ROUTES_AND_ORDERS: 12,
   SHOP_BOUNDARIES: 15,
   SHOP_ADD: 18,
   SHOP_DEMO_ROUTES: 20,
   SHOP_PURGE_ROUTES: 30,
   DRIVER_MAIN: 100,
   DRIVER_UPDATE: 110,
   DRIVER_ADD: 120,
   CUST_MAIN: 500,
   CUST_COUPONS: 550,
   CUST_AVAIL_COUPONS: 560,
   SEARCH: 700,
   QR_MAIN: 800,
}

export default class UtilTop extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         mode: MODES.MAIN,
         selShop: null,
         shopName: null,
         hasBoundary: false,
         selDriver: null,
         driverName: null,
         selCustId: null,
         howManyToGenerate: null,
      };
      this.shopRec = null
      this.activeCoupon = null

   }
   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {

      if (!this.state.isComponentInitialized) return null

      switch (this.state.mode) {

         case MODES.MAIN:
            return (

               <CdsScreen>
                  <GCHeader
                     back={() => this.props.navigation.goBack()}
                     titleText='Utilities'
                  />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <View>
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_MAIN }) }}
                           text='Shop'
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.DRIVER_MAIN }) }}
                           text='Driver'
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.CUST_MAIN }) }}
                           text='Customer'
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SEARCH }) }}
                           text="Search"
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.QR_MAIN }) }}
                           text="QR codes"
                        />
                     </View>

                  </View>
               </CdsScreen>
            )
            break;

         case MODES.QR_MAIN:
            //TODO check that input is numberic
            return (

               <CdsScreen>
                  <GCHeader
                     back={() => this.setState({ mode: MODES.MAIN })}
                     titleText='QR Utilities'
                  />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <UtilInput label='How many to generate' field={this.state.howManyToGenerate}
                        onEndEditing={async (val) => {
                           if (await generateQRfile(val)) {
                              prjToast({
                                 text: "File generated",
                                 type: 'info'
                              })
                           }
                        }} />

                  </View>
               </CdsScreen>
            )
            break;

         case MODES.SHOP_MAIN:
            return (

               <CdsScreen>
                  <GCHeader
                     back={() => this.setState({ mode: MODES.MAIN })}
                     titleText='Shop Utilities'
                  />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <UtilInput label='Shop Id' field={this.state.selShop}
                        // onEndEditing={async (val) => {
                        //    try {
                        //       const { data } = await firebase.app().functions('asia-southeast2').httpsCallable('sendEmail')({
                        //          foo:'abc'
                        //       });
                        //    } catch (error) {
                        //       console.log(error)
                        //       this.setState({ sysAvailable: false })
                        //       this.setState ({sysMessage:error.message})
                        //       return
                        //    }
                        // }}
                        onEndEditing={async (val) => {
                           this.setState({ selShop: val })
                           this.shopRec = await dwdbfsShopGet(val)
                           //NOTE a (new) shop probably won't have a name (or id)
                           if (this.shopRec) {
                              this.setState({ shopName: this.shopRec.name || "Record found, no name. New shop?" })
                              if (this.shopRec.boundary) {
                                 this.setState({ hasBoundary: this.shopRec.boundary.length > 0 })
                              }
                              else {
                                 this.setState({ hasBoundary: false })
                              }
                           }
                           else {
                              this.setState({ hasBoundary: false })
                              this.setState({ shopName: null })
                              prjToast({
                                 text: "Shop not found",
                                 type: 'danger'
                              })
                           }
                        }} />
                     <View style={{ height: 10 }} />
                     <GCText>{this.state.shopName}</GCText>
                     <View style={{ height: 30 }} />
                     {this.shopRec ? <View>
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_PRICELIST }) }}
                           text='Update Pricelist'
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_UPDATE }) }}
                           text="Update Shop"
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_DELETE_ROUTES_AND_ORDERS }) }}
                           text="Delete Routes And Orders"
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_PURGE_ROUTES }) }}
                           text="Purge Routes"
                        />
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_DEMO_ROUTES }) }}
                           text="Generate Demo Routes"
                        />
                        {this.state.hasBoundary && <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.SHOP_BOUNDARIES }) }}
                           text="View/Test Boundaries"
                        />}
                     </View>
                        : <View>
                           {(this.state.selShop) && <UtilChoice
                              onPress={() => { this.setState({ mode: MODES.SHOP_ADD }) }}
                              text='Create Shop'
                           />}
                        </View>}

                  </View>
               </CdsScreen>
            )
            break;

         case MODES.SHOP_PRICELIST:
            return (
               <UpdatePriceList shop={this.shopRec} shopId={this.state.selShop}
                  onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;

         case MODES.SHOP_ADD:
            return (
               <AddShop shopId={this.state.selShop}
                  onBack={() => { this.setState({ mode: MODES.MAIN }) }}
                  onSuccess={async () => {
                     this.shopRec = await dwdbfsShopGet(this.state.selShop)
                     this.setState({ mode: MODES.MAIN })
                     this.forceUpdate()
                  }} />
            )
            break;

         case MODES.SHOP_DEMO_ROUTES:
            return (
               <AddDemoRoutes shop={this.shopRec} onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;

         case MODES.SHOP_DELETE_ROUTES_AND_ORDERS:
            return (
               <DeleteRoutesAndOrders shop={this.shopRec} onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;
         case MODES.SHOP_PURGE_ROUTES:
            return (
               <PurgeRoutes shop={this.shopRec} onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;

         case MODES.SHOP_UPDATE:
            return (
               <UpdateShop shop={this.shopRec} shopId={this.state.selShop} onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;

         case MODES.SHOP_BOUNDARIES:
            return (
               <Boundaries shop={this.shopRec} onBack={() => { this.setState({ mode: MODES.SHOP_MAIN }) }} />
            )
            break;

         case MODES.DRIVER_MAIN:
            return (

               <CdsScreen>
                  <GCHeader
                     back={() => this.setState({ mode: MODES.MAIN })}
                     titleText='Driver Utilities'
                  />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <UtilInput label='Driver Id' field={this.state.selDriver}
                        // onEndEditing={async (val) => {
                        //    try {
                        //       const { data } = await firebase.app().functions('asia-southeast2').httpsCallable('sendEmail')({
                        //          foo:'abc'
                        //       });
                        //    } catch (error) {
                        //       console.log(error)
                        //       this.setState({ sysAvailable: false })
                        //       this.setState ({sysMessage:error.message})
                        //       return
                        //    }
                        // }}
                        onEndEditing={async (val) => {
                           this.setState({ selDriver: val })
                           this.driverRec = await dwdbfsDrvGet(val)
                           //NOTE a (new) driver probably won't have a name (or id)
                           if (this.driverRec) {
                              this.setState({ driverId: this.driverRec.id || "Record found, no id. New driver?" })
                           }
                           else {
                              this.setState({ driverId: null })
                              prjToast({
                                 text: "Driver not found",
                                 type: 'danger'
                              })
                           }
                        }} />
                     <View style={{ height: 10 }} />
                     <GCText>{this.state.driverId}</GCText>
                     <View style={{ height: 30 }} />
                     {this.driverRec ? <View>
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.DRIVER_UPDATE }) }}
                           text="Update Driver"
                        />
                     </View>
                        : <View>
                           {(this.state.selDriver) && <UtilChoice
                              onPress={() => { this.setState({ mode: MODES.DRIVER_ADD }) }}
                              text='Create Driver'
                           />}
                        </View>}

                  </View>
               </CdsScreen>
            )
            break;

         case MODES.DRIVER_UPDATE:
            return (
               <UpdateDriver driver={this.driverRec} driverId={this.state.selDriver} onBack={() => { this.setState({ mode: MODES.MAIN }) }} />
            )
            break;

         case MODES.CUST_MAIN:
            return (

               <CdsScreen>
                  {(this.state.applyMask) && <PrjBusyMask />}
                  <GCHeader
                     back={() => this.setState({ mode: MODES.MAIN })}
                     titleText='Customer Utilities'
                  />
                  <View style={{ height: 10 }} />
                  <GCText>{this.state.selCustId}</GCText>
                  <View style={{ height: 30 }} />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     <UtilInput label='Customer Id' field={this.state.selCustId}
                        onEndEditing={async (val) => {
                           this.setState({ applyMask: true }) //
                           this.setState({ selCustId: String(val) })
                           this.custRec = await dwdbfsCustGet(val)
                           this.setState({ applyMask: false }) //
                           if (!this.custRec) {
                              prjToast({
                                 text: `Customer id ${val} not found`,
                                 type: 'danger'
                              })
                           }
                        }} />
                     <View style={{ height: 10 }} />
                     <GCText>{this.state.custId}</GCText>
                     <View style={{ height: 30 }} />
                     {this.custRec && <View>
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.CUST_COUPONS }) }}
                           text="Customer Coupons"
                        />
                     </View>
                     }
                     {this.custRec && <View>
                        <UtilChoice
                           onPress={() => { this.setState({ mode: MODES.CUST_AVAIL_COUPONS }) }}
                           text="Available Coupons"
                        />
                     </View>
                     }

                  </View>
               </CdsScreen>
            )
            break;

         case MODES.CUST_COUPONS:
            //we cheat a bit here. Coupons key property ensures the component is mounted each time
            //  (thus re-reading the database)
            //and we just forceUpdate to re-render if we have deleted a coupon
            return (
               <Coupons
                  key={Math.random().toString()}
                  titleText={`Coupons for ${this.custRec.id}`}
                  init={async () => { return await dwdbfsCouponsGetForCustomer(this.custRec.id) }}
                  onBack={() => { this.setState({ mode: MODES.CUST_MAIN }) }}
                  onSelect={(coupon) => {
                     this.coupon = coupon //we HAVE TO save this for the onPress callback
                     Alert.alert(
                        "Confirm Delete",
                        "Delete this coupon?",
                        [
                           { text: "No", style: "cancel", },
                           {
                              text: "Yes",
                              onPress: async () => {

                                 await dwdbfsCouponsDelete(this.coupon); this.forceUpdate()
                              },
                           },
                        ],
                        { cancelable: false }
                     );
                  }}
               />
            )
            break;

         case MODES.CUST_AVAIL_COUPONS:
            return (
               <Coupons
                  key='avail'
                  titleText={`Available Coupons for ${this.custRec.id}`}
                  init={async () => { return await dwdbfsCouponsGetAvailable(this.custRec.shopId) }}
                  onBack={() => { this.setState({ mode: MODES.CUST_MAIN }) }}
                  onSelect={(coupon) => {
                     this.coupon = coupon //we HAVE TO save this for the onPress callback
                     Alert.alert(
                        "Confirm Add",
                        "Add this coupon?",
                        [
                           { text: "No", style: "cancel", },
                           {
                              text: "Yes",
                              onPress: async () => {
                                 let newCoupon = { ...this.coupon, custId: this.custRec.id }
                                 if (await dwdbfsCouponsAddNew(newCoupon)) { this.setState({ mode: MODES.CUST_COUPONS }) }
                              },
                           },
                        ],
                        { cancelable: false }
                     );
                  }}
               />
            )
            break;

         case MODES.SEARCH: return (
            <DsSearch navigation={this.props.navigation} onBack={() => { this.setState({ mode: MODES.MAIN }) }} />
         )
            break;

         default:
            return null
            break;

      }//end switch
   } //end render

} //end UtilTop

//prop init() to fill a coupons array
//titleText
//prop onSelect
class Coupons extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
      };
      this.coupons = []
   }

   async componentDidMount() {
      try {
         this.coupons = await this.props.init()
         // this.coupons = await dwdbfsCouponsGetAvailable(this.props.shopId)
      } catch (error) {
         cmnAlertPopup({ text: error.message })
      }
      this.setState({ isComponentInitialized: true })
   }

   render() {
      if (!this.state.isComponentInitialized) { return (null); }

      return (
         <CdsScreen>

            <GCHeader back={this.props.onBack} titleText={this.props.titleText} />
            <CstCouponList readonly
               coupons={this.coupons}
               onSelect={this.props.onSelect}
            />

         </CdsScreen >
      )
   }


}// end CstProfileCoupons
//prop onPress
//prop text
//prop disabled
class UtilChoice extends Component {

   constructor() {
      super();
      this.state = {
      };
   }

   render() {

      return (
         <ListItemXYZ>
            <TouchableOpacity
               onPress={this.props.onPress}
               disabled={this.props.disabled}>
               <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                  <GCText>{this.props.text}</GCText>
               </View>

            </TouchableOpacity>
         </ListItemXYZ>

      )
   }//end render
}//end UtilChoice

//prop shop
//prop shopId
//prop onBack()
class UpdatePriceList extends Component {
   constructor(props) {
      super(props);
      this.state = {
         priceList: null
      };
   }
   render() {
      return (
         <CdsScreen>
            <GCHeader back={this.props.onBack}
               titleText={'Update PriceList ' + this.props.shop.id}
            />


            <View style={{ flex: 1 }}>
               <TextInput
                  value={this.state.priceList}
                  multiline={true}
                  onChangeText={input => this.setState({ priceList: input })}
                  placeholder={"Enter Pricelist"}
                  style={styles.input}
               />
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     let foo = eval('new Object (' + this.state.priceList + ')')
                     foo.shopId = this.props.shopId
                     try {
                        await firestore().collection('PriceLists').doc(this.props.shopId).set({
                           ...foo
                        })
                        prjToast({
                           text: 'update done',
                           type: 'success'
                        })
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })

                     }
                  }} title="Update Pricelist" />
               </View>
            </View>
         </CdsScreen>
      );
   }
}

//prop shopId
//prop onBack()
//prop onSuccess()
class AddShop extends Component {
   constructor(props) {
      super(props);
      this.state = {
      };
   }
   render() {
      return (
         <CdsScreen>
            <GCHeader back={this.props.onBack}
               titleText={'Add Shop ' + this.props.shopId}
            />
            <View style={{ flex: 1 }}>
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        await firestore().collection('Shops').doc(this.props.shopId).set({
                           shopId: this.props.shopId
                        })
                        await firestore().collection('ShopTop').doc(this.props.shopId).set({
                           divider: 'A', lastAlloc: 0
                        })
                        this.props.onSuccess()
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })
                     }
                  }} title="ADD" />
               </View>
            </View>
         </CdsScreen>
      );
   }
}//end AddShop

//prop shop
//prop onBack()
class AddDemoRoutes extends Component {
   constructor(props) {
      super(props);
      this.state = {
         applyMask: false
      };
   }
   render() {
      return (
         <CdsScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            <GCHeader back={this.props.onBack}
               titleText={'Demo Routes ' + this.props.shop.id}
            />
            <View style={{ flex: 1 }}>
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        this.setState({ applyMask: true })
                        await this.generateRoutes(this.props.shop)
                        this.setState({ applyMask: false })
                        prjToast({
                           text: 'routes added',
                           type: 'success'
                        })
                        this.props.onBack()
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })
                     }
                  }} title="GENERATE" />
               </View>
            </View>
         </CdsScreen>
      );
   }
   async generateRoutes(shop) {
      switch (shop.id) {
         case 'DCassia1':
         case 'DCassia2':
            for (let i = 0; i < 30; ++i) {
               await this.makeRoute(shop, "between 9am - 10am", moment(9, 'hh').add(i, 'days').toDate(), true, true)
               await this.makeRoute(shop, "between 8pm - 9pm", moment(20, 'hh').add(i, 'days').toDate(), true, false)
            }
            break;
         case 'MYDodel':
            for (let i = 0; i < 30; ++i) {
               await this.makeRoute(shop, "Morning", moment(9, 'hh').add(i, 'days').toDate(), true, true, 30)
               await this.makeRoute(shop, "Afternoon", moment(12, 'hh').add(i, 'days').toDate(), true, false, 27)
               await this.makeRoute(shop, "Evening", moment(15, 'hh').add(i, 'days').toDate(), false, false, 24)
            }
            break;
         default:
            for (let i = 0; i < 30; ++i) {
               await this.makeRoute(shop, "Morning", moment(9, 'hh').add(i, 'days').toDate(), true, true)
               await this.makeRoute(shop, "Afternoon", moment(14, 'hh').add(i, 'days').toDate(), true, false)
               await this.makeRoute(shop, "Evening", moment(17, 'hh').add(i, 'days').toDate(), false, false)
            }
      }
   }

   //20231107 added procTimeReg which if set will 'force' delivery later than we would otherwise expect
   //  eg a 9 am pickup not delivered before 3 pm next day.
   //  only implemented for regular processing
   async makeRoute(shop, rteDescrip, schedDate, pickupExp, pickupSameDay, procTimeReg) {
      const newRouteRef = firestore().collection("ShopTop").doc(shop.id).collection("Routes").doc()
      await newRouteRef.set(
         {
            docId: newRouteRef.id,
            comboShopId: shop.comboShopId,
            shopId: shop.id,
            archive: false,
            descrip: rteDescrip,
            visibleToPublic: true,
            schedDate: schedDate,
            status: 'pending',
            statusDate: null,
            pickupExp: pickupExp,
            pickupSameDay: pickupSameDay,
            procTimeReg: procTimeReg,
            orders: {},
            transactions: {}
         })
   }// end makeRoute
}//end AddDemoRoutes


//prop shop
//prop onBack()
class DeleteRoutesAndOrders extends Component {
   constructor(props) {
      super(props);
      this.state = {
         applyMask: false
      };
   }
   render() {
      return (
         <CdsScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            <GCHeader back={this.props.onBack}
               titleText={'Delete Routes and Orders ' + this.props.shop.id}
            />
            <View style={{ flex: 1 }}>
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        this.setState({ applyMask: true })
                        await this.deleteRoutesAndOrders(this.props.shop)
                        this.setState({ applyMask: false })
                        prjToast({
                           text: 'all deleted',
                           type: 'success'
                        })
                        this.props.onBack()
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })
                     }
                  }} title="DELETE" />
               </View>
            </View>
         </CdsScreen>
      );
   }

   //catch is done by caller
   async deleteRoutesAndOrders(shop) {

      // //delete all routes
      const routes = await firestore().collection("ShopTop").doc(shop.id).collection("Routes").get()
      routes.forEach(async (doc) => {
         await doc.ref.delete()
      });
      const orders = await firestore().collection('Orders')
         .where('shopId', '==', shop.id)
         .get()
      orders.forEach(async (doc) => {
         await doc.ref.delete()
      });


   }

}//end deleteRoutesAndOrders

//prop shop
//prop onBack()
class PurgeRoutes extends Component {
   constructor(props) {
      super(props);
      this.state = {
         applyMask: false
      };
   }
   render() {
      return (
         <CdsScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            <GCHeader back={this.props.onBack}
               titleText={'Purge Routes ' + this.props.shop.id}
            />
            <View style={{ flex: 1 }}>
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        this.setState({ applyMask: true })
                        await this.purgeRoutes(this.props.shop)
                        this.setState({ applyMask: false })
                        prjToast({
                           text: 'empty routes purged',
                           type: 'success'
                        })
                        this.props.onBack()
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })
                     }
                  }} title="PURGE" />
               </View>
            </View>
         </CdsScreen>
      );
   }

   //catch is done by caller
   async purgeRoutes(shop) {

      // //purge all empty routes
      const routes = await firestore().collection("ShopTop").doc(shop.id).collection("Routes").get()
      let totalCount = 0
      let purgeCount = 0

      routes.forEach(async (doc) => {
         const data = doc.data();
         const orders = data.orders || {};
         if (Object.keys(orders).length == 0) {
            await doc.ref.delete()
         }
      }
      );
   }

}//end PurgeRoutes


//prop shop
//prop shopId //passed because this may be a new shop record that is totally empty
//prop onBack()
class UpdateShop extends Component {
   constructor(props) {
      super(props);
      this.state = {
         shopText: null
      };
   }
   render() {
      return (
         <CdsScreen>
            <GCHeader back={this.props.onBack}
               titleText={'Update Shop ' + this.props.shopId}
            />


            <View style={{ flex: 1 }}>
               <TextInput
                  value={this.state.shopText}
                  multiline={true}
                  onChangeText={input => this.setState({ shopText: input })}
                  placeholder={"Enter Shop Info"}
                  style={styles.input}
               />
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        let blob = this.state.shopText
                        let foo = eval('new Object (' + blob + ')')
                        await firestore().collection('Shops').doc(this.props.shopId).update({
                           ...foo
                        })
                        // await firestore().collection('Shops').doc(this.props.shopId).update({
                        //    priceList: eval('new Object (' + this.state.shopText + ')')
                        // })
                        prjToast({
                           text: 'update done',
                           type: 'success'
                        })
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           type: 'danger'
                        })

                     }
                  }} title="Update Shop" />
               </View>
            </View>
         </CdsScreen>
      );
   }
}




//prop shop
//prop onBack()
class Boundaries extends Component {
   constructor(props) {
      super(props);
      this.state = {
      };
   }
   render() {
      const shop = this.props.shop
      const boundary = shop.boundary
      return (
         <CdsScreen>
            <View style={{ flex: 1 }}>
               <GCHeader back={this.props.onBack}
                  titleText={'Boundaries for Shop ' + shop.id}
               />

               <View style={styles.mapContainer}>
                  <MapView
                     provider={PROVIDER_GOOGLE} //for ios
                     ref={component => this._map = component}
                     style={styles.map}
                     showsUserLocation={false}
                     showsMyLocationButton={false}
                     moveOnMarkerPress={false}
                     onPress={(e) => {
                        try {
                           const response = prjcmnInShopArea(e.nativeEvent.coordinate, shop)
                           if (response) { prjToast({ type: 'success', text: 'Point is inside area' }) }
                           else { prjToast({ type: 'warning', text: 'Point is outside area' }) }
                        } catch (error) {
                           prjAlert(error.message);
                        }

                     }}
                     initialRegion={prjcmnCalculateEnclosingMapRegionWithLocArray(boundary, null)}
                  >
                     <MapView.Polygon
                        coordinates={boundary}
                        fillColor="rgba(255, 0, 0, 0.25)"
                        strokeColor={'red'}
                     />

                  </MapView>
               </View >
            </View>
         </CdsScreen>
      );
   }
}

//prop shop
//prop shopId //passed because this may be a new shop record that is totally empty
//prop onBack()
class UpdateDriver extends Component {
   constructor(props) {
      super(props);
      this.state = {
         driverText: null
      };
   }
   render() {
      return (
         <CdsScreen>
            <GCHeader back={this.props.onBack}
               titleText={'Update Driver ' + this.props.driverId}
            />


            <View style={{ flex: 1 }}>
               <TextInput
                  value={this.state.driverText}
                  multiline={true}
                  onChangeText={input => this.setState({ driverText: input })}
                  placeholder={"Enter Driver Info"}
                  style={styles.input}
               />
               <View style={{ marginTop: 20 }}>
                  <Button onPress={async () => {
                     try {
                        let blob = this.state.driverText
                        let foo = eval('new Object (' + blob + ')')
                        await firestore().collection('Drivers').doc(this.props.driverId).update({
                           ...foo
                        })
                        // await firestore().collection('Shops').doc(this.props.shopId).update({
                        //    priceList: eval('new Object (' + this.state.shopText + ')')
                        // })
                        prjToast({
                           text: 'update done',
                           buttonText: 'okay',
                           duration: 5000,
                           type: 'success'
                        })
                     }
                     catch (error) {
                        prjToast({
                           text: error.message,
                           buttonText: 'okay',
                           duration: 5000,
                           type: 'danger'
                        })

                     }
                  }} title="Update Driver" />
               </View>
            </View>
         </CdsScreen>
      );
   }
}



//prop label
//prop field
class UtilInput extends Component {
   constructor(props) {
      super(props);
      this.state = {
      };
      ourValue: null
   }
   render() {
      return (
         <Item stackedLabel regular
            style={{
               backgroundColor: 'white',
               paddingLeft: 10,
               justifyContent: 'center',
               borderRadius: 10,
               elevation: 5
            }}
         >
            <Label style={{}}>{this.props.label}</Label>
            <Input
               defaultValue={this.props.field}
               style={{ justifyContent: 'center', alignItems: 'center', padding: 0, color: 'black' }}
               onChangeText={(val) => this.ourValue = val}
               onEndEditing={async () => await this.props.onEndEditing(this.ourValue)}
            />
         </Item>
      )
   }
}

// 20251111 change QR size to fit with A3+ paper size
//returns true iff successful
async function generateQRfile(howMany) {

   const urlBase = 'https://dobbywalla.com/?code='
   const orderBase = moment().format('YYYYMMDD.HHmmss')
   const logoUrl = "https://firebasestorage.googleapis.com/v0/b/dobby-ba6e8.appspot.com/o/textNoShadowDepthDarkLight.png?alt=media&token=64cde3ef-c115-47c9-aa2c-0c13598d5564";
   //WE DON'T THINK THAT ANY OF THIS CSS MATTERS ... ALL THAT MATTERS IS THE HEIGHT AND WIDTH IN convert
   let html = `<style>
@page {
//   size: A3 portrait;
  size: 329mm 483mm;
  margin: 20px;
}

body {
  margin: 0;
  padding: 0;
}

.page {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  width: 100%;
  height: 100%;
  page-break-after: always;
}

.qr-container {
  width: 20%;            
  margin: 1.4% 1.8%;           
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border-radius: 10px;
  box-sizing: border-box;
}

.qr-logo {
  width: 90%;
  height: auto;
  margin-top: 6px;
  margin-bottom: 4px;
  text-align: center;
}

.qr-border {
  width: 100%;
  aspect-ratio: 1 / 1;   /* ensures square shape */
  border: 3px solid #204e94;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.qr-border img {
  width: 90%;
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.qr-text {
  font-size: 18px;
  color: #204e94;
  font-weight: 600;
  text-align: center;
  margin-top: 6px;
  margin-bottom: 8px;
}
</style>`;
   let pageCount = 0
   html += '<div class="page">';

   for (let i = 1; i <= howMany; ++i) {
      const seqNum = orderBase + i;
      const url = urlBase + seqNum;
      const response = await RNQRGenerator.generate({
         value: url,
         base64: true,
         color: '#204e94'
      });
      const { base64: QRimage } = response;

      html += '<div class="qr-container">'

      html += `<div class="qr-logo"><img src="${logoUrl}" width="100%" /></div>`
      html += '<div class="qr-border">'
      html += `<img src="data:image/png;base64,${QRimage}" />`
      html += '</div>'
      html += '<div class="qr-text">YOUR NEW ORDER</div>'
      html += '</div>'

      pageCount++;
      if (pageCount % 20 === 0 && i < howMany) {
         html += '</div><div class="page">';  // Start a fresh A3 page
      }
   }
   html += '</div>'; // close last page

   //generate the pdf file ... it will generate a temporary file (path is available in pdf.filePath)
   let pdf
   try {
      const fileName = orderBase
      pdf = await RNHTMLtoPDF.convert({
         html,
         fileName: fileName,
         base64: true,
         // width: 841.89, //A3 peper size
         // height: 1190.55,
         width: 933.12, //A3 peper size
         height: 1368.12,
         padding: 0
      });
   } catch (err) {
      cmnAlertPopup({ title: 'Error Generating File', text: err.message })
      return false
   }

   // Upload to Firebase 
   try {
      const ref = storage().ref(`orderQrCodes/${orderBase}.pdf`); //
      await ref.putFile(pdf.filePath);
      const downloadURL = await ref.getDownloadURL();
      return true
   } catch (err) {
      cmnAlertPopup({ title: 'Error Storing File To Cloud', text: err.message })
      return false
   }

}

const styles = {
   input: {
      width: '90%',
      height: '50%',
      padding: 10,
      margin: 10,
      backgroundColor: "#FFF",
      borderColor: "#000",
      borderRadius: 0.5,
      borderWidth: 0.5
   },
   mapContainer: {
      flex: 1,
      paddingLeft: 0,
      paddingRight: 0,
      marginButtom: 0,
   },
   map: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
}
