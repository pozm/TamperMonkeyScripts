// ==UserScript==
// @name         Synapse support ticket master.
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Title
// @author       Pozm
// @updateURL    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Redirect.js
// @downloadURL  https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Redirect.js
// @match        http*://*.synapsesupport.io/tickets/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Ticket.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==

/**
 * Settings 
 * @refreshtimer This is how oftern (in seconds) the website will update with the refreshing enabled.
 * @locale This is where you are, so en-US, en-GB, etc
 */
const refreshtimer = 4
const locale = 'en-GB'

$( () => {

    MAIN()

})