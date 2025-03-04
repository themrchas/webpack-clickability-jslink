// This code handles the logic for the tabs functionality. 


import { createClickableField } from './clickabilityonly.js'

//The CSS for the tab feature 
import './tabs.css';


(function () {

     //Character used at the beginning of view names to delineate 'Admin' views
    const ADMIN_TAB_PREFIX = 'Ω';

    //Set the default number of view names to be displayed.  These will be wrapped up in tabs.
    const renderHeaderTemplateWithAllViewsMenu = (renderCtx, fRenderHeaderColumnNames) => {
            var viewData = eval(renderCtx.ListSchema.ViewSelectorPivotMenuOptions);
           // ClientPivotControl.prototype.SurfacedPivotCount = viewData.length -2; //display all View options except 'Create View' & 'Modify View'   
          
           //Display maximum of 5 views
           ClientPivotControl.prototype.SurfacedPivotCount = viewData.length = 5;    
           
            return RenderHeaderTemplate(renderCtx, fRenderHeaderColumnNames); //render default Header template
        }
	

    const createTabs = (ctx) => {
       
            //Create a webpart id string  Ex - ctx.view = {0C2A8944-BF00-4484-A16B-56FA8338DA1A} 
	        const webPartId = ctx.view.replace(/[{}]/g,'').toLowerCase();

            /* Determine if the view name begins with character of interest and if so add 
	        * the 'nshq-admin' class. This will cause the the view header to take on a different color 
            * than non special character view names.
	        */
	        if (ctx.viewTitle.startsWith(ADMIN_TAB_PREFIX))
		            document.querySelector('[webpartid="' + webPartId + '"]').classList.add("nshq-admin");

	        //Grab all of the view header tabs
	        let tabs = document.querySelectorAll('[class*="ms-pivotControl-surfacedOpt"');
	       

	        //Iterate over all tabs and add 'nshq-admin' class to any that begin with character of interest
	        tabs.forEach(item => {

		        if (item.innerHTML.startsWith(ADMIN_TAB_PREFIX))
			        item.classList.add("nshq-admin");
	        })

        }

 
    
    var overrideContext = {};

    overrideContext.Templates = {

        Header: renderHeaderTemplateWithAllViewsMenu

    };

    overrideContext.Templates.Fields = {

        //Use LinkTitle field for generic lists and LinkFileName for document libraries.
        
        LinkTitle: {
            'View': createClickableField
        },
        LinkFilename: {
            'View': createClickableField
        }

    }

    overrideContext.OnPostRender = (ctx) => {
      
        createTabs(ctx);
       
      /*  if (!ctx.inGridMode)
            removeBadgeColumn(); */
      }



    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideContext);



})();









