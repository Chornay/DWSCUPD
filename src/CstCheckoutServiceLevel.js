import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'

import { CstScreen } from './CdsScreen';
import CstSpinnerScreen from './CstSpinnerScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GCText, GCI18n } from 'DWcmn/Gc'
import { strX } from 'DWcmn/I18n';
import { COLORS } from 'DWcmn/Global'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CST } from './CST'



//We will end up here if and only if a shop supports express or same day service.
//The express and same day options will appear only if configured for this shop

//on exit order fields will be set
//  serviceLevel regular, express, sameDay
//  serviceSurcharge %

//param order
export default class CstCheckoutServiceLevel extends Component {


    constructor() {
        super();
        this.state = {
            serviceLevel: 'regular',
            surchargePercent: 0,
            isComponentInitialized: false,
        };
        this.order = null
    } //end constuctor


    componentDidMount() {

        this.order = this.props.navigation.getParam('order', null)

        this.setState({ serviceLevel: this.order.serviceLevel })
        this.setState({ surchargePercent: this.order.serviceSurchargePercent })
        this.setState({ isComponentInitialized: true });
    }

    render() {


        if (!this.state.isComponentInitialized) {
            return (
                <CstSpinnerScreen />
            );
        }
        let shop = CST.getShop()

        return (

            <CstScreen>

                <GCHeader back cancel titleI18n='cstNEW.ServiceLevel' />

                <View style={{ flex: 1 }}>
                    <Section selected={this.state.serviceLevel} onPress={this.setLevel} section='regular' surcharge={0} >
                        <GCI18n title code="cstNEW.RegularService" />
                        <GCText>{strX("cstNEW.OrderRequiresTimeReg", { hrs: this.order.procTimeReg })}</GCText>
                    </Section>
                    {shop.surchargeExpress != -1 &&
                        <Section selected={this.state.serviceLevel} onPress={this.setLevel} section='express' surcharge={shop.surchargeExpress}>
                            <GCI18n title code="cstNEW.ExpressService" />
                            <GCText>{strX("cstNEW.OrderRequiresTimeExp", { hrs: this.order.procTimeExp })}</GCText>
                            <GCText>{strX("cstNEW.SurchargeIsPercentExp", { percent: shop.surchargeExpress })}</GCText>
                        </Section>}
                    {shop.surchargeSameDay != -1 &&
                        <Section selected={this.state.serviceLevel} onPress={this.setLevel} section='sameDay' surcharge={shop.surchargeSameDay}>
                            <GCI18n title code="cstNEW.SameDayService" />
                            <GCText>{strX("cstNEW.OrderRequiresTimeSameDay", { hrs: this.order.procTimeSameDay })}</GCText>
                            <GCText>{strX("cstNEW.SurchargeIsPercentSameDay", { percent: shop.surchargeSameDay })}</GCText>
                        </Section>
                    }
                </View>

                <GCFooterWithSingleIcon
                    code={"NEXT_IS_PICKUP"}
                    onPress={() => {
                        this.order.serviceLevel = this.state.serviceLevel
                        this.order.serviceSurchargePercent = this.state.surchargePercent
                        prjUpdateOrderPricing(this.order) //reprice including surcharge
                        this.props.navigation.navigate('CstCheckoutSelectRoutePickup', { 'order': this.order })
                    }} />

            </CstScreen >
        );
    } //end render

    setLevel = (selected, surcharge) => {
        this.setState({ serviceLevel: selected })
        this.setState({ surchargePercent: surcharge })
    }

}// end CstCheckoutServiceLevel

//prop selected
//prop section
//prop surcharge
//prop onPress()
class Section extends Component {
    render() {
        const active = this.props.selected == this.props.section
        const backgroundColor = active ? COLORS.GC_SHADE_SELECTED : 'transparent'
        let maybeHighlightStyle = ((active) ? styles.highlight : null)

        return (
            <TouchableOpacity
                disabled={active}
                onPress={() => this.props.onPress(this.props.section, this.props.surcharge)}
            >
                <View style={maybeHighlightStyle}>
                    <View style={{ flexDirection: 'column', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                        {this.props.children}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    highlight: {
        backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: .1,
        elevation: 5,
        shadowRadius: .8,
    },
})
