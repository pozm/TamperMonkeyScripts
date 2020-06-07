// ==UserScript==
// @name         Synapse support ticket master.
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Title
// @author       Pozm
// @updateURL    https://gist.githubusercontent.com/pozm/d93d87151890755b09f757c42cc2b411/raw/Synapse%2520x%2520ticket.js
// @downloadURL  https://gist.githubusercontent.com/pozm/d93d87151890755b09f757c42cc2b411/raw/Synapse%2520x%2520ticket.js
// @match        http*://*.synapsesupport.io/tickets/
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==

const refreshtimer = 10
const locale = 'en-GB'

// removes limit on showing how many boxes per line.
GM_addStyle ( `
    .container {
    max-width: max-content;
    }

    .column.is-one-third-desktop {
    flex: auto;
    width: auto;
    }

` );

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
    timed.groups.hours = timed.groups.hours == '12'? 0 : timed.groups.hours
    timed.groups.hours = timed.groups.meridian == 'PM'? parseInt(timed.groups.hours,10)+12 : parseInt(timed.groups.hours,10)
    let newtime = `${timed.groups.month} ${timed.groups.day} ${timed.groups.year} ${timed.groups.hours}:${timed.groups.minutes}:${timed.groups.seconds} GMT-0400`
    let timeparsed = new Date( Date.parse(newtime))
    let datestring = timeparsed.toLocaleString(locale)
    console.log(datestring,timeparsed)
    let time12h = tConvert(datestring.split(' ')[1] )
    let full = datestring.split(' ')[0] + ' ' + time12h
    element.innerHTML = full

}


//Tickets.
const CheckForTickets = () => {
    let ids   = {}
    let boxes = document.getElementsByClassName("columns is-mobile is-multiline")[0].children
    console.log(boxes)
    for (let box of boxes) {
        box = box.firstElementChild
        console.log(box)
        if (! box) continue;

        let id = box.children[0].innerHTML
        ids = {...ids,[id]:box}
        fixTIme( box.children[2].firstElementChild )
        fixTIme( box.children[3].firstElementChild )

    }

    console.log(ids)

    function geturl(id) {
        return 'https://synapsesupport.io/agent/?id='+id
    }

    let old = GM_getValue('ids')
    let bkup = ids
    let filtered = GM_getValue('ids').filter(v=> ids.indexOf(v) >= 0)
    let del = GM_getValue('ids').filter(v=>filtered.indexOf(v) == -1)
    let neww = ids.filter(v=>filtered.indexOf(v) == -1)
    if (neww.length == 1) {


        console.log('Ticket URL :',geturl(neww[0]))
        GM_notification({title:'Synapse x',text:`New support ticket! ${neww[0]}`,onclick: () =>{ window.open(geturl(neww[0])) }, image:'https://loukamb.github.io/SynapseX/LogoWhite.png',timeout :7e3})
        console.log('New!')

    } else if (neww.length > 1) {


        console.log(`${neww.length} new tickets!`)
        GM_notification({title:'Synapse x',text:`There are ${neww.length} new tickets on the support website!`, image:'https://loukamb.github.io/SynapseX/LogoWhite.png',timeout :7e3})

    }
    console.log('New : ',neww)
    console.log('Removed : ',del)

    let Rep = $( ".tag" );

    if (Rep.Length >= 1)
    {

        console.log(Rep[0].parent())

    }

    console.log(Rep)


    GM_setValue('ids',ids)
}

//refeshing

let on = GM_getValue('ref') ? GM_getValue('ref') : false


const UpdateBody = () => {
    console.log(on)
    if (!on) return
    console.log('updating..')
    document.cloneNode(true)
    $.get('https://synapsesupport.io/tickets/', (res,status) => {
        let domparser = new DOMParser()
        let html = domparser.parseFromString(res,"text/html")
        document.body = html.body
        console.log('Successfully updated.')
        document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'
        $('#toggleRefreshing').click(() => {GM_setValue('ref',!on); on = !on; console.log(on); document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'})
        CheckForTickets()
    })
}

$(function() {



    //Ticket refreshing fix

    document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'
    window.setInterval( UpdateBody, (refreshtimer*600) )
    window.setInterval( () => refreshing = false,2e3 )

    $('#toggleRefreshing').click(() => {GM_setValue('ref',!on); on = !on; console.log(on); document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'})

    CheckForTickets()
})