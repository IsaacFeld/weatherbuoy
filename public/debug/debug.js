async function loadDebugData(){

    let response = await fetch('/debug', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"label": "test", "message": "hey!"})
    })

    response = await response.json();
    console.log(response);

    let debugData = await fetch('/debugdata')
    debugData = await debugData.json();
    console.log(debugData);
    document.querySelector('data').innerHTML = JSON.stringify(debugData, null, 2)
}

loadDebugData();
