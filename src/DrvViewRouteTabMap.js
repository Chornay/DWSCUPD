import React, { Component } from 'react'
import { View, Text, Button } from 'react-native'
import { Container } from 'native-base'
import { withNavigation } from 'react-navigation';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import MapViewDirections from 'react-native-maps-directions';
import GLOBALS from 'DWcmn/Global';
import {COLORS} from 'DWcmn/Global'
//GCimport Boundary, { Events } from 'react-native-boundary';
import DsOrderTile from './DsOrderTile'
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { PrjMapIcon } from 'DWcmn/Prj'
import { prjcmnCalculateEnclosingMapRegion } from 'DWcmn/prjcmnLocationFunctions'
import { prjCheckLocationPermission } from 'DWcmn/prjcmnLocationFunctions'
import { cmnOrderActiveLocation } from 'DWcmn/CmnFunctions'
import { PrjFab, PrjFabExpandable } from 'DWcmn/PrjFab'

// { latitude:43.803586, longitude:-79.401574} //Canada 4 elspeth
// { latitude:2.9222, longitude:101.6511} //Cyberjaya D'Pulze
// { latitude: 2.924773, longitude: 101.636602 }; //Cyberjaya Solstice

const GOOGLE_DIRECTIONS_APIKEY = 'AIzaSyCWJHXmu4XklJBidVN_zR-hFHzQp7q1hmA'; //new API
// AIzaSyAr8VjD3NVC3VV-s1D2BQbK-ztevP_qgNg in AndroidManifest.xml
//TODO set react-native-map-boundary for ios

//props orders  
class DrvViewRouteTabMap extends Component {

    constructor() {
        super();
        this.state = {
            isComponentInitialized: false,
            currPosition: null,     // contains latitude and longitude if we have location permissions
            displayOrder: null,     // if non-null, the order that is selected for 'tiled' display
            directionsMode: 'off',  // off=no directions displayed
            // pick=add/remove points
            // on=display directions
            fabActive: false,       // true iff the directions (F)loating (A)ction (B)utton is displayed
            pathIds: [],            // orderIds (with latitude,longitude) that are in the 'directions' path
            pathOrigin: null,       // where our optimized path starts, set when directions turned 'on'
            trackingMode: false,     // true iff we want to keep map centered on current location
            toggle: false,
        }
        this.watchId = null;
    } //end constructor

    //    Contents of the getCurrentPosition response
    //    "mocked":false,
    //    "timestamp":1568615012425,
    //    "coords":{  
    //       "speed":0,
    //       "heading":0,
    //       "accuracy":16,
    //       "altitude":-30.299999237060547,
    //       "longitude":90.4110053,
    //       "latitude":23.7732067
    //    }
    //TODO this sequence is not guaranteed
    async componentDidMount() {

        //check for location permission
        const granted = await prjCheckLocationPermission(true)

        //if no location permission, we are all done
        if (!granted) {
            this.setState({ isComponentInitialized: true })
            return
        }

        Geolocation.getCurrentPosition(
            (position) => {
                this.setState({ currPosition: position.coords })
                // this.setState({currPosition: {latitude:position.coords.latitude,longitude:position.coords.longitude}})
                this.setState({ isComponentInitialized: true })
            },
            (error) => {
                prjToast({ type: 'danger', text: error.message });
                this.setState({ currPosition: null })
                this.setState({ isComponentInitialized: true })
                // console.log (error)
            },
            { showLocationDialog: false, timeout: 15000, maximumAge: 10000 }
        );

        // this.watchId = Geolocation.watchPosition(
        //     (position) => {
        //         // console.warn("watch",position.coords.latitude,position.coords.longitude)
        //         this.setState({currPosition: {latitude:position.coords.latitude,longitude:position.coords.longitude}})
        //         if (this.state.trackingMode) {this._map.animateCamera({center:this.state.currPosition});}
        //         this.setState({ isComponentInitialized: true });            },
        //     (error) => {
        //         prjToast({type:'danger', text:error.message});
        //         this.setState({ currPosition:null })
        //         this.setState({ isComponentInitialized: true });            },
        //     { enableHighAccuracy: true, 
        //         distanceFilter: 10,  //minimum 10 meter change
        //         interval: 10000,    //10 seconds
        //         showLocationDialog:true //ask for location permission
        //      }
        // );


        // this.setState({ isComponentInitialized: true });//THIS IS DONE ABOVE

        // Boundary.on(Events.ENTER, id => {
        //     // Prints 'Get out of my Chipotle!!'
        //     console.log(`Get out of my ${id}!!`);
        // });

        // Boundary.on(Events.EXIT, id => {
        //     // Prints 'Ya! You better get out of my Chipotle!!'
        //     console.log(`Ya! You better get out of my ${id}!!`)
        // })
    } //end componentDidMount

