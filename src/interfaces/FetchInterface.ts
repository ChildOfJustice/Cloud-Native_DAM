//EXAMPLE:
/*
let data = {
    clusterIds: this.state.clusters.map(
        (l: Cluster) => l.clusterId)
}

const {authToken, idToken, loading} = this.props;

const fetchParams: FetchParams = {
    url: '/clusters/findAll',
    authToken: authToken,
    idToken: idToken,
    method: 'POST',
    body: data,

    actionDescription: "get names of shared clusters"
}

makeFetch<Cluster[]>(fetchParams).then(jsonRes => {
    console.log(jsonRes)
    this.setState({clusters: jsonRes})
}).catch(error => alert("ERROR: " + error))
*/

export interface FetchParams {
    url: string,
    //authToken: string,
    //idToken: string,
    token: string,
    method: string,
    body: any

    actionDescription: string
}

async function processData<T>(res: any, actionDescription: string){
    let jsonResponse = await res.json()
    if (res.ok){
        console.log("Successfully made request: " + actionDescription)
        console.log(jsonResponse) // <--------------!!!!!!!!!!
        return new Promise<T>(function (resolve, reject) {
            resolve(jsonResponse)
        })
    }
    else {
        // @ts-ignore
        return new Promise(function(resolve, reject) {
            console.log("Error for fetch: " + actionDescription + ": " + jsonResponse.message)
            reject("Error for fetch: " + actionDescription + ": " + jsonResponse.message)
        });
    }
}

// @ts-ignore
export async function makeFetch<T>(fetchParams: FetchParams): Promise<T> {

    if(fetchParams.method === "GET"){
        let res = await fetch(fetchParams.url + "/?" + fetchParams.token, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                //'Auth': fetchParams.authToken,
                //'Identity': fetchParams.idToken
            }
        }).catch(error => {
            return new Promise(function (resolve, reject) {
                console.log("Error for fetch: " + fetchParams.actionDescription + ": " + error)
                reject("Error for fetch: " + fetchParams.actionDescription + ": " + error)
            });
        })
        // @ts-ignore
        return processData<T>(res, fetchParams.actionDescription)

    }
    else if(fetchParams.method === "POST"){
        let res = await fetch(fetchParams.url + "/?" + fetchParams.token, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Auth': fetchParams.authToken,
                //'Identity': fetchParams.idToken
            },
            body: JSON.stringify(fetchParams.body)
        }).catch(error => {
            return new Promise(function (resolve, reject) {
                console.log("Error for fetch: " + fetchParams.actionDescription + ": " + error)
                reject("Error for fetch: " + fetchParams.actionDescription + ": " + error)
            });
        })
        // @ts-ignore
        return processData<T>(res, fetchParams.actionDescription)
    }
    else if(fetchParams.method === "DELETE"){
        await fetch(fetchParams.url + "/?" + fetchParams.token, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                //'Auth': fetchParams.authToken,
                //'Identity': fetchParams.idToken
            }
        }).then(res => {
            return processData<T>(res, fetchParams.actionDescription)
        }).catch(error => {
            return new Promise(function (resolve, reject) {
                console.log("Error for fetch: " + fetchParams.actionDescription + ": " + error)
                reject("Error for fetch: " + fetchParams.actionDescription + ": " + error)
            });
        })
    } else {
        return new Promise<any>(function(resolve, reject) {
            reject("No such method available")
        })
    }

    // return new Promise<any>(function(resolve, reject) {
    //     reject("NO WAY IT CAN BE HERE. FKNG TYPESCRIPT")
    // })
}