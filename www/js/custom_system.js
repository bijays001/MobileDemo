/*
 * Licensed Materials - Property of IBM
 * 5725-I43 (C) Copyright IBM Corp. 2006, 2013. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

var selectProvider = {		
		ngnPrefixLength: '_ngn_'.length,
		
		select: function(ctx){
			var providerID = ctx.getNid().slice(this.ngnPrefixLength);
			var selectorObject = ctx.getApp().getGlobal('_ngn_selector');
			console.log('selectProvider select called ' + providerID);
			selectorObject.setProvider(providerID);
			return false; // do not process onClick event further
		}
};
