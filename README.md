# How To Deploy

In the root of the project folder:
1) `amplify init`
2) change the app id in the fullDeploy.sh script
3) `npm run deploy`
4) `amplify add hosting`
5) `amplify publish`
6) add the redirect rule from util/AWS/Amplify/addRoute\
   `Source address: </^((?!\.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$).)*$/>`
   `Target address: /index.html`
## Available Scripts

In the project directory, you can run:

### `npm start-webpack`

Builds and runs the app in the development mode.\
Open [http://localhost:9000](http://localhost:9000) to view it in the browser.

There will be no connection with the AWS cloud!\
So you will need to slightly change the code in order for it not to fetch data from the cloud.