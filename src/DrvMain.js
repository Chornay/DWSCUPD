import React, { Component } from 'react'
import { View, FlatList } from 'react-native'


import DrvSpinnerScreen from './DrvSpinnerScreen'
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import { dwdbfsRouteLoadSnapshots } from 'DWcmn/DWDBfs'
import DsRouteTile from './DsRouteTile'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import DsViewOtherRoutes from './DsViewOtherRoutes';

import { DrvScreen } from './CdsScreen'
import GCHeader from 'DWcmn/GCHeader'
import { DRV } from './DRV'
import { DS } from './DS'
import { GCI18n } from 'DWcmn/Gc'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import SplashScreen from 'react-native-splash-screen'
import { GC_STD_MARGIN } from 'DWcmn/Global'

//20201023 no longer pass action to Route
//20230628 change to use PrjTabBar
//20250207 added QR scan button
//20250218 display just today's routes and add Other tab and implement refresh
//20250220 use DsRouteTile

export default class DrvMain extends Component {

   constructor() {
      super();
      this.state = {
         routes: [],
         isComponentInitialized: false, //not set until we get our first data
      };
   }

   componentDidMount() {
      // find all the routes for this driver
      this.refreshQuery()
      SplashScreen.hide()//have to do this in case we navigate right here without logo screen
   }

   refreshQuery() {
      // find all today's routes for this driver
      //TODO sort driver routes in creation time order .. decreasing (most recent first)
      try {
         const startTime = moment().startOf('day').toDate()
         const endTime = moment().endOf('day').toDate()
         this.unsubscribeRoutes && this.unsubscribeRoutes() //unsubscribe previous query if there
         this.unsubscribeRoutes = firestore().collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<=", endTime)
            .orderBy("schedDate")
            .onSnapshot(this.getRoutes, error => { prjAlert(error) });
      }
      catch (error) {
         prjAlert(error.message)
      }
   }//end refreshQuery


   //the changeListener will be invoked any time a change in the routes query is detected
   //we just reload the routes array state variable
   //NOTE this also loads our data the first time
   getRoutes = (querySnapshot) => {

      let localRoutes = dwdbfsRouteLoadSnapshots(querySnapshot)
      this.setState({ routes: localRoutes });

      //if this is the first time we have loaded data from the db
      if (!this.state.isComponentInitialized) { this.setState({ isComponentInitialized: true }); }

   } //end getRoutes


   componentWillUnmount() {
      this.unsubscribeRoutes && this.unsubscribeRoutes();
   } //end componentWillUnmount

   //show all available routes
   render() {
      //we are not done until initialization is finished AND we have our first DB results
      if (!this.state.isComponentInitialized || this.state.waitingForFirstQueryResult) {
         return (
            <DrvSpinnerScreen />
         );
      } //end if 


      //display routes, open route, wait for route
      else { //display routes, open route, wait for route
         return (
            <DrvScreen padding={10}>
               <GCHeader titleText={DRV.getId()} />
               {/* DATA SECTION */}
               <View style={{ flex: 1}}>
                  {this.displayList(this.state.routes)}
               </View>

               <GCFooterForIcons>
                  <GCFooterCmdIcon code="REFRESH"
                     onPress={async () => { this.refreshQuery() }} />
                  <GCFooterCmdIcon code="ROUTES"
                     onPress={() => this.props.navigation.navigate('DsViewOtherRoutes')
                     } />
                  <GCFooterCmdIcon code="SEARCH"
                     onPress={
                        () => { this.props.navigation.navigate('DsSearch') }
                     } />
                  <GCFooterCmdIcon code="SCAN_QR"
                     onPress={() => this.props.navigation.navigate('DsScanQrForOrder')} />
               </GCFooterForIcons>
            </DrvScreen >

         )
      }
   }// end render

   displayList = (routes) => {
      return (
         (routes.length == 0) ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <GCI18n code='cmnNEW.Waiting' />
            </View>
            : <FlatList
               data={routes}
               renderItem={({ item }) => {
                  return (<DsRouteTile route={item} />)
               }}
               keyExtractor={(item, index) => index.toString()}
            >
            </FlatList>
      )
   }

}// end class DrvMain
