// ==UserScript==
// @name         Synapse support ticket master.
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Title
// @author       Pozm
// @updateURL    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Redirect.js
// @downloadURL  https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Redirect.js
// @match        http*://*.synapsesupport.io/tickets/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==

// removes limit on showing how many boxes per line. you can remove this if you dislike.

let settings = {};

function TICKET_MAIN()
{
    if (!settings.refreshtimer) settings.refreshtimer = 10;
    if (!settings.locale) settings.locale = 'en-US';

    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

    // get time into groups.
    let timeregex = /(?<month>\d{2})-(?<day>\d{2})-(?<year>\d{4}) (?<hours>\d{2}):(?<minutes>\d{2}):(?<seconds>\d{2}) (?<meridian>AM|PM) (?<timezone>\w.)/m

    // convert from 24 to 12.
    function tConvert(time) {
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? ' AM' : ' PM';
            time[0] = +time[0] % 12 || 12;
        }
        return time.join('');
    }
    // fix the time to make it your timezone.
    function fixTIme(element)
    {


        let time = element.innerHTML
        let timed = time.match(timeregex)
        if (!timed) return
        timed.groups.hours = timed.groups.hours == '12'? 0 : timed.groups.hours
        timed.groups.hours = timed.groups.meridian == 'PM'? parseInt(timed.groups.hours,10)+12 : parseInt(timed.groups.hours,10)
        let newtime = `${timed.groups.month} ${timed.groups.day} ${timed.groups.year} ${timed.groups.hours}:${timed.groups.minutes}:${timed.groups.seconds} GMT-0400`
        let timeparsed = new Date( Date.parse(newtime))
        let datestring = timeparsed.toLocaleString(settings.locale)
        let time12h = tConvert(datestring.split(' ')[1] )
        let full = datestring.split(' ')[0] + ' ' + time12h
        element.innerHTML = full

    }

    function GetCurrentAgent() 
    {

        return document.getElementsByClassName('content')[0].firstElementChild.innerHTML.slice(14,-1).trim()
        
    }

    const getDataFromBox = (box) => 
    {

        let id = box.children[0].firstElementChild.innerHTML
        let User = box.children[0].childNodes[1].textContent.slice(3)
        let HasResponded = box.children[0].children[1] ? true : false
        let TicketType = box.children[1].lastElementChild.innerHTML
        let agent = box.children[4].lastElementChild.innerHTML

        let Opened = box.children[2].firstElementChild
        let LastUpdated = box.children[3].firstElementChild

        return {Id : id, User : User, TicketType: TicketType, Agent : agent, Opened : Opened, LastUpdate : LastUpdated, Responded : HasResponded}
    }
    const getBoxFromId = (id,doc) => {
        if (doc) doc.getElementById(id) ?? null

        return document.getElementById(id) ?? null

    }
    //Tickets.
    const CheckForTickets = async (doc,newDoc) => {
        let ids       = []
        let responses = []
        //if (GetCurrentAgent() == 'nausea') return window.location.replace('https://cdn.discordapp.com/emojis/712412572133097614.gif?v=1')
        let newBoxes 
        if (newDoc)  newBoxes = newDoc.getElementsByClassName("columns is-mobile is-multiline")[0]
        let boxesb = doc.getElementsByClassName("columns is-mobile is-multiline")[0]
        if (newDoc) boxesb.parentNode.replaceChild(newBoxes,boxesb)
        let boxes = newBoxes? newBoxes.children : boxesb.children

        for (let boxi in boxes) 
        {
            let box = boxes[boxi].firstElementChild
            if (! box) continue;
            let data = getDataFromBox(box)
            box.id = data.Id
            ids = [...ids,data.Id]
            if (data.Responded) responses = [...responses,data.Id]
            fixTIme( data.Opened )
            fixTIme( data.LastUpdate )
        }

        function geturl(id) {
            return 'https://synapsesupport.io/agent/?id='+id
        }
        if (!GM_getValue('ids')) GM_setValue('ids',ids)
        let filtered = GM_getValue('ids').filter(v=> ids.indexOf(v) >= 0)
        let del = GM_getValue('ids').filter(v=>filtered.indexOf(v) == -1)
        let neww = ids.filter(v=>filtered.indexOf(v) == -1)
        GM_setValue('ids',ids)
        const ImageUrl = "https://synapsesupport.io/static/synapselogonew_transparent_w.png"

        //Notifcations

        if (settings.notifications.NewTicket & neww.length == 1) {

            let id = neww[0]
            let box = getBoxFromId(id,newDoc)
            if (!box) return console.log('Unable to get box from id :'+id);
            let data = getDataFromBox(box)
            console.log('Ticket URL :',geturl(data.Id))
            if (settings.autoClaim) $.get('https://synapsesupport.io/api/claim.php?id='+data.Id)
            GM_notification({title:'Synapse x',text:`New support ticket! ${data.Id} from ${data.User}${settings.autoClaim ? ' And automatically claimed it!' : ''}`,onclick: () =>{ window.open(geturl(data.Id)) }, image:ImageUrl,timeout :7e3})
            console.log('New!')

        } else if (settings.notifications.NewTicket & neww.length > 1) {


            console.log(`${neww.length} new tickets!`)
            GM_notification({title:'Synapse x',text:`There are ${neww.length} new tickets on the support website!`, image:ImageUrl,timeout :4e3})

        }
        
        if (settings.notifications.Reply & responses.length == 1) {
            let id = responses[0]
            let box = getBoxFromId(id,newDoc)
            if (!box) return console.log('Unable to get box from id :'+id);
            let data = getDataFromBox(box)
            console.log('sending notif')
            GM_notification({title:'Synapse x',text:`New reply from ${data.User}`,onclick: () =>{ window.open(geturl(data.Id)) }, image:ImageUrl,timeout :7e3})

        } else if (settings.notifications.Reply & responses.length > 1) {

            GM_notification({title:'Synapse x',text:`There are ${responses.length} new replies on the support website!`, image:ImageUrl,timeout :4e3})

        }
        if (settings.notifications.Close) 
        {
            for (let Deleted of del) 
            {
                if (!GetData) return;
                let data = await GetData(Deleted)
                if (data.Agent == GetCurrentAgent() & data.ClosedBy != GetCurrentAgent())
                {
                    GM_notification({title:'Synapse x',text:`${data.User} Closed ${data.Id}`,onclick: () =>{ window.open(geturl(data.Id)) }, image:ImageUrl,timeout :7e3})
                }
            }
        }   
    }
    //begin
    if (!GM_getValue('ran')) GM_notification({title:'Synapse x Script',text:`It seems like this is your first time using this script, make sure to enable refreshing to get notifications on new tickets.`,timeout :7e3})
    GM_setValue('ran',true)

    document.getElementsByClassName('content')[0].firstElementChild.after('Using pozm\'s tampermonkey script :)')// don't delete, atleast let me have some credit :(

    if (settings.uncapTickets)
    {
        GM_addStyle(`
        .container {
            max-width: max-content;
        }

        .column.is-one-third-desktop {
            flex: auto;
            width: auto;
        }
        `);
    }

    if (!settings.notifications) settings.notifications = {NewTicket:true,Reply:true,Close:true};

    //refeshing
    let on = GM_getValue('ref') ? GM_getValue('ref') : false
    const UpdateBody = () => {
        console.log(on)
        if (!on) return
        console.log('updating..')
        $.get('https://synapsesupport.io/tickets/', (res,status) => {
            let domparser = new DOMParser()
            let html = domparser.parseFromString(res,"text/html")
            CheckForTickets(document,html)
        })
    }

    document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'
    window.setInterval( UpdateBody, ( Math.max(10, settings.refreshtimer )*1000) )
    window.setInterval( () => refreshing = false,2e3 )

    $('#toggleRefreshing').click(() => {GM_setValue('ref',!on); on = !on; console.log(on); document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'})

    CheckForTickets(document)

}