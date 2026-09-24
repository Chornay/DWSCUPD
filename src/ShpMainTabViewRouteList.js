import React, { Component } from 'react'
import { FlatList, View } from 'react-native'
import { withNavigation } from 'react-navigation';

import DsRouteTile from './DsRouteTile'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { GC_STD_MARGIN } from 'DWcmn/Global'

//20250220 use DsRouteTile

//prop routes (array)
class ShpMainTabViewRouteList extends Component {


   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
      };
   }

   componentDidMount() {
      this.setState({ isComponentInitialized: true });
   } //end componentDidMount

   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <ShpSpinnerScreen />
         );
      } //end if 

      return (
         <View style={{ marginHorizontal: GC_STD_MARGIN }}>
            <FlatList
               data={this.props.routes}
               renderItem={({ item }) => {
                  return (<DsRouteTile route={item} />)
               }}
               keyExtractor={(item, index) => index.toString()}
            >
            </FlatList>
         </View>
      )
   } //end render

} //end ShpMainTabViewRouteList

export default withNavigation(ShpMainTabViewRouteList);
