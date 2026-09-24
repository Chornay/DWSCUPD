import React, { Component } from 'react'

import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from 'DWcmn/Global'
import { GCText } from 'DWcmn/Gc'
import { PrjIcon } from 'DWcmn/PrjIconComponents';


//prop shop (not null)
//prop clickable (if we only have one shop then we may not want it to be de-selectable)
//prop selected if this shop has been selected
//prop onPress
export class CstShopTile extends Component {
    render() {
        let shop = this.props.shop
        let maybeHighlightStyle = (this.props.selected) ? styles.highlight : null
        return (
            <TouchableOpacity
                onPress={(e) => { this.props.onPress(shop.id) }}>
                <View style={maybeHighlightStyle}>
                    <View style={{ flexDirection: 'column', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <PrjIcon color={COLORS.GC_THEME_DARK} style={{ fontSize: 24 }} id={"STORE"} />
                            <GCText title>{shop.name.toString()}</GCText>
                        </View>
                        <GCText>{shop.dontDisplayAddress?"":shop.address.toString()}</GCText>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}//end class CstShopTile

const styles = StyleSheet.create({
    highlight: {
        backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: .1,
        elevation: 5,
        shadowRadius: .8,
    },

})
