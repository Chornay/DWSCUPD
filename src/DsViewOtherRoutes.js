import React, { Component } from 'react'
import { FlatList, View, Text } from 'react-native'
// import DatePicker from 'react-native-date-picker'

import { DsScreen } from './CdsScreen'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import DsRouteTile from './DsRouteTile'
import firestore from '@react-native-firebase/firestore';
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { DS } from './DS'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { cmnCalendarDate } from 'DWcmn/CmnFunctions'
import { dsWarningScreenDoesNotUpdate } from './dsWarningScreenDoesNotUpdate'

import moment from 'moment';

//20250309 comboShop
//20250525 added "Screen Does Not Update"


//NOTE remember that we do NOT monitor the routes on this screen for changes

export default class DsViewOtherRoutes extends Component {

   constructor() {
      super();
      this.state = {
         startTimeAsMoment: moment(),
         pickDate: false,
         isComponentInitialized: false,
      };
      this.routes = [];
   }//end constructor

   //on mounting we set today's date and load routes
   async componentDidMount() {
      this.refreshRoutes(this.state.startTimeAsMoment)
      this.setState({ isComponentInitialized: true });
   }

   //refreshRoutes returns an array of all routes for the specified date (as a moment)
   //NOTE that we do not use the state variable startTimeAsMoment because it is sometimes set just before
   //     we call refreshRoutes (so is not guaranteed to be updated)
   async refreshRoutes(dateAsMoment) {

      const temp = moment(dateAsMoment)
      const startTime = temp.startOf('day').toDate()
      const endTime = temp.endOf('day').toDate()

      const localRoutes = []
      try {
         const querySnapshot = await firestore()
            .collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<", endTime)
            .orderBy('schedDate')
            .get();
         querySnapshot.forEach(snapshot => {
            localRoutes.push(dwdbfsRouteLoadSingleSnapshot(snapshot))
         })

         this.routes = localRoutes

      }
      catch (error) {
         cmnAlertPopup({ text: error.message }) //OK
      }
      this.setState({ isComponentInitialized: true });
   }

   render() {
      if (!this.state.isComponentInitialized) {
         return (
            <ShpSpinnerScreen />
         );
      } //end if 

      // <GCHeader back titleText={this.state.startTimeAsMoment.calendar().split(" at")[0]} />

      return (
         <DsScreen padding={10}>
            <GCHeader back titleText={cmnCalendarDate(this.state.startTimeAsMoment.toDate())} />
            <View style={{ flex: 1 }}>
               {/* <DatePicker
                  modal
                  mode='date'
                  open={this.state.pickDate}
                  date={this.state.startTimeAsMoment.toDate()}
                  onConfirm={async (date) => {
                     const dateAsMoment = moment(date)
                     await this.refreshRoutes(dateAsMoment)
                     this.setState({ startTimeAsMoment: dateAsMoment, pickDate: false })
                  }}
                  onCancel={() => this.setState({ pickDate: false })}

               /> */}
               <FlatList
                  data={this.routes}
                  renderItem={({ item }) => {
                     return (<DsRouteTile route={item} />)
                  }}
                  keyExtractor={(item, index) => index.toString()}
               >
               </FlatList>
               {dsWarningScreenDoesNotUpdate()}
            </View>
            <GCFooterForIcons>
               <GCFooterCmdIcon code="DATE_PREV"
                  onPress={async () => {
                     const temp = moment(this.state.startTimeAsMoment)
                     const dateAsMoment = temp.add(-1, 'day')
                     await this.refreshRoutes(dateAsMoment)
                     this.setState({ startTimeAsMoment: dateAsMoment })
                  }} />
               <GCFooterCmdIcon code="REFRESH"
                  onPress={async () => { await this.refreshRoutes(this.state.startTimeAsMoment) }} />
               {/* <GCFooterCmdIcon code="DATE" //BOMBS ON IOS
                  onPress={
                     () => { this.setState({ pickDate: true }) }
                  } /> */}
               <GCFooterCmdIcon code="DATE_NEXT"
                  onPress={async () => {
                     const temp = moment(this.state.startTimeAsMoment)
                     const dateAsMoment = temp.add(1, 'day')
                     await this.refreshRoutes(dateAsMoment)
                     this.setState({ startTimeAsMoment: dateAsMoment })
                  }} />
            </GCFooterForIcons>
         </DsScreen>
      )
   } //end render

} //end DsViewOtherRoutes
