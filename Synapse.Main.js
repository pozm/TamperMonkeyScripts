// ==UserScript==
// @name         Synapse support MAIN
// @homepage     https://github.com/pozm/TamperMonkeyScripts
// @version      3.2
// @description  Makes the synapse support website much better (for staff). most notable features are : notifications for (new tickets, replies, and claimed ticketed closes), quick claim , and quick responses on agent page
// @author       Pozm
// @updateURL    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Main.js
// @downloadURL  https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Main.js
// @match        http*://*.synapsesupport.io/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Funcs.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Ticket.js
// @require      https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Agent.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==


console.assert(TICKET_MAIN ?? AGENT_MAIN,'It seems that this tampermonkey script was installed incorrectly');
console.assert(settings,'It seems that this tampermonkey script was installed incorrectly')

const WebsiteType = window.location.href.match(/https:\/\/synapsesupport\.io\/(?<Type>agent|tickets)/).groups.Type

settings.uncapTickets = true     // uncaps the amount of tickets which can be viewed on a line.
settings.locale = 'en-GB';     // This is where you are, so en-US, en-GB, etc
settings.refreshtimer = 10;  // capped at 10, don't try going lower, it wont work.
settings.autoClaim = false // don't recommend enabling unless you want to get demoted.
settings.notifications = {NewTicket:true,Reply:true,Close:true, IgnoreTypes : ['Blacklist/Ban Appeal','Email Change Request']}
/**
 * @Newticket this is for when a new ticket is made. 
 * @Reply This is when you've claimed a ticket and the user has responded. 
 * @Close this is when one of your claimed tickets get closed (by the user, not you.)
 * @IgnoreTypes These are the ticket types which you will not get new ticket notifications for.
 */

$( () => {
    if (WebsiteType == 'tickets') return TICKET_MAIN()
    else if ( WebsiteType == 'agent' ) return AGENT_MAIN()
    console.log(window.location.href,WebsiteType)
    console.log('Wasn\'t able to match this page, contact pozm.')
})