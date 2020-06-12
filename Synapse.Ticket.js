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
let HeardReplies = {}

function TICKET_MAIN()
{
    if (!settings.refreshtimer) settings.refreshtimer = 10;
    if (!settings.locale) settings.locale = 'en-US';

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
        let newBoxes = []
        if (newDoc)  newBoxes = [...newDoc.getElementsByClassName("columns is-mobile is-multiline")]
        let boxesb = [...doc.getElementsByClassName("columns is-mobile is-multiline")]
        if (newDoc) for (let newi in newBoxes) {boxesb[newi].parentNode.replaceChild(newBoxes[newi],boxesb[newi])}
        let boxes = newDoc? [...newBoxes[0].children,...newBoxes[1].children] : [...boxesb[0].children,...boxesb[1].children]
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
            if (settings.notifications.IgnoreTypes.includes( data.TicketType)) return;
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
            let data2 = await GetData(id)
            if (HeardReplies[id] == data2.Responces.Count)
            HeardReplies[id] = data2.Responces.Count
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

    if (!settings.notifications) settings.notifications = {NewTicket:true,Reply:true,Close:true,IgnoreTypes : ['Blacklist/Ban Appeal','Email Change Request']};
    else if (!settings.notifications.NewTicket) settings.notifications.NewTicket = true;
    else if (!settings.notifications.Reply) settings.notifications.Reply = true;
    else if (!settings.notifications.Close) settings.notifications.Close = true;
    else if (!settings.notifications.IgnoreTypes) settings.notifications.IgnoreTypes = ['Blacklist/Ban Appeal','Email Change Request'];


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