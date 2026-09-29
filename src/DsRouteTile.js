import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'

import { withNavigation } from 'react-navigation';

import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'

import { GCText } from 'DWcmn/Gc'
import { PrjSpacer } from 'DWcmn/Prj';
import { RouteActionEnum } from 'DWcmn/Global'
import { prjRouteTimeFormatted } from 'DWcmn/PrjCmnFunctions'
import { cmnRouteStatusStr } from 'DWcmn/TypeCmnFunctions.js'
import { PrjIconForTileAction } from 'DWcmn/PrjIconComponents'
import { drvGenerateRouteTileActions, drvProcessRouteActionFromTile } from './drvRouteActionProcessing'
import { shpGenerateRouteTileActions, shpProcessRouteActionFromTile } from './shpRouteActionProcessing'
import GLOBALS from 'DWcmn/Global';
import { APP } from 'DWcmn/APP'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { COLORS } from 'DWcmn/Global'

//NOTE clicking on the body of the route will navigate to and RouteDetail screen with param 'route' set
//NOTE any action in the input array will be rendered as a button. Pressing the button will call the 
//     processAction property. processAction can return JSX or null. It should call the 
//     onDismiss method when it is done. 
//prop route

class DsRouteTile extends Component {

   constructor() {
      super();
      this.state = {
         action: RouteActionEnum.noop,
      };
   }

   render() {
      const appType = APP.getAppType();
      const id = APP.getId()
      const route = this.props.route;
      //generate the available actions
      const generateActions = (appType == 'shp') ? shpGenerateRouteTileActions : drvGenerateRouteTileActions
      const actions = generateActions(id, route.status)
      //select the proper method to process the actions
      const processAction = (appType == 'shp') ? shpProcessRouteActionFromTile : drvProcessRouteActionFromTile
      //select the proper method to process the action inside the OnPress
      //NOTE NO ACTIONS ON EVENT FOR A ROUTE TILE

      let countPickups = 0
      let countDeliveries = 0
      for (const key in route.orders) {
         switch (route.orders[key]) {
            case 'pickup': ++countPickups; break;
            case 'delivery': ++countDeliveries; break;
         }
      }

      // this.setState({ noteDisplayCount: order.notes.length })
      return (
         <View>
            {/* the method should handle any action .. then call the third parameter to finish */}
            {/* NOTE this may involve a modal */}
            {(this.state.action == RouteActionEnum.noop) ? null :
               processAction(route, this.state.action, () => { this.setState({ action: RouteActionEnum.noop }) })}

            {/* we would usually put in a flex:1 here BUT that seems to break our use at the bottom of maps. Sigh */}
            <View style={PRJ_STYLES.tile}>
               {/* Left hand box */}
               <ListItemGBC noBorder>
                  <ListItemLeft style={{ flex: .7 }}>
                     <View style={{ flex: 1, flexDirection: 'row' }}>
                        <TouchableOpacity
                           style={{ flex: 1 }}
                           onPress={() => {//TODO remove route param
                              this.props.navigation.navigate('ViewRoute',
                                 { 'route': route, 'routeName': route.name, 'schedDate': route.schedDate, 'routeDocId': route.docId });
                           }}>
                           <View style={{ alignItems: 'flex-start' }}>
                              <GCText title>{route.shopId}</GCText>
                              <PrjSpacer size={10} />
                              <GCText bold list>{prjRouteTimeFormatted(route)}</GCText>
                           </View>
                           <PrjSpacer size={10} />
                           <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row' }}>
                                 <GCText large bold color={GLOBALS.COLOR.TEXT_ERROR}>{countPickups}</GCText>
                                 <GCText style={{ paddingLeft: 5 }} large bold color={GLOBALS.COLOR.TEXT_ERROR}>pickups</GCText>
                              </View>
                              <View style={{ width: 10 }} />
                              <View style={{ flexDirection: 'row' }}>
                                 <GCText large bold color={GLOBALS.COLOR.TEXT_HILITE}>{countDeliveries}</GCText>
                                 <GCText style={{ paddingLeft: 5 }} large bold color={GLOBALS.COLOR.TEXT_HILITE}>deliveries</GCText>
                              </View>
                           </View>
                           <PrjSpacer size={10} />
                           <View style={{ alignItems: 'flex-start' }}>
                              <GCText list>{cmnRouteStatusStr(appType, route.status)}</GCText>
                           </View>
                        </TouchableOpacity>
                     </View>
                  </ListItemLeft>

                  {/* Right hand box */}
                  <ListItemRight style={{ flex: .3, paddingRight: 10 }}>
                     {this.props.readonly ? null :
                        <View style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
                           {actions.map((action, index) =>
                              <PrjIconForTileAction
                                 key={index}
                                 action={action}
                                 onPress={() => {
                                    this.setState({ action: action })
                                 }}
                              />
                           )}
                        </View>
                     }
                  </ListItemRight>
               </ListItemGBC>
            </View>
         </View>
      )
   }


}// end DsRouteTile
export default withNavigation(DsRouteTile)


