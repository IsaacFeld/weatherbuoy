const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path')

const requestPath = path.join(__dirname, "public", "debug", "requests")

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
const port = 3001



app.get('/alert', (req, res) => {
    const email = req.query.email ? req.query.email : null;
    console.log(email)
    res.send('<h3> Alert Creation is not setup yet, please come back later. </h3>')
})

app.get('/debugdata', (req, res) =>{
    const files = fs.readdirSync(requestPath)
    res.json(files)
})

// Retrieving Request Files
app.get('/request/:requestId', (req, res) =>{
    try{
        request_data = fs.readFileSync(path.join(requestPath, req.params["requestId"]), "utf-8")
        res.status(208).json(request_data)
    }
    catch(readRequestError){
        console.error(readRequestError)
        res.status(501).json({success: false})
    }
    

})

// TODO
app.post('/request', (req, res) => {
    // handle renaming request files
})

// DELETE REQUEST FILES
app.delete('/request', (req, res) => {
    if(req.body == null){
        response = "Request Body is null!"
        res.status(404).json({success: false, message: response})
    }
    else{
        if(req.body.id == null){
            res.status(401).json({success:false})
        }
        try{
            fs.rmSync(path.join(requestPath, req.body.id))
            res.status(204).json({success: true})
        }
        catch(deleteRequestError){
            console.error(deleteRequestError)
            res.status(500).json({success: false})
        }
        
    }

})

app.post('/debug', async (req, res) => {
    let debugRequestData = summarizeRequest(req);
    let debugRequestBody = req.body
    let fileDate = Date.now();
    let response;
    if(debugRequestBody == null){
        response = "Request Body is null!"
        let fileName = "body-error_" + fileDate;
        let debugRequest = {"important": debugRequestData, "body": null}
        fs.writeFileSync(path.join(requestPath, `${fileName}.json`), JSON.stringify(debugRequest, null, 2))
        res.status(409).json({success: false, message: response})
    }
    else{
        let debugRequest = {"important": debugRequestData, "body": debugRequestBody}
        let fileName = debugRequestBody.label != null ? debugRequestBody.label + "_" + fileDate : "unnamed" + "_" + fileDate

        try {
            fs.writeFileSync(path.join(requestPath, `${fileName}.json`), JSON.stringify(debugRequest, null, 2))
        }
        catch(fileWriteErr){
            response="Failed to write request data to file!"
            res.status(509).json({success: true, message: ""})
        }


        response="Successfully saved your request data to " + fileName
        res.status(209).json({success: true, message: response})
    }

})

app.get('/debugget', async (req, res) => {
    console.log("hey")
    let debugRequestData = summarizeRequest(req);
    let fileDate = Date.now();
    let response;
    let fileName = "get_" + fileDate;
    let debugRequest = {"important": debugRequestData, "body": null}
    fs.writeFileSync(path.join(requestPath, `${fileName}.json`), JSON.stringify(debugRequest, null, 2))
    res.status(209).json({success: true, message: response})
})


app.listen(port, () => {
    console.log('Listening on port ', port)
})


function summarizeRequest(req) {
  return {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    hostname: req.hostname,
    ip: req.ip,
    query: req.query,
    params: req.params,
    protocol: req.protocol,
    userAgent: req.get("user-agent"),
    referer: req.get("referer"),
    headers: {
      accept: req.get("accept"),
      contentType: req.get("content-type"),
    },
    cookies: req.cookies
  };
}
