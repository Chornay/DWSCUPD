import React, { useState, useEffect } from 'react'
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
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'



//We will end up here if and only if a shop supports express or same day service.
//The express and same day options will appear only if configured for this shop

//on exit order fields will be set
//  serviceLevel regular, express, sameDay
//  serviceSurcharge %

//param order
export function CstCheckoutServiceLevel() {

    const navigation = useNavigation()
    //CLAUDE no null check on order .. destructuring below throws if the param is missing
    const { order = null } = useRoute().params ?? {};

    const [serviceLevel, setServiceLevel] = useState('regular')
    const [surchargePercent, setSurchargePercent] = useState(0)
    const [isComponentInitialized, setIsComponentInitialized] = useState(false)

    useEffect(() => {
        setServiceLevel(order.serviceLevel)
        setSurchargePercent(order.serviceSurchargePercent)
        setIsComponentInitialized(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, order is a stable route param
    }, [])

    const setLevel = (selected, surcharge) => {
        setServiceLevel(selected)
        setSurchargePercent(surcharge)
    }

    if (!isComponentInitialized) {
        return (
            <CstSpinnerScreen />
        );
    }
    const shop = CST.getShop()

    //CLAUDE -1 means 'not offered' .. should be a named constant (also in CstCheckout)
    //CLAUDE the service level strings 'regular', 'express', 'sameDay' should be named constants too
    return (

        <CstScreen>

            <GCHeader back cancel titleI18n='cstNEW.ServiceLevel' />

            <View style={{ flex: 1 }}>
                <Section selected={serviceLevel} onPress={setLevel} section='regular' surcharge={0} >
                    <GCI18n title code="cstNEW.RegularService" />
                    <GCText>{strX("cstNEW.OrderRequiresTimeReg", { hrs: order.procTimeReg })}</GCText>
                </Section>
                {shop.surchargeExpress != -1 &&
                    <Section selected={serviceLevel} onPress={setLevel} section='express' surcharge={shop.surchargeExpress}>
                        <GCI18n title code="cstNEW.ExpressService" />
                        <GCText>{strX("cstNEW.OrderRequiresTimeExp", { hrs: order.procTimeExp })}</GCText>
                        <GCText>{strX("cstNEW.SurchargeIsPercentExp", { percent: shop.surchargeExpress })}</GCText>
                    </Section>}
                {shop.surchargeSameDay != -1 &&
                    <Section selected={serviceLevel} onPress={setLevel} section='sameDay' surcharge={shop.surchargeSameDay}>
                        <GCI18n title code="cstNEW.SameDayService" />
                        <GCText>{strX("cstNEW.OrderRequiresTimeSameDay", { hrs: order.procTimeSameDay })}</GCText>
                        <GCText>{strX("cstNEW.SurchargeIsPercentSameDay", { percent: shop.surchargeSameDay })}</GCText>
                    </Section>
                }
            </View>

            <GCFooterWithSingleIcon
                code={"NEXT_IS_PICKUP"}
                onPress={() => {
                    order.serviceLevel = serviceLevel
                    order.serviceSurchargePercent = surchargePercent
                    prjUpdateOrderPricing(order) //reprice including surcharge
                    navigation.navigate('CstCheckoutSelectRoutePickup', { 'order': order })
                }} />

        </CstScreen >
    );

}// end CstCheckoutServiceLevel

//prop selected
//prop section
//prop surcharge
//prop onPress()
const Section = ({ selected, section, surcharge, onPress, children }) => {
    const active = selected == section
    const maybeHighlightStyle = ((active) ? styles.highlight : null)

    return (
        <TouchableOpacity
            disabled={active}
            onPress={() => onPress(section, surcharge)}
        >
            <View style={maybeHighlightStyle}>
                <View style={{ flexDirection: 'column', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                    {children}
                </View>
            </View>
        </TouchableOpacity>
    )
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