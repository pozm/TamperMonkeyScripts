
function geturl(id) {
    return 'https://synapsesupport.io/agent/?id='+id
}

let id = arguments[0]
if (!id) return
let res = await $.get(geturl(id))

let domparser = new DOMParser()
let html = domparser.parseFromString(res,"text/html")

let dat = html.getElementsByClassName('section')[1]
let boxes= html.getElementsByClassName('box')

if (!dat) return 
let children = dat.children;

let Data = {}
Data.Id = children[3].firstElementChild.innerHTML
Data.User = children[4].firstElementChild.innerHTML
Data.Type = children[5].firstElementChild.innerHTML
Data.Status = children[6].firstElementChild.innerHTML
Data.Agent = 'Unknown'
Data.Responces = {Count : boxes.length, res : [] }

for (let boxi in boxes)
{

    let box = boxes[boxi]
    if (!box) continue;
    if (!box.firstElementChild) continue;
    if (box.firstElementChild.className != 'h5') continue;
    Data.Agent = box.firstElementChild.innerHTML != Data.User? box.firstElementChild.innerHTML : Data.Agent
    Data.Responces.res = [...Data.Responces.res, {Responder : box.firstElementChild.innerHTML, Message : box.lastElementChild.innerHTML} ]

}

return Data
