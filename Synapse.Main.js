// ==UserScript==
// @name         Synapse support MAIN
// @namespace    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts
// @version      3.0
// @description  Title
// @author       Pozm
// @updateURL    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Main.js
// @downloadURL  https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Main.js
// @match        http*://*.synapsesupport.io/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Ticket.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Agent.js
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


console.assert(TICKET_MAIN ?? AGENT_MAIN,'It seems that this tampermonkey script was installed incorrectly');
console.assert(settings,'It seems that this tampermonkey script was installed incorrectly')
settings.uncapTickets = true // uncaps the amount of tickets which can be viewed on a line.
settings.locale = 'en-GB';
settings.refreshtimer = 10; // capped at 10, don't try going lower, it wont work.
settings.autoClaim = false // don't recommend enabling unless you want to get demoted.

$( () => {

    let WebType = window.location.href.match(/https:\/\/synapsesupport\.io\/(?<Type>agent|tickets)/).groups.Type

    if (WebType == 'tickets') return TICKET_MAIN()
    else if ( WebType == 'agent' ) return AGENT_MAIN()
    console.log(window.location.href,WebType)
    console.log('Wasn\'t able to match this page, contact pozm.')

})