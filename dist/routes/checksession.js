"use strict";
function checksession(){
	if(req.session.userid && req.session.userid != '') 
		return true ;
	else 
		return false ;
}
//# sourceMappingURL=Index.js.map