    componentWillUnmount() {
        this.watchId && Geolocation.clearWatch(this.watchId)
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
        // console.log("position ",this.state.currPosition)


        //SOME NOTES ON STYLING
        //we want to use all the area to display the mapview until the user clicks on a marker
        //and then we steal .3 to display the order info
        //to do the the mapContainer View is flex:1. The MapView is 1 as well so that it fills when alone.
        //the order tile is .3 ... it seems like the flex algorithm steals that from the (1) of mapview.
        //MAPVIEW NOTES
        //  toolbarEnabled=false gets ride of some annoying Google buttons in bottom right corner
        //  moveOnMarkerPress don't move to marker when we are creating a direction path
        return (
            <Container>
                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE} //for ios
                        ref={component => this._map = component}
                        style={styles.map}
                        toolbarEnabled={false}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        moveOnMarkerPress={!(this.state.directionsMode == "pick")}
                        onPress={(e) => {
                            this.setState({ displayOrder: null })
                        }}
                        initialRegion={prjcmnCalculateEnclosingMapRegion(orders, this.state.currPosition)}>
                        {orders.map((order) => {
                            if (this.state.directionsMode == "pick") {
                                return (this.renderDirectionsMarker(order))
                            }
                            return (
                                <Marker
                                    coordinate={cmnOrderActiveLocation(order)}
                                    key={order.docId}
                                    onPress={(e) => { this.setState({ displayOrder: order }) }}
                                >
                                    <PrjMapIcon status={order.status}
                                        selected={this.state.displayOrder != null && order.docId == this.state.displayOrder.docId} />
                                </Marker>
                            );
                        } //end if 
                        )}

                        {/* display the optimized path connecting all the orders chosen */}
                        {(this.state.directionsMode == 'on') ?
                            <MapViewDirections
                                origin={this.state.pathOrigin}
                                destination={this.state.pathOrigin}
                                waypoints={this.state.pathIds}
                                optimizeWaypoints={true}
                                apikey={GOOGLE_DIRECTIONS_APIKEY}
                                strokeWidth={GLOBALS.DRIVER.PATH_WIDTH}
                                strokeColor={GLOBALS.DRIVER.PATH_COLOR}
                            /> : null}
                    </MapView>

                    {/* the button to expand the map to show all orders and current location */}
                    <PrjFabMapShowAll
                        onPress={() => {
                            this._map.animateToRegion(prjcmnCalculateEnclosingMapRegion(orders, this.state.currPosition), 1000);
                        }} />

                    {/* the button to enable/disable tracking of current position */}
                    {/* //TODO location tracking FAB removed for now */}
                    {/* <Fab
                        active={true}
                        containerStyle={{}}
                        style={[styles.fabButton, { backgroundColor: GLOBALS.DRIVER.FABSHOWALL_COLOR }]}
                        position="bottomLeft"
                        onPress={() => {
                            this.setState({trackingMode:!this.state.trackingMode})
                        }}>
                        <PrjIcon id="MAP_TRACKING" />
                    </Fab> */}

                    {/* iff selected, display an order at the bottom of the screen */}
                    {(this.state.displayOrder != null) ?
                        < DsOrderTile style={{ flex: .3 }} order={this.state.displayOrder} /> : null}

                    {/* display the FAB that does the selection of orders for routing */}
                    {this.renderDirectionsFab()}
                </View >

            </Container>
        )
    } //end render

    //renders the marker for an order when we are in the mode to pick items in a Directions path
    //it will be either a blank circle or the number of the place in the path
    //NOTE the order of the path does not matter, it is optimized
    renderDirectionsMarker = (order) => {
        const dspIndex = this.indexInPath(order.docId);
        const activeLocation = cmnOrderActiveLocation(order)
        return (
            <Marker
                coordinate={activeLocation}
                key={order.docId}
                onPress={() => {
                    let curIndex = this.indexInPath(order.docId);
                    if (curIndex == -1) { // not in path, add
                        this.state.pathIds.push({ id: order.docId, ...activeLocation }) //remember id is just to keep the map happy
                    }
                    else { //already in path, remove
                        this.state.pathIds.splice(curIndex, 1)
                    }
                    this.setState({ toggle: !this.state.toggle })
                }}>
                <View>
                    {(dspIndex == -1) ? <View style={[styles.pathMarker, { backgroundColor: GLOBALS.DRIVER.PATHPICK_COLOR_OFF }]} /> :
                        <View style={[styles.pathMarker, { backgroundColor: GLOBALS.DRIVER.PATHPICK_COLOR_ON }]}><Text>{dspIndex + 1}</Text></View>}
                </View>
            </Marker>
        )

    }//end renderDirectionMarker

    // returns array index if in path otherwise -1
    indexInPath = (id) => {
        for (let i = 0; i < this.state.pathIds.length; i++) {
            if (this.state.pathIds[i].id == id) {
                return (i)
            }
        }
        return -1;
    } //end indexInPath

