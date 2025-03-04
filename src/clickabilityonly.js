/* This code handles the logic for the badge clickability functionality. */

//CSS for the badge clickability 
import './clickability.css';

/* This is the internal column name of the term set from which we want to create the clickability badges.
* Changing this value allows the clickability term set to be modified - this is the only change required to modify the code to point to a different term set.
*/
const termStoreInternalColumnName = "SOFCOMTags";
const termStoreDisplayName = "SOFCOM Tags";

//  Creates the clickable link field and adds the clickable badges to the link field.
export const createClickableField = (ctx, field, item, schema) => {

    let node = document.createElement('div');

    if (ComputedFieldWorker[ctx.CurrentFieldSchema.Name]) {
        node.innerHTML = ComputedFieldWorker[ctx.CurrentFieldSchema.Name](ctx, ctx.CurrentFieldSchema, ctx.CurrentItem, ctx.ListSchema);
    }
    else {
        let listSchema = Object.assign({}, ctx.ListSchema, { UseParentHierarchy: false });
        let currentFieldSchema = Object.assign({}, ctx.CurrentFieldSchema, { CalloutMenu: null, listItemMenu: null });
        node.innerHTML = renderFieldDefaultTemplate(ctx, currentFieldSchema, listSchema);
    }


    //If the item has tags assigned, create them and attach to the item
    if (item[termStoreInternalColumnName]) {

        let badges = item[termStoreInternalColumnName].map((item) => {

            let bgColor = StringToColour(item.Label);
            let fontColor = FontColorFromBackground(bgColor);

            return `\n<span class="clickabilityTag" onclick="badgeClicked(event)" style="background-color: ${bgColor}; color:${fontColor};">${item.Label}</span>`;

        })

        node.innerHTML += badges.join(' ');
    }

    return node.outerHTML;

} //createClickableField



/* Event handler for clicked badge.
 * Note that this is put in window scope.
 */
window.badgeClicked = (evt) => {
    ///console.log('badgeClicked: evt,evt);

    //View context 
    let ctx;

    //Grab the text associated with the clicked badge
    let badgeText = evt.target.innerText

    //Query parameter string associated with the search 
    let queryParameterString;

    //Grab the context ID of the item associated with badge that was just clicked
    let iid = evt.target.closest('[iid]')?.getAttribute('iid').split(',')[0];

    if (!window.g_ctxDict[`ctx${iid}`])
        console.log(`The context object window.g_ctxDict[ctx${iid}] either does not exist or cannot be accessed - no further processsing possible.`);
    else {

        //Get reference to current view context object
        ctx = window.g_ctxDict[`ctx${iid}`]

        /* For initial view load, ctx.queryString is empty '', otherwise it contains the query parameters used in previous 
        *  The previous search term is found as a query parameter in ctx.queryString
        *  Ex  - ctx.queryStrig = ".....?View={541BAF14-22F5-40FA-A1AF-08AF0E2789B6}&FilterField1=SOFCOMTags&FilterValue1=ACCI would mean that ACCI was the last filtered value
        */
        let previousQueryString = ctx.queryString;

       
        /* Grab the query parameters from the previous filter
        * Ex - View={541BAF14-22F5-40FA-A1AF-08AF0E2789B6}&FilterField1=SOFCOMTags&FilterValue1=ACCI
        * Ex - ?View={541BAF14-22F5-40FA-A1AF-08AF0E2789B6}&FilterField1=SOFCOMTags&FilterValue1=Budget#InplviewHash541baf14-22f5-40fa-a1af-08af0e2789b6=FilterField1%3DSOFCOMTags-FilterValue1%3DACCI
        */
        let previousFilterParameterString = previousQueryString.split('?')[1]?.split('#')[0];

        //Prepare query parameters for analysis. 
        let filterParams = new URLSearchParams(previousFilterParameterString);

        /* Iterate over the query parameter string values, attempting to determine if the badge value chosen/clicked exists among the query parameters.
        *  If it does, then the badge was clicked previously and the current index within the the query Parameters will be returned, so we will either display all items in the view or display a view displaying items belonging to a different badge value.
        *  Example of key/value pair in query string:  FilterValue1=DOC+
        * 
        * If index has a value of 0, the non-filtered list view will be rendered.
        * 
        * Example "?View={541BAF14-22F5-40FA-A1AF-08AF0E2789B6}&FilterField1=SOFCOMTags&FilterValue1=ACCI" would return index=2 when "ACCI" was previously clicked
        * 
        */
        let index = Array.from(filterParams.values()).findIndex((val) => val === badgeText);

        
        /* The badge clicked for the previous filter, so we want to display the default view without filtering.
        *  
        */
        if (index !== -1) {

            //Set index to value of 0 so the non-filtered list view will be rendered.
            index = 0;
        }
        else
            index = 1

        
        window.HandleFilterReal(evt, window.FilterFieldV3(ctx.view, window.escapeProperly(termStoreInternalColumnName), badgeText, index, queryParameterString, true));
        
    } //else


} //window.badgeClicked


 //Remove the managed metadata column that is providing the badge info.
 export const removeBadgeColumn = _ => {

    //Modify the DOM to remove the column used to provide terms for clickability badges 
    [termStoreInternalColumnName].forEach(function(name) {
        var header = document.querySelectorAll("[name=" + name + "]")[0].parentNode;
        var index = [].slice.call(header.parentNode.children).indexOf(header) + 1;

        //Hide the table header
        header.style.display = "none";

        for (var i = 0, cells = document.querySelectorAll("td:nth-child(" + index + ")"); i < cells.length; i++) {
            cells[i].style.display = "none";
        }
    });
} //removeBadgeColumn


function StringToColour(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = '#';
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }

    return colour;
}

function FontColorFromBackground(hexColor) {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (hexColor.length == 4) {
        r = "0x" + hexColor[1] + hexColor[1];
        g = "0x" + hexColor[2] + hexColor[2];
        b = "0x" + hexColor[3] + hexColor[3];
        // 6 digits
    } else if (hexColor.length == 7) {
        r = "0x" + hexColor[1] + hexColor[2];
        g = "0x" + hexColor[3] + hexColor[4];
        b = "0x" + hexColor[5] + hexColor[6];
    }

    // http://www.w3.org/TR/AERT#color-contrast
    const brightness = Math.round(((parseInt(r) * 299) +
        (parseInt(g) * 587) +
        (parseInt(b) * 114)) / 1000);

    return (brightness > 125) ? 'black' : 'white';
}
