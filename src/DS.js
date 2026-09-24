export class DS {
   static comboShopRec = null;

   static setComboShop(rec) { comboShopRec = rec }

   static getComboShopId() { return comboShopRec?.id }
   static getComboShopName() { return comboShopRec?.name }

}