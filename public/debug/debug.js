const request_container = document.querySelector('requests')

const request_type = document.getElementById('request_type')
const url = document.getElementById('url')
const path = document.getElementById('path')
const hostname = document.getElementById('hostname')
const ip = document.getElementById('ip')
const query = document.getElementById('query')
const params = document.getElementById('params')
const protocol = document.getElementById('protocol')
const userAgent = document.getElementById('userAgent')
const referer = document.getElementById('referer')
const headers = document.getElementById('headers')
const body = document.getElementById('body')
const important = document.getElementById('important')

function prettyDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString( {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

document.addEventListener('click', (event) => {
    if(!event.target.classList.contains('request_element') && document.querySelector('requests').classList.contains('active')){
        document.querySelector('requests').classList.toggle('active')
        document.querySelector('request-selector').classList.toggle('open')
    }
})

document.addEventListener('animationend', (event) => {
    if(event.target.classList.contains('deleted')){
        event.target.remove()
    }
})

async function loadDebugData(){
    let debugData = await fetch('/debugdata')
    debugData = await debugData.json();
    debugData.forEach((request_file) => {
        let request_file_element = document.createElement('request_file')
        
        let fileName = request_file.split('_')[0]
        let fileID = request_file.split('_')[1]

        let fileDate = prettyDate(fileID.split('.json')[0])
        let request_file_html = `<span class="request_element" >${fileName} | ${fileDate}</span><svg class="trashcan request_element" onclick="this.parentElement.classList.add('deleted'); fetch('/request', {method: 'DELETE',headers: {'Content-Type': 'application/json'},body: JSON.stringify({id: '${request_file}'}, null, 2)})" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#d93434" d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2zM7 6v13z"/></svg>`
        request_file_element.innerHTML = request_file_html;
        request_file_element.id = fileID;
        request_file_element.classList.add('request_element')
        request_file_element.onclick = (async (e) => {
        document.querySelector('debugdata').classList.remove('hidden')
        if(e.target.classList.contains('trashcan')){
            return
        }
        const data = await fetch(`/request/${request_file}`);
        const json = await data.json();
        const parsedJson = JSON.parse(json);
        if(parsedJson.important.method == "GET"){
            body.textContent = "GET Requests don't have bodies!"
            body.style.color = "var(--seaside-50)"

        }
        else{
            if(parsedJson.body != null && parsedJson.body.length != 0){
                let arrayInfoElement = document.createElement('debuglistitem');
                arrayInfoElement.textContent = '['
                body.textContent = ''
                body.appendChild(arrayInfoElement.cloneNode(true))
                for (var prop in parsedJson.body) {
                    if (Object.prototype.hasOwnProperty.call(parsedJson.body, prop)) {
                            arrayInfoElement.innerHTML = `<span style="color: var(--primary)">${prop}:</span> ${parsedJson.body[prop]} `
                            body.appendChild(arrayInfoElement.cloneNode(true))
                    }
                }
                arrayInfoElement.textContent = ']'
                body.appendChild(arrayInfoElement.cloneNode(true))
            }
            else{
                body.style.color = "var(--danger)"
                body.textContent = "Server failed to parse your request body, double check your headers!"
            }
            if(body.children.length == 2){
                body.style.color = "var(--danger)"
                body.textContent = "Server failed to parse your request body, double check your headers!"
            }
        }

        if(parsedJson.important != null){
            let info = parsedJson.important
            request_type.textContent = info.method + " Request"
            hostname.textContent = info.hostname
            ip.textContent = info.ip
            url.textContent = info.url
            path.textContent = info.path

            if(info.query != null && info.query.length != 0){

                let arrayInfoElement = document.createElement('debuglistitem');
                
                arrayInfoElement.textContent = '['
                query.textContent = ''
                query.appendChild(arrayInfoElement.cloneNode(true))
                for (var prop in info.query) {
                    if (Object.prototype.hasOwnProperty.call(info.query, prop)) {
                            arrayInfoElement.innerHTML = `<span style="color: var(--primary)">${prop}:</span> ${info.query[prop]} `
                            query.appendChild(arrayInfoElement.cloneNode(true))
                    }
                }
                arrayInfoElement.textContent = ']'
                query.appendChild(arrayInfoElement.cloneNode(true))
            }
            else{
                query.style.color = "var(--warning)"
                query.textContent = "No query found in the request URL."
            }
            if(query.children.length == 2){
                query.style.color = "var(--warning)"
                query.textContent = "No query found in the request URL."
            }


            if(info.params != null && info.params.length != 0){
                let arrayInfoElement = document.createElement('debuglistitem');
                arrayInfoElement.textContent = '['
                params.textContent = ''
                params.appendChild(arrayInfoElement.cloneNode(true))
                for (var prop in info.params) {
                    if (Object.prototype.hasOwnProperty.call(info.params, prop)) {
                            arrayInfoElement.innerHTML = `<span style="color: var(--primary)">${prop}:</span> ${info.params[prop]} `
                            params.appendChild(arrayInfoElement.cloneNode(true))

                    }
                }
                arrayInfoElement.textContent = ']'
                params.appendChild(arrayInfoElement.cloneNode(true))
            }

                else{
                    params.style.color = "var(--warning)"
                    params.textContent = "No route parameters found in the request URL."
                }

                if(params.children.length == 2){
                   params.style.color = "var(--warning)"
                   params.textContent = "No query found in the request URL."
                }

                protocol.textContent = info.protocol
                userAgent.textContent = info.userAgent
                referer.textContent = info.referer
                if(info.headers != null && info.headers.length != 0){
                    headers.textContent = ''
                    let arrayInfoElement = document.createElement('debuglistitem');
                    arrayInfoElement.textContent = '['
                    headers.appendChild(arrayInfoElement.cloneNode(true))
                    for (var prop in info.headers) {
                        if (Object.prototype.hasOwnProperty.call(info.headers, prop)) {
                                arrayInfoElement.innerHTML = `<span style="color: var(--primary)">${prop}:</span> ${info.headers[prop]} `
                                headers.appendChild(arrayInfoElement.cloneNode(true))

                        }
                    }
                    arrayInfoElement.textContent = ']'
                    headers.appendChild(arrayInfoElement.cloneNode(true))
                }
                else{
                    headers.style.color = "var(--warning)"
                    headers.textContent = "No headers found for this request."
                }
                if(headers.children.length == 2){
                  
                   query.style.color = "var(--warning)"
                   query.textContent = "No query found in the request URL."
                }

               

            }
        else{
            important.style.color = "var(--danger)"
            important.textContent = "Something went really wrong with your request."
        }
        url.textContent = parsedJson.important.url

        document.querySelector('data').innerHTML = JSON.stringify(parsedJson);
        document.querySelector('request-selector').children[0].textContent = request_file
        })
        request_container.appendChild(request_file_element)
    })
}

loadDebugData();
