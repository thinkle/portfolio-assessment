// Create a google doc...


function getAccessToken () {
    return window.gapi.auth.getToken().access_token;
}

async function createFile ({title,description,body}) {
    var metadata = {
        name : title,
        mimeType : 'application/vnd.google-apps.document',
        appProperties : {
                        role : 'foo'
                    }
    }
    var file = new Blob([body || 'hello?']);
    var form = new FormData();
    form.append('metadata',new Blob([JSON.stringify(metadata)],
                                    {type:'application/json'}))
    form.append('file',file);
    const resp = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{
            method : 'POST',
            headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
            body : form
        })
    console.log('Got a response!',resp);
    const val = await resp.json()
    console.log(val)
    return {
        id:val.id,
        url:`https://docs.google.com/document/d/${val.id}/edit#`
    }
}

async function updateFile (id,{description,body}) {
    const metadata = {mimeType:'application/vnd.google-apps.document',}
    var form = new FormData()
     form.append('metadata',new Blob([JSON.stringify(metadata)],
                                     {type:'application/json'}));
    //                               //{type:'application/vnd.google-apps.document'}));
    form.append('file',body);
    const resp = await fetch(
        `https://www.googleapis.com/upload/drive/v2/files/${id}/?uploadType=media`,{
            method : 'PUT',
            headers : new Headers({'Authorization':'Bearer '+getAccessToken()}),
            body : new Blob([body])
        })
    const val = await resp.json();
    console.log('Pushed to file: ',val);
    return {
        url:val.alternateLink,
        ...val
    }
}

export default {
    createFile,
    updateFile
}
