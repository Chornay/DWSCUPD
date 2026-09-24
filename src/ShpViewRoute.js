import React, { Component } from 'react'
import { withNavigation } from 'react-navigation';
import { View } from 'react-native'


import { ShpScreen } from './CdsScreen';
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'


import firestore from '@react-native-firebase/firestore';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import DsViewRouteTabOrders from './DsViewRouteTabOrders'
import ShpViewRouteTabMap from './ShpViewRouteTabMap'
import DsViewRouteTabSummary from './DsViewRouteTabSummary'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { prjRouteTimeFormatted } from 'DWcmn/PrjCmnFunctions'

import { shpGenerateRouteDetailActions, shpProcessRouteAction } from './shpRouteActionProcessing'
import { cmnFilterOrders } from 'DWcmn/CmnFunctionsFilterSort'
import ShpRouteSettingsModal from './ShpRouteSettingsModal'

//20250207 moved back key up
//20250207 removed masses of commented code and compared to Drv
//20250207 removed 'withNavigation' .. Drv doesn't have it
//20250308 change to use the routes collectionGroup on docId

//navigation param - routeDocId
//navigation param - routeName //DEPRECATED??
//navigation param - schedDate
//navigation param - command //DEPRECATED
export default class ShpViewRoute extends Component {

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
      const route = this.props.navigation.getParam('route', null);
      const routeName = this.props.navigation.getParam('routeName', null)
      const schedDate = this.props.navigation.getParam('schedDate', null)
      //TODO ASSERT route != null

      // get the route
      this.unsubscribeRoute = firestore().collectionGroup("Routes").where("docId", "==", docId).onSnapshot(this.getRoute);
      // find all the orders for this route
      this.unsubscribeOrders = firestore().collection("Orders").where("routesArray", "array-contains", docId).onSnapshot(this.getOrders);
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
      // TODO example cmnSortOrders(this.state.sortOrdersSetting, localFilteredOrders)
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
            <ShpSpinnerScreen />
         );
      } //end if 

      const route = this.state.route;
      const readonly = false; //TODO do we want this flag?
      const actions = shpGenerateRouteDetailActions(route.status)

      return (
         <ShpScreen>
            <ShpRouteSettingsModal isVisible={this.state.isSettingsVisible}
               onDone={() => { let foo = { isSettingsVisible: false }; this.setState(foo) }}
               onSet={(x) => { this.setState(x) }}
            />
            {(this.state.action != RouteActionEnum.noop) &&
               shpProcessRouteAction(route, this.state.orders, this.state.action,
                  () => { this.setState({ action: RouteActionEnum.noop }) })}
            {/* HEADER SECTION */}
            <GCHeader back titleText={prjRouteTimeFormatted(route)}
               optionsBurger={() => this.setState({ isSettingsVisible: true })}
            />
            {/* <View style={{height:10}}/> */}
            {/* DATA SECTION (LIST OR MAP) */}
            <View style={{ flex: 1 }}>
               <PrjTabBar fields={this.tabFields}
                  selectedTab={this.state.selectedTab}
                  onPress={(index) => this.setState({ selectedTab: index })} />
               <View style={{ flex: 1, marginHorizontal: 10 }}>
                  {this.state.selectedTab == 0 && <DsViewRouteTabOrders orders={this.state.filteredOrders} />}
                  {this.state.selectedTab == 1 && <ShpViewRouteTabMap orders={this.state.filteredOrders} />}
                  {this.state.selectedTab == 2 && <DsViewRouteTabSummary route={route} orders={this.state.filteredOrders} />}
               </View>
            </View>

            {/* FOOTER SECTION  contains any action buttons for the current status */}
            <GCFooterForIcons>
               {actions.map((action, index) =>
                  <GCFooterCmdIcon
                     key={index}
                     code={getIconCodeForAction(action)}

                     onPress={() => {

                        //   if (cstCmnProcessImmmediateAction(this.props.navigation, order, action)){
                        //     // this.setState({ action: OrderActionEnum.noop }) //nothing further to do
                        //  }
                        //  else {this.setState({ action: action }) }} //handle command in modal
                        // }
                        this.setState({ action: action })
                     }} //handle command in modal
                  />
               )}
            </GCFooterForIcons>

         </ShpScreen >

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

} //end ShpViewRoute
