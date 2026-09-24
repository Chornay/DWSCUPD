import React, { Component } from 'react'
import { FlatList, View, Text } from 'react-native'

import DsOrderTile from './DsOrderTile'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { GC_STD_MARGIN } from 'DWcmn/Global'

//props orders (all orders for this display)
//props itemDisplayByDefault

export default class ShpMainTabViewGeneric extends Component {

    constructor() {
        super();
        this.state = {
            isComponentInitialized: false,
        };
    }//end constructor

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
                <FlatList data={this.props.orders}
                    renderItem={({ item }) => {
                        return (
                            <DsOrderTile order={item} />
                        )
                    }}
                    keyExtractor={(item, index) => index.toString()}>
                </FlatList >
            </View>
        )
    } //end render

} //end ShpMainTabViewGeneric
