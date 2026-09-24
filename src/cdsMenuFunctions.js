//////////////////////////////////////////////////////////////////////////////////////////
//cdsExtractCategories

//select categories from the price list as selected
//returns a pricelist friendly object {isCategory:true, isTiled:true, entries: }
//NOTE that we are prepared to accept an empty/null entries array and return an empty array
export function cdsExtractCategories(entries, selector={}) {
    const { EZ, shop, options, normal = true } = selector
    let selected = []
    for (const entry of entries??[]) {
        if (entry.isCategory) {
            switch (entry.type) {
                case 'EZ': if (EZ) { selected.push(entry) } break
                case 'shop': if (shop) { selected.push(entry) } break
                case 'options': if (options) { selected.push(entry) } break
                default: if (normal) { selected.push(entry) } break
            }
        }
    }
    return (
        { isCategory: true, isTiled: true, entries: selected }
    )
}//end cdsExtractCategories


