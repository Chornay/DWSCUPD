import React, { Component } from 'react'
import { FlatList } from 'react-native'
import { withNavigation } from 'react-navigation';

import DsOrderTile from './DsOrderTile'

//prop orders (array)

class DsViewRouteTabOrders extends Component {


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
    //TODO spinner
    if (!this.state.isComponentInitialized) { //not finished our preparation yet
      return (null)
    }
    return (
      <FlatList
        data={this.props.orders}
        renderItem={({item}) => {
          return (
            <DsOrderTile order={item} />
          )
        }}
        keyExtractor={(item, index) => index.toString()}
      >
      </FlatList>
    )
  } //end render

} //end DsViewRouteTabOrders

export default withNavigation(DsViewRouteTabOrders);
