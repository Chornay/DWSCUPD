import React, { useState, useEffect } from 'react'
import { CstProfileShopSelect } from './CstProfileShopSelect'
import { CST } from './CST'

//20241112 fixed bug when no shop has been selected



//When a customer does not have a shop selected we don't allow them to make an order
//Instead on the main screen they are given a button to select a shop
//This component just 'wraps' the select shop component for navigation
//Shop select is usually done at signup or in profile screen

//nav parameter


export default function CstMainShopSelect(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false) //NOTE unused elsewhere - carried over as-is

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   return (
      <CstProfileShopSelect
         shop={null}
         user={CST.getCust()}
         onOkay={async () => {
            // //the customer DB has been updated with new shop id
            // //so update our copy in CST
            // //and update the shop in CST using the new id
            // CST.setCust(await dwdbfsCustGet(CST.getCustId()))
            // const newShopId = CST.getCust().shopId
            // CST.setShop( newShopId?await dwdbfsShopGet(newShopId):null)
            props.navigation.goBack()
         }}
         onCancel={() => {
            props.navigation.goBack()
         }}
      />

   )
}//end CstMainShopSelect