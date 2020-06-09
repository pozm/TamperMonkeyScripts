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
        var caretPos = tb[0].selectionStart;
        var textAreaTxt = tb.val();
        var txtToAdd = fixes[target.innerHTML];
        tb.val(textAreaTxt.substring(0, caretPos) + txtToAdd + textAreaTxt.substring(caretPos) );

    }


    async function onload()
    {


        fixes = JSON.parse(await $.get("https://raw.githubusercontent.com/pozm/TamperMonkeyScripts/master/SyanpseFixes.json"))


        console.log(fixes)

        let textbox = $('.field')[0]
        tb = $(".textarea").first()
        console.log(textbox)
        let tags = document.createElement(`div`)
        tags.className = "buttons"
        for (let fix of Object.keys(fixes) ) {

            let button = document.createElement("button")
            button.className = "button Quick-Select"
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

    let a = document.createElement("a");a.href = "https://synapsesupport.io/tickets/"
    let sel = document.getElementsByClassName("section")[1]
    sel.prepend(a)
    a.appendChild(sel.children[1])
    let buttons = document.getElementsByClassName("field is-grouped")[0]
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