renderDirectionsFab = () => {
    //NOTE used to be bottomright and up .. but got in the way of the tile
    return (
        <PrjFabExpandable
            position="topLeft"
            mainIcon="MAP_MARKER_PATH"
            mainColor={GLOBALS.DRIVER.FAB_COLOR_BUTTON}
            active={this.state.fabActive}
            onToggleMain={() => {
                if (this.state.currPosition == null) {
                    prjToast({ type: 'danger', i18n: "toast.drv.noLocNoPath" })
                }
                else {
                    this.state.fabActive && this.setState({ directionsMode: 'off' })
                    this.setState({ fabActive: !this.state.fabActive })
                }
            }}
            actions={[
                {
                    icon: "MAP_STOP",
                    color: GLOBALS.DRIVER.FAB_COLOR_STOP,
                    onPress: () => {
                        this.setState({ directionsMode: 'off' })
                        this.setState({ fabActive: !this.state.fabActive })
                    }
                },
                {
                    icon: "MAP_MARKER_PLUS",
                    color: GLOBALS.DRIVER.FAB_COLOR_PICK,
                    onPress: () => {
                        if (this.state.directionsMode == 'pick') {
                            this.setState({ pathIds: [] })
                        }
                        else {
                            this.setState({ directionsMode: 'pick' })
                        }
                    }
                },
                {
                    icon: "MAP_START",
                    color: GLOBALS.DRIVER.FAB_COLOR_START,
                    onPress: () => {
                        this.setState({ directionsMode: 'on' })
                        this.setState({ pathOrigin: this.state.currPosition })
                        this.setState({ fabActive: !this.state.fabActive })
                    }
                },
            ]}
        />
    )
}//end renderDirectionsFab
} //end DrvViewRouteTabMap

//prop onPress()
export const PrjFabMapShowAll = ({ onPress }) => (
  <PrjFab
    icon="MAP_SHOW_ALL"
    color={COLORS.GC_MAP_FAB_SHOWALL}
    position="topRight"
    onPress={onPress}
  />
);



const styles = {
    fabButton: {
        width: 40,
        height: 40,
        borderRadius: 400 / 2
    },
    fabChildButton: {
        width: 30,
        height: 30,
        borderRadius: 400 / 2
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
    mapHome: {
        position: 'absolute',
        bottom: 340,
        right: 10,
        width: 50,
        height: 50,
    },
    pathMarker: { //the marker used when selecting orders for a Directions path
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30 / 2,
        opacity: GLOBALS.DRIVER.PATHPICK_MARKER_OPACITY,
    }

}
export default withNavigation(DrvViewRouteTabMap);