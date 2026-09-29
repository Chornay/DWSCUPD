import React, { Component } from 'react'
import { TouchableOpacity, FlatList } from 'react-native'
import { View } from 'react-native'
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { CdsScreen } from './CdsScreen';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { COLORS } from 'DWcmn/Global'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { PrjSpacer } from 'DWcmn/Prj'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { isBlank } from 'DWcmn/PrjCmnFunctions'
import RadioButton from 'react-native-simple-radio-button-input';
import { strX } from 'DWcmn/I18n';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'

//20250712 changed the customer display to give more detail

const MODES = {
   MAIN: 0,
   DISPLAY_RESULTS: 10,
}

//key is the table name, value is the string to display on the screen
// const WHAT_TO_SEARCH = {
//    "Orders": "Order",
//    "Customers": "Customer",
//    "Route": "Route"
// }
const WHAT_TO_SEARCH = [
   "Orders",
   "Customers",
   "Route"
]

//TODO implement Route search
//key is the table name, value is an array of available keys 
const HOW_TO_SEARCH = {
   "Orders": ["name", "id", "phoneNumber", "address"],
   "Customers": ["address", "phoneNumber", "name", "id"],
   // "Route": ["pickup", "delivery"]
}

//want to translate the key (or table) name to something displayable
const DISPLAYABLE = {
   "address": "cmn.Address",
   "Customers": "cmnNEW.Customer",
   "delivery": "Delivery",
   "id": "cmnNEW.Id",
   "name": "cmn.Name",
   "Orders": "cmnNEW.Order",
   "phoneNumber": "cmn.Phone",
   "pickup": "Pickup",
   "Route": "cmnNEW.Route",
}

cnvText = (code) => {
   return strX(DISPLAYABLE[code])
}

//you can navigate here
//OR if you just display component you should pass 
// 1. navigation  ie navigation={this.props.navigation}
//2. an onBack method  eg onBack={()=>{this.setState({mode:MAIN})}}

export default class DsSearch extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         isSearchingInProgress: false,
         mode: MODES.MAIN,
         results: [], //results of the query .. could be from any of the tables.
         whatToSearch: 'Orders', //the 'table' to search, orders/customers/routes

      };
   }
   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {

      if (!this.state.isComponentInitialized) return null

      switch (this.state.mode) {

         case MODES.MAIN:
            //NOTE that if there is no onBack we want to set back prop to true to get default behaviour
            return (

               <CdsScreen>
                  <GCHeader back={this.props.onBack||true} titleText='Search' />
                  {this.state.isSearchingInProgress && <PrjBusyMask />}
                  {this.renderWhatToSearch()}
                  <PrjSpacer size={40} />
                  {this.renderHowToSearch()}
               </CdsScreen>
            )
            break;

         case MODES.DISPLAY_RESULTS:
            //display the contents of the results[] state variable (depending on whatToSearch)
            return (
               <CdsScreen>
                  <GCHeader
                     back={() => this.setState({ mode: MODES.MAIN })}
                     titleText='Results'
                  />
                  <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                     {this.state.results.length == 0 ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><GCText>No result found ...</GCText></View> :
                        <FlatList
                           data={this.state.results}
                           keyExtractor={(item, index) => index.toString()}
                           renderItem={({ item }) => {
                              switch (this.state.whatToSearch) {
                                 case 'Customers':
                                    return (
                                       <View>{this.renderCustomerItem(item)}</View>
                                    )
                                    break;
                                 case 'Orders':
                                    return (
                                       <View>{this.renderOrderItem(item)}</View>
                                    )
                                    break;
                                 case 'Routes':
                                    return (
                                       <View><GCText>Route</GCText></View>
                                    )
                                    break;
                              }
                           }} />
                     }
                  </View>
               </CdsScreen>
            )
            break;
         default:
            prjAlert('Invalid mode ' + this.state.mode + ' in search')
            return null
            break;

      }//end switch
   } //end render


   //user selects whether they want to look at Orders, Customers or Routes
   renderWhatToSearch = () => {
      return (
         <View style={{ paddingHorizontal: 20 }} >
            <GCText>Select an option</GCText>
            <PrjSpacer size={20} />
            {/* Map and display the selection of options*/}
            {WHAT_TO_SEARCH.map((table) => (
               // flexDirection row or formHorizontal={true}  doesn't work for some reasons
               <View key={table} style={styles.radioButton}>
                  <RadioButton
                     color={COLORS.GC_THEME_DARK}
                     selected={this.state.whatToSearch == table}
                     onPress={() => { this.setState({ whatToSearch: table }) }}
                  />
                  <View style={{ paddingLeft: 10 }}>
                     <GCText color={COLORS.GC_TEXT_GREY}> {cnvText(table)} </GCText>
                  </View>
               </View>
            ))}
         </View>
      )
   } //end renderWhatToSearch

   //user presses how they want to look up the chosen category 
   //  the TouchableEdit calls doSearch
   renderHowToSearch = () => {
      return (
         <View>
            <View style={{ paddingHorizontal: 20 }}>
               {/* Selection of search key...etc Name, ID, Phone, Address... */}
               <GCText>Select a search key</GCText>
               <FlatList
                  data={HOW_TO_SEARCH[this.state.whatToSearch]}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                     return (
                        <View style={{ paddingLeft: 10 }}>
                           <CmnTouchableEdit
                           titleText={"Enter " +cnvText(item)}
                           onCancel={()=>{}}
                           onOkay={(keyValue)=>{
                              this.doSearch(item,keyValue)
                           }}
                           >
                              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                                 <GCText color={COLORS.GC_TEXT_GREY}>{cnvText(item)}</GCText>
                              </View>

                           </CmnTouchableEdit>

                        </View>
                     )
                  }} />
            </View>
         </View>
      )
   } //end renderHowToSearch

   renderCustomerItemOLD = (cust) => {
      return (
         <TouchableOpacity
         // onPress={() => { this.props.navigation.navigate('OrderDetail', { 'id': order.id, }) }}
         >
            <View style={styles.searchTileContent}>
               <PrjSpacer size={10} />
               {/* Order id and date */}
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                  <View style={{ flexDirection: 'column' }}>
                     <GCText title >Name</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{cust.name}</GCText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText title >Address</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{cust.homeStop?.address}</GCText>
                  </View>
               </View>
            </View>
         </TouchableOpacity>
      )
   } //end renderCustomerItem

   renderCustomerItem = (cust) => {
      return (
         <TouchableOpacity
         // onPress={() => { this.props.navigation.navigate('OrderDetail', { 'id': order.id, }) }}
         >
            <View style={styles.searchTileContent}>
               <PrjSpacer size={10} />
        {this.formLine('cmn.Name', cust.name)}
        {this.formLine('cmnNEW.Id', cust.id)}
        {this.formLine('cmn.Address', cust.address)}
        {this.formLine('cmn.Phone', cust.phoneNumber)}
            </View>
         </TouchableOpacity>
      )
   } //end renderCustomerItem

   //copied from CmnIdList
  // left - an i18n tag for the name of the field to be displayed
  // right - the value of the field
  // styled - true iff the 'right' field is already styled
  formLine(left, right, styled = false) {
    const COL1 = .3
    const COL2 = .7
    return (
      <View>
        <ListItemGBC style={{ marginLeft: 0 }}>
          <View style={{ flex: COL1 }}><GCI18n code={left} /></View>
          {(styled) ? <View style={{ flex: COL2 }}>{right}</View> :
            <View style={{ flex: COL2 }}><GCText>{right}</GCText></View>}
        </ListItemGBC>
      </View>)
  }

   renderOrderItem = (order) => {
      return (
         <TouchableOpacity
            onPress={() => { this.props.navigation.navigate('OrderDetail', { 'id': order.id, }) }}
         >
            <View style={styles.searchTileContent}>
               <PrjSpacer size={10} />
               {/* Order id and date */}
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                  <View style={{ flexDirection: 'column' }}>
                     <GCText title >Order ID</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.id}</GCText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText title >Name</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.name}</GCText>
                  </View>
               </View>
               <PrjSpacer size={10} />
               {/* Name and Phone number */}
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                  <View style={{ flexDirection: 'column' }}>
                     {/* what address do we want to display here? */}
                     <GCText title >Address</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.pickupStop.code}</GCText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText title>Phone Number</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.phoneNumber}</GCText>
                  </View>
               </View>
               <PrjSpacer size={10} />
            </View>
         </TouchableOpacity>
      )
   } //end renderOrderItem

   doSearch = async (key, keyValue) => {

      //if not value specified, we just return
      if (isBlank(keyValue)) {
         return
      }
      let results = []
      let type = this.state.whatToSearch

      this.setState({isSearchingInProgress:true})
      switch (this.state.whatToSearch) {
         //for orders and customers we have the table name and key name for lookup
         case 'Orders':
         case 'Customers':
            let queryResult = await firestore().collection(this.state.whatToSearch)
            .where(key, ">=", keyValue)
            .where(key, "<=", keyValue+'z')
            .get()
            queryResult.forEach((doc) => {
               const foo = doc.data()
               results.push(foo)
            })
            this.setState({ results: results })
            this.setState({ mode: MODES.DISPLAY_RESULTS })
            break;
         case 'Routes':
            break;
         default:
            prjAlert('Invalid table specified in search')
            break;
      }
      this.setState({isSearchingInProgress:false})

   } //end doSearch
} //end DsSearch


const styles = {
   searchTileContent: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: 20,
      paddingVertical: 10
   },
   radioButton: {
      flexDirection: 'row',
      marginBottom: 15,
      paddingHorizontal: 20
   },
   textShadow: {
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: -1, height: 0 },
      textShadowRadius: 3.05, elevation: 4,
   }

}
