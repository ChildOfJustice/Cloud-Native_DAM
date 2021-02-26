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


export interface FetchResponse {
    data: any,
    success: boolean

}
export interface FetchParams {
    url: string,
    authToken: string,
    idToken: string,
    method: string,
    body: any

    actionDescription: string
}

export async function makeFetch<T>(
    fetchParams: FetchParams
): Promise<T> {

    if(fetchParams.method == "GET"){
        try {
            const response = await fetch(fetchParams.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Auth': fetchParams.authToken,
                    'Identity': fetchParams.idToken
                }
            })

            const jsonResponse = await response.json()

            if (response.ok)
                console.log("Successfully made request: " + fetchParams.actionDescription)
            else {
                // @ts-ignore
                return new Promise(function(resolve, reject) {
                    console.log("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                    reject("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                });
            }

            return new Promise<T>(function(resolve, reject) {
                resolve(jsonResponse)
            })
            //fetchParams.actionOnSuccess(jsonResponse)
        } catch (error){
            return new Promise(function(resolve, reject) {
                reject("Fetch error with " + fetchParams.actionDescription + " : " + error)
            });
        }
    }
    else if(fetchParams.method == "POST"){
        try {
            const response = await fetch(fetchParams.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Auth': fetchParams.authToken,
                    'Identity': fetchParams.idToken
                },
                body: JSON.stringify(fetchParams.body)
            })

             const jsonResponse = await response.json()//.then(function(data) {
            //     // `data` is the parsed version of the JSON returned from the above endpoint.
            //     console.log("MAIN DATA")
            //     console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
            //
            //     return new Promise<T>(function(resolve, reject) {
            //         resolve(data)
            //     })
            // });;

            if (response.ok)
                console.log("Successfully made request: " + fetchParams.actionDescription)
            else {
                //const responseBody = await jsonResponse.body.json()

                // @ts-ignore
                return new Promise(function(resolve, reject) {
                    console.log("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                    reject("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                });
            }

            return new Promise<T>(function(resolve, reject) {
                resolve(jsonResponse)
            })
            //fetchParams.actionOnSuccess(jsonResponse)
        } catch (error){
            return new Promise(function(resolve, reject) {
                reject("Fetch error with " + fetchParams.actionDescription + " : " + error)
            });
        }
    }
    else if(fetchParams.method == "DELETE"){
        try {
            const response = await fetch(fetchParams.url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Auth': fetchParams.authToken,
                    'Identity': fetchParams.idToken
                }
            })

            const jsonResponse = await response.json()

            if (response.ok)
                console.log("Successfully made request: " + fetchParams.actionDescription)
            else {
                // @ts-ignore
                return new Promise(function(resolve, reject) {
                    console.log("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                    reject("Error for fetch: " + fetchParams.actionDescription + ": " + jsonResponse.message)
                });
            }

            return new Promise<T>(function(resolve, reject) {
                resolve(jsonResponse)
            })
            //fetchParams.actionOnSuccess(jsonResponse)
        } catch (error){
            return new Promise(function(resolve, reject) {
                reject("Fetch error with " + fetchParams.actionDescription + " : " + error)
            });
        }
    }

    return new Promise<any>(function(resolve, reject) {
        reject("No such method available")
    })
}