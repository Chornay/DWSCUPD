import React, { Component } from 'react'
import { View } from 'react-native'


import { DrvScreen } from './CdsScreen';
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'


import firestore from '@react-native-firebase/firestore';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';


import DsViewRouteTabOrders from './DsViewRouteTabOrders'
import DrvViewRouteTabMap from './DrvViewRouteTabMap'
import DsViewRouteTabSummary from './DsViewRouteTabSummary'
import DrvSpinnerScreen from './DrvSpinnerScreen'
import DrvRouteSettingsModal from './DrvRouteSettingsModal'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'
import { drvGenerateRouteDetailActions, drvProcessRouteAction } from './drvRouteActionProcessing';
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { prjRouteTimeFormatted } from 'DWcmn/PrjCmnFunctions'
import { cmnFilterOrders, cmnSortOrders } from 'DWcmn/CmnFunctionsFilterSort'
import { drvProcessRouteActionOnEvent } from './drvRouteActionProcessing'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { DRV } from './DRV'

//20201023 removed action property
//20230628 use PrjTabBar
//20250207 move back arrow up

//navigation param - routeDocId
//navigation param - routeName //DEPRECATED??
//navigation param - schedDate


//props  onExitRoute ??
export default class DrvViewRoute extends Component {

   constructor() {
      super();
      this.state = {
         route: null,
         orders: [],                        //array of all orders in route
         filteredOrders: [],                //array of only the orders to be displayed
         filterOrdersSetting: 'all',        //what orders do we want to see? -- all,pickup,delivery
         sortOrdersSetting: 'name',           //how to sort the orders? -- TODO
         isSettingsVisible: false,           //settings modal display flag
         waitingForRouteResult: true,
         isComponentInitialized: false,
         action: RouteActionEnum.noop,
         selectedTab: 0,
      };
      this.tabFields = [
         { key: 0, i18n: 'cmn.LIST' },
         { key: 1, i18n: 'cmn.MAP' },
         { key: 2, i18n: 'cmn.SUMMARY' },
      ]
   }// end constructor

   componentDidMount() {
      //ASSERT this.props.route != null

      const docId = this.props.navigation.getParam('routeDocId', null);
      const routeName = this.props.navigation.getParam('routeName', null)
      const schedDate = this.props.navigation.getParam('schedDate', null)

      // get the route
      this.unsubscribeRoute = firestore().collectionGroup("Routes").where("docId", "==", docId)
         .onSnapshot(this.getRoute, error => { cmnAlertPopup({ text: error.message }) });
      // find all the orders for this route
      this.unsubscribeOrders = firestore().collection("Orders").where("routesArray", "array-contains", docId)
         .onSnapshot(this.getOrders, error => { cmnAlertPopup({ text: error.message }) });
      //TODO not sorted??

      this.setState({ filterOrdersSetting: 'all' });
      this.setState({ sortOrdersSetting: 'name' });

      this.setState({ isComponentInitialized: true });
      //TODO disable back handler?
   }

   getRoute = (querySnapshot) => {
      let localRoute = dwdbfsRouteLoadSingleSnapshot(querySnapshot.docs[0])
      this.setState({ route: localRoute })
      this.setState({ waitingForRouteResult: false })
   } //end getRoute

   getOrders = (querySnapshot) => {
      //get the orders from db
      let localOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      this.setState({ orders: localOrders })

      //update the filtered (and sorted) array
      let localFilteredOrders = cmnFilterOrders(this.state.filterOrdersSetting, localOrders)
      cmnSortOrders(this.state.sortOrdersSetting, localFilteredOrders)
      this.setState({ filteredOrders: localFilteredOrders });
   } //end getOrders

   componentWillUnmount() {
      this.unsubscribeRoute && this.unsubscribeRoute();
      this.unsubscribeOrders && this.unsubscribeOrders();
   } //end componentWillUnmount

   render() {


      //we are not done until initialization is finished AND we have our first DB results
      //TODO do we really want to wait here for the DB ... or display empty columns with the spinner?
      if (!this.state.isComponentInitialized || this.state.waitingForRouteResult) {
         return (
            <DrvSpinnerScreen />
         );
      } //end if 

      const route = this.state.route;
      const readonly = route.status != RouteStatusEnum.open //Driver can only change when 'owns' the route.
      //TODO what should be readonly next ... we need to be able to open the route...
      const actions = drvGenerateRouteDetailActions(DRV.getId(), route)

      return (
         <DrvScreen>
            <DrvRouteSettingsModal isVisible={this.state.isSettingsVisible}
               onDone={() => { let foo = { isSettingsVisible: false }; this.setState(foo) }} //TODO WTF
               onSet={(x) => { this.setState(x) }}
            />
            {(this.state.action == RouteActionEnum.noop) ? null :
               drvProcessRouteAction(DRV.getId(), route, this.state.orders, this.state.action,
                  () => { this.setState({ action: RouteActionEnum.noop }) })}
            {/* HEADER SECTION */}
            <GCHeader back titleText={prjRouteTimeFormatted(route)}
               optionsBurger={() =>this.props.navigation.navigate('CdsShopBoundaries',{ 'shopId': route.shopId }) }
               
         // optionsBurger={() => this.setState({ isSettingsVisible: true })}
               />
            {/* <View style={{height:10}}/> */}
            {/* DATA SECTION (LIST OR MAP) */}
            <View style={{ flex: 1 }}>
               <PrjTabBar fields={this.tabFields}
                  selectedTab={this.state.selectedTab}
                  onPress={(index) => this.setState({ selectedTab: index })} />
               <View style={{ flex: 1, marginHorizontal: 10 }}>
                  {this.state.selectedTab == 0 && <DsViewRouteTabOrders orders={this.state.filteredOrders} readonly={readonly} />}
                  {this.state.selectedTab == 1 && <DrvViewRouteTabMap orders={this.state.filteredOrders} />}
                  {this.state.selectedTab == 2 && <DsViewRouteTabSummary route={route} orders={this.state.filteredOrders} />}
               </View>
            </View>

            <GCFooterForIcons>
               {actions.map((action, index) =>
                  <GCFooterCmdIcon
                     key={index}
                     code={getIconCodeForAction(action)}

                     onPress={() => {

                        if (!drvProcessRouteActionOnEvent(this.props.navigation, DRV.getId(), route, this.state.filteredOrders, action)) {
                           this.setState({ action: action })
                        }
                     }}
                  />
               )}
            </GCFooterForIcons>

         </DrvScreen >
      )
   } //end render

   onExitRoute = (item, action) => {
      // if (action == RouteActionEnum.close) {
      //     reallm.write(() => {
      //         item.ptr.status = 'close' //TODO wtf
      //         // item.ptr.status = RouteStatusEnum.completed.name
      //     })
      // }
      this.props.navigation.goBack();
   }   // end onExitRoute

} //end DrvViewRoute
