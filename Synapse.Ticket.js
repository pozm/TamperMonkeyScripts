let Settings = GM_getValue('SETTINGS');
let HeardReplies = {}
let settings = {} //deprecated

function TICKET_MAIN()
{

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
    if (WebsiteType) {
        var CheckForTickets = async (doc,newDoc) => {
            let ids       = []
            let responses = []
            //if (GetCurrentAgent() == 'nausea') return window.location.replace('https://cdn.discordapp.com/emojis/712412572133097614.gif?v=1')
            let newBoxes = []
            if (newDoc && WebsiteType)  newBoxes = [...newDoc.getElementsByClassName("columns is-mobile is-multiline")]
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

            if (Settings.notifications.NewTicket & neww.length == 1) {

                let id = neww[0]
                let box = getBoxFromId(id,newDoc)
                if (!box) return console.log('Unable to get box from id :'+id);
                let data = getDataFromBox(box)
                if (Settings.notifications.IgnoreTypes.includes( data.TicketType)) return;
                console.log('Ticket URL :',geturl(data.Id))
                if (Settings.autoClaim) $.get('https://synapsesupport.io/api/claim.php?id='+data.Id)
                GM_notification({title:'Synapse x',text:`New support ticket! ${data.Id} from ${data.User}${Settings.autoClaim ? ' And automatically claimed it!' : ''}`,onclick: () =>{ window.open(geturl(data.Id)) }, image:ImageUrl,timeout :7e3})
                console.log('New!')

            } else if (Settings.notifications.NewTicket & neww.length > 1) {


                console.log(`${neww.length} new tickets!`)
                GM_notification({title:'Synapse x',text:`There are ${neww.length} new tickets on the support website!`, image:ImageUrl,timeout :4e3})

            }
            
            if (Settings.notifications.Reply & responses.length == 1) {
                let id = responses[0]
                let box = getBoxFromId(id,newDoc)
                if (!box) return console.log('Unable to get box from id :'+id);
                let data = getDataFromBox(box)
/*                 let data2 = await GetData(id)
                if (HeardReplies[id] == data2.Responces.Count)
                HeardReplies[id] = data2.Responces.Count */
                console.log('sending notif')
                GM_notification({title:'Synapse x',text:`New reply from ${data.User}`,onclick: () =>{ window.open(geturl(data.Id)) }, image:ImageUrl,timeout :7e3})

            } else if (Settings.notifications.Reply & responses.length > 1) {

                GM_notification({title:'Synapse x',text:`There are ${responses.length} new replies on the support website!`, image:ImageUrl,timeout :4e3})

            }
            if (Settings.notifications.Close) 
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
    }
    //begin

    if (!GM_getValue('ran')) GM_notification({title:'Synapse x Script',text:`It seems like this is your first time using this script, make sure to enable refreshing to get notifications on new tickets.`,timeout :7e3})
    GM_setValue('ran',true)

    document.getElementsByClassName('content')[0].firstElementChild.after('Using pozm\'s tampermonkey script :)')// don't delete, atleast let me have some credit :(

    GM_addStyle(`
    
    .box.is-Settings {
        position: absolute;
        height: 50px;
        transform: translate(0px, 100px);
        z-index: 100;
        background: rgb(35,35,35);
        width: -webkit-fill-available;
        margin-left: 35%;
        margin-right: 35%;
        height: 800px;
        border-radius: 8px;
    }
    .box {
        background-color: #343c3d;
        border-radius: 2px;
        box-shadow: none;
        color: #fff;
        display: block;
        padding: 1.25rem;
    }
    legend {
        background-color: #000;
        color: #fff;
        padding: 3px 6px;
    }
    input {
        margin: .4rem;
    }
    .box.BlurAlll {
        -webkit-filter: blur(5px);
        -moz-filter: blur(5px);
        -o-filter: blur(5px);
        -ms-filter: blur(5px);
        filter: blur(5px);
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        z-index: 99;
        background-color: rgba(0, 0, 0, 0.75);
    }
    `)

    // temp Settings


    if (!Settings) 
    {
        Settings = {}
        Settings.uncapTickets = true
        Settings.locale = 'en-GB';
        Settings.refreshtimer = 10; 
        Settings.notifications = {NewTicket:true,Reply:true,Close:true, IgnoreTypes : ['Blacklist/Ban Appeal','Email Change Request']}
        GM_setValue('SETTINGS',Settings)
        console.log('Created new Settings.')
    }


    if (Settings.uncapTickets)
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


    //Settings ui
    let buts
    if (CheckForTickets)
    {buts = document.getElementsByClassName('level')[0].firstElementChild}
    let settingButton = document.createElement('button')
    settingButton.className = 'button'
    settingButton.textContent = 'Settings'

    settingButton.addEventListener('click',function() 
    {
        console.log(Settings)
        let settingsData = `
            <div class="box is-Settings">
                <button class="button is-danger is-outlined" style="margin-left: 96%;" id = "SettingClose"><span class="icon is-small">X</span></button>
                <div>
                    <div>
                        <input type="checkbox" id="UCT" name="uncapTickets" ${Settings.uncapTickets? 'checked' : ''}> 
                        <label for="UCT"> Uncap Tickets (allows for multiple tickets on one line)</label>
                    </div>
        
                <div>
                    <label for="Locale">Date/Time locale :</label>
                    <select id="Locale" name = "locale">
    
                        <option value="en-GB">Great Britain</option>
                        <option value="en-US">United States</option>
    
                    </select>
                </div>
                <div>
                    <label for="refreshtimer">Refresh timer :</label>
                    <input type="Number" id="refreshtimer" name="refreshtimer" min="10" max="60" value=${Settings.refreshtimer}>
                </div>
            
                <div>
                    <form>
                        <fieldset>
                            <legend>Notifications</legend>
            
                            <div>
                                <input type="checkbox" id="NewTicket" name="Notifications" ${Settings.notifications.NewTicket? 'checked' : ''}> 
                                <label for="NewTicket">Get notifications on new tickets</label>
                            </div>
                            <div>
                                <input type="checkbox" id="Reply" name="Notifications" ${Settings.notifications.Reply? 'checked' : ''}> 
                                <label for="Reply">Get notifications on Replies to claimed tickets</label>
                            </div>
                            <div>
                                <input type="checkbox" id="Close" name="Notifications" ${Settings.notifications.Close? 'checked' : ''}> 
                                <label for="Close">Get notifications on ticket closes (which you have claimed)</label>
                            </div>
                        </fieldset>
                    </form>
                </div>
    
            </div>
        </div>`
        let parsedsettings = (new DOMParser().parseFromString(settingsData,'text/html')).body.firstElementChild

        document.body.firstElementChild.before(parsedsettings)

        let blur = document.createElement('div')
        blur.className = 'box BlurAlll'
        document.body.firstElementChild.before(blur)

        console.log(parsedsettings)

        let sets = 
        {
            UCT:document.getElementById('UCT'),
            Locale:document.getElementById('Locale'),
            Refresh:document.getElementById('refreshtimer'),
            NewTickets:document.getElementById('NewTicket'),
            ReplyTicekts:document.getElementById('Reply'),
            CloseTickets:document.getElementById('Close'),
        }
        console.log(sets.Locale.options,Settings.locale)
        for (let v of sets.Locale.options) {
            if (v.value === Settings.locale) v.setAttribute('selected',null)
        }

        for (let seti in sets) 
        {

            let set = sets[seti]
            console.log(set)
            set.addEventListener('change', (event) =>
            {
                let newval = event.target.type === 'checkbox' ?event.target.checked:event.target.value
                console.log(event.target.name == 'Notifications' ? Settings.notifications : Settings[event.target.name],event.target.id,newval)
                if (event.target.name == 'Notifications') Settings.notifications[event.target.id] = newval; else Settings[event.target.name] = newval
                GM_setValue('SETTINGS',Settings)
                console.log(event.target.name == 'Notifications' ? Settings.notifications[event.target.id] : Settings[event.target.name],event.target.id,newval)

            })


        }

        document.getElementById('SettingClose').addEventListener('click',()=>
        {
            parsedsettings.cloneNode(true);
            blur.remove()
            parsedsettings.remove()
            window.location.reload();
        })

        console.log('Clicked!')

    })

    GM_setValue('CurrentAgent',GetCurrentAgent())

    buts.appendChild(settingButton)
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
    window.setInterval( UpdateBody, ( Math.max(10, Settings.refreshtimer )*1000) )
    window.setInterval( () => refreshing = false,2e3 )

    $('#toggleRefreshing').click(() => {GM_setValue('ref',!on); on = !on; console.log(on); document.getElementById('toggleRefreshing').innerHTML = on ? 'Turn off refreshing' : 'Turn on refreshing'})
    if (buts) {
        CheckForTickets(document)
    }
}
