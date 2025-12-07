const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
const port = 3001

let debugRequestData = {};

app.get('/alert', (req, res) => {
    const email = req.query.email ? req.query.email : null;
    console.log(email)
    res.send('<h3> Alert Creation is not setup yet, please come back later. </h3>')
})

app.get('/debugdata', (req, res) =>{
    console.log(debugRequestData)
    res.json(debugRequestData)
})

app.post('/debug', (req, res) => {
    let response;
    if(req.body == null){
        response = "Request Body is null!"
        res.json({success: false, message: response})
    }
    else{
        debugRequestData = req.body;
        let fileDate = Date.now();
        let fileName = debugRequestData.label != null ? debugRequestData.label + "_" + fileDate : fileDate
        try {
            fs.writeFileSync(`public/debug/requests/${fileName}.json`, JSON.stringify(debugRequestData, null, 2))
        }
        catch(fileWriteErr){
            response="Failed to write request data to file!"
            res.json({success: true, message: ""})
        }


        response="Successfully saved your request data to " + fileName
        res.json({success: true, message: response})
    }

})



app.listen(port, () => {
    console.log('Listening on port ', port)
})
