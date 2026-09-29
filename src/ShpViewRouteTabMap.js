import React, { Component } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, Dimensions, StyleSheet } from 'react-native'
import { withNavigation } from 'react-navigation';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import GLOBALS from 'DWcmn/Global';
//GCimport Boundary, { Events } from 'react-native-boundary';
import DsOrderTile from './DsOrderTile'
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { PrjMapIcon, PrjIconButton, PrjFabMapShowAll } from 'DWcmn/Prj'
import { prjcmnCalculateEnclosingMapRegion } from 'DWcmn/prjcmnLocationFunctions'
import { ShpScreen } from './CdsScreen';

//20250220 use DsOrderTile
//20250308 remove Shop from the map 

//TODO set react-native-map-boundary for ios

//prop orders
class ShpViewRouteTabMap extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         displayOrder: null,
      }
   } //end constructor

   componentDidMount() {
      // }
      // Boundary.on(Events.ENTER, id => {
      //     // Prints 'Get out of my Chipotle!!'
      //     console.log(`Get out of my ${id}!!`);
      // });

      // Boundary.on(Events.EXIT, id => {
      //     // Prints 'Ya! You better get out of my Chipotle!!'
      //     console.log(`Ya! You better get out of my ${id}!!`)
      // })
      this.setState({ isComponentInitialized: true });
   } //end componentDidMount

   componentWillUnmount() {
      // Remove the events
      // Boundary.off(Events.ENTER)
      // Boundary.off(Events.EXIT)

      // // Remove the boundary from native API´s
      // Boundary.remove('Chipotle')
      //     .then(() => console.log('Goodbye Chipotle :('))
      //     .catch(e => console.log('Failed to delete Chipotle :)', e))
   } //end componentWillUnmount

   render() {
      if (!this.state.isComponentInitialized) {
         //TODO spinner?
         return (null);
      }

      const orders = this.props.orders

      //SOME NOTES ON STYLING
      //we want to use all the area to display the mapview until the user clicks on a marker
      //and then we steal .3 to display the order info
      //to do the the mapContainer View is flex:1. The MapView is 1 as well so that it fills when alone.
      //the order tile is .3 ... it seems like the flex algorithm steals that from the (1) of mapview.
      return (
         <ShpScreen>
            <View style={styles.mapContainer}>
               <MapView
                  provider={PROVIDER_GOOGLE} //for ios
                  ref={component => this._map = component}
                  style={styles.map}
                  moveOnMarkerPress={false}
                  onPress={(e) => {
                     this.setState({ displayOrder: null })
                  }}
                  initialRegion={prjcmnCalculateEnclosingMapRegion(orders)}>
                  {orders.map((order) => {
                     return (
                        <Marker
                           coordinate={order.location}
                           key={order.docId}
                           onPress={(e) => {
                              this.setState({ displayOrder: order })
                           }}>
                           <PrjMapIcon status={order.status}
                              selected={this.state.displayOrder != null && order.docId == this.state.displayOrder.docId} />
                        </Marker>
                     );
                  } //end if 
                  )}
               </MapView>

               <PrjFabMapShowAll
                  onPress={() => {
                     this._map.animateToRegion(prjcmnCalculateEnclosingMapRegion(orders), 1000);
                  }} />

               {(this.state.displayOrder != null) ?
                  < DsOrderTile order={this.state.displayOrder} /> : null}
            </View >
         </ShpScreen>
      )
   } //end render
} //end ShpViewRouteTabMap



const styles = {
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
   fabButton: { //exact copy of drv version
      width: 40,
      height: 40,
      borderRadius: 400 / 2
   },

}
export default withNavigation(ShpViewRouteTabMap);