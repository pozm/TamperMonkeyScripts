// ==UserScript==
// @name         Synapse support ticket - AGENT master.
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Title
// @author       Pozm
// @updateURL    https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Agent.js
// @downloadURL  https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/Synapse.Agent.js
// @match        http*://*.synapsesupport.io/agent/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_notification
// ==/UserScript==



function AGENT_MAIN() 
{

    let tb
    let fixes

    function OnClick(obj)
    {


        let target = obj.target
        var caretPos = tb.selectionStart;
        var textAreaTxt = tb.value 
        var txtToAdd = fixes[target.innerHTML];
        tb.value  = textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos)
        tb.focus()

    }


    function clean() 
    {

        let boxes= document.getElementsByClassName('box')
        for (let boxi in boxes)
        {

            let box = boxes[boxi]
            if (!box.firstElementChild) continue;
            if (box.firstElementChild.className != 'h5') continue;
            box.firstElementChild.className = 'subtitle is-5'
            box.children[1].removeAttribute('class')
            fixTIme( box.children[1] )
            box.children[1].innerHTML = 'Posted on ' + box.children[1].innerHTML
            let hr = document.createElement('hr')
            hr.style.margin = '0.625rem 0'
            hr.style.height = '3px'
            box.children[1].after(hr)

        }

    }

    async function onload()
    {


        fixes = JSON.parse(await $.get("https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/SyanpseFixes.json"))


        console.log(fixes)

        let textbox = document.getElementById('querytext').parentElement
        tb = textbox.children[1].firstElementChild
        console.log(tb)
        tb.spellcheck = true
        console.log(textbox)
        let tags = document.createElement(`div`)
        tags.className = "buttons slight"
        for (let fix of Object.keys(fixes) ) {

            let button = document.createElement("button")
            button.className = "button is-dark"
            button.innerHTML = fix
            button.type = 'button'
            tags.appendChild(button)
            button.addEventListener("click",OnClick)


        }
        textbox.appendChild(tags)

    }

    function getId()
    {

        let page = document.getElementsByClassName("section")[1]
        return page.children[3].children[0].innerHTML

    }

    function getUser()
    {

        let page = document.getElementsByClassName("section")[1]
        return page.children[4].children[0].innerHTML

    }

    function claim() {
        let id = getId()
        console.log(id)
        $.get('https://synapsesupport.io/api/claim.php?id='+id, () =>
        {
            $.get(window.location.href, (res,status) => {
                let domparser = new DOMParser()
                let html = domparser.parseFromString(res,"text/html")
                document.body = html.body
                console.log('Successfully updated.')
                onload()
                document.title = id
            })

        })

    }
    // editing style.
    GM_addStyle(`
    .box {
        background-color: #343c3d;
        border-radius: 2px;
        box-shadow: none;
        color: #fff;
        display: block;
        padding: 1.25rem;
    }
    .subtitle.is-5 {
        font-size: 1.25rem;
        margin-bottom: 0px;
    }
    .buttons.slight {
        background-color: #0000004f;
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 1px;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        width: 99.60%;
        margin: auto;
        position: relative;
        top: -3px;
    }
    `);
    //done

    clean()
    let a = document.createElement("a");a.href = "https://synapsesupport.io/tickets/"
    let sel = document.getElementsByClassName("section")[1]
    sel.prepend(a)
    a.appendChild(sel.children[1])
    let buttons = document.getElementsByClassName("field is-grouped")[0]
    if (!buttons) return console.log('Ticket is closed!')
    let button = buttons.children[0]
    let newb = buttons.appendChild(button.cloneNode(true))
    let inner = newb.firstElementChild
    let id = getId()
    onload()
    document.title = id
    inner.setAttribute("type","button")
    inner.setAttribute("value","Claim")
    inner.setAttribute("class","button is-info")
    inner.addEventListener("click",claim)
}