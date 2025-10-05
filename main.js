const express = require('express')
const app = express()
app.use(express.static('public'))

const port = 3000

app.get('/alert', (req, res) => {
    const email = req.query.email ? req.query.email : null;
    console.log(email)
    res.send('<h3> Alert Creation is not setup yet, please come back later. </h3>')
})

app.listen(port, () => {
    console.log('Listening on port ', port)
})