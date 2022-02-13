const {Builder, By, Key, ActionChains} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

//cloud_user
//secretPassw0rd!

let driver = null;
let until = webdriver.until;
let damSystemUrl = ''
let testFilePath = ''

let testClusterName1 = "Test Cluster 1";
let testClusterName2 = "Test Cluster 2";

let secondTestUserName = "cloud_user2"
let testFileName = "testFile"




async function init(args){
    damSystemUrl = args[0];
    testFilePath = args[1];

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    driver = await new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

    await driver.get(damSystemUrl);

    await setFirstUserCookie()
}

async function setFirstUserCookie(){
    await driver.executeScript(function () {
        let store = {
            idToken: '',
            authToken: 'eyJraWQiOiJBNEw5ZkNwTnE5Yms3WjhkUUdzNGVLTHVlVXR6Y25WWndQUmhCakZMZTZBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4YjdhZjNiZi01NTkwLTRhMzItODc1Yy1lOTZhMWE1MmZmMTYiLCJldmVudF9pZCI6ImRiYTgzZDFiLWM3ZWYtNDFhNi04Y2QzLTllYWQ1MjdiZWMyMiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcHJvZmlsZSBlbWFpbCIsImF1dGhfdGltZSI6MTY0MTQ2ODYzMiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfMnpWbEdsdXpZIiwiZXhwIjoxNjQxNDcyMjMyLCJpYXQiOjE2NDE0Njg2MzIsInZlcnNpb24iOjIsImp0aSI6IjVmYWNmMjRjLWI3ZDYtNGQ5Yy05MzViLTQ2YTJlZWRlOWE3NCIsImNsaWVudF9pZCI6IjFiNm1yb2ptbmFjOTlxcTNtcHQ2Z2M4MjRrIiwidXNlcm5hbWUiOiJjbG91ZF91c2VyIn0.bg7-6O-JkLhJBMq4zbosi5FabqskubU8WD3sWwyP62Kge-7_ntKNHmvC0MXoYPwRDFrLxgEWM7HevjX7ycFjIAZxc4Zg22IiiK3ergwd4_sBSWpL-4JjmMgbenP5IyC2_q-E4fuE6Ncx-U7VDD5bjWOtcFfcc_nmBsLq3YHwtoR0lkviKgk4UhVpFec7mub9SUBXQLRa9yFvF07aDS2D-sjTItC5s-nvciDpS5RHuB2Lrp_3LIOV3TIIeY2ZlMDSDI5YwcvmrVLU-sqoDSJNTxVmlnDm8n3yDRvSf2ynKDTjWFZ3caO41vxK2AJOptw87oMgh2zM-4icD7keV4rJMw',
            loading: false
        }
        localStorage.setItem("store", JSON.stringify(store));
    });
}

async function setSecondUserCookie(){
    await driver.executeScript(function () {
        let store = {
            idToken: '',
            authToken: 'eyJraWQiOiJBNEw5ZkNwTnE5Yms3WjhkUUdzNGVLTHVlVXR6Y25WWndQUmhCakZMZTZBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIwMTk4NmIwMS00ZmJjLTRjY2UtODA1YS0xZDliOTQwYjRiMmUiLCJldmVudF9pZCI6IjFjMmMwMTExLTY1M2MtNDU4OS05Yjg2LTEzYjAyNjkwZjY2YSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcHJvZmlsZSBlbWFpbCIsImF1dGhfdGltZSI6MTY0MTQ2ODc2MywiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfMnpWbEdsdXpZIiwiZXhwIjoxNjQxNDcyMzYzLCJpYXQiOjE2NDE0Njg3NjMsInZlcnNpb24iOjIsImp0aSI6IjQzMTA1ZmE0LWM2YTgtNDBiMi04ZjNmLTg3N2EyYThlNzdkYSIsImNsaWVudF9pZCI6IjFiNm1yb2ptbmFjOTlxcTNtcHQ2Z2M4MjRrIiwidXNlcm5hbWUiOiJjbG91ZF91c2VyMiJ9.BmitY6q0o1YOkWG9HFJd4PCl1kK44oxVRPLLJcAgihILuPn-aZjmBGHh9pdVz0Zx2_eMpc2lBdkKVzk-lTeMwScwrAQioZbG3dmGPI4H2wOEnB_QiPPsdwBkX6Tw8kNesrY0iVKe_1xNcBesW6wfbOicF5j2eS3BkquiLRygYpxI_dz09Rs57t_2dpyc8bCg_yI-EAOUuL9KjxktcBTsDabon-mEOvoMZGnQWvDuCk1iZe7BG4s9wZWXg6mBxRpWGeHFfCbzKLTgpc4XvLD_Y3y7nUnvkvaPY56dVqk2YE6t9ykAvECBbWPiMHSdyIpzmIP5K_K6vBjOB3KjgXjhwA',
            loading: false
        }
        localStorage.setItem("store", JSON.stringify(store));
    });
}




async function seleniumTest(args) {
    console.log("Testing the DAM system on the address: " + damSystemUrl);

    try {

        console.log("Initializing...")
        await init(args);

        console.log("Creating the first cluster...")
        await goToPersonalPage()
        await checkAddedFilesSize('0')
        await createCluster(testClusterName1)

        console.log("Uploading the test file...")
        await goToCluster(testClusterName1)
        await uploadFile(testFilePath, 180)
        await goToPersonalPage();
        await checkAddedFilesSize('0.48')

        console.log("Deleting the first cluster...")
        await deleteCluster(testClusterName1)

        console.log("Creating the second cluster...")
        await createCluster(testClusterName2)
        await goToCluster(testClusterName2)

        console.log("Adding permissions for the second test user...")
        await addPermissions(secondTestUserName)

        console.log("Adding the test file to the second cluster...")
        await goToPersonalPage();
        await goToFiles()
        await addFileToCluster(15)

        console.log("Switching to the second user profile...")
        await setSecondUserCookie()
        await goToPersonalPage()

        console.log("Checking for the shared file...")
        await goToSharedCluster(testClusterName2)
        await checkThatTestFileIsAvailable()

        console.log("Cleaning up the first account...")
        await setFirstUserCookie()
        await goToPersonalPage()
        await deleteCluster(testClusterName2)
        await goToFiles()
        console.log("Deleting the file: " + testFileName)
        await deleteFile(testFileName)



        // await driver.wait(until.elementLocated(By.xpath("//*[text()='This site can’t be reached']")), 30000);



        //working with tables:
        // let tableRows = await driver.findElement(By.className("table table-dark table-striped table-bordered table-hover")).findElements(By.tagName("tr"));
        // for (const row of tableRows) {
        //     let cols = await row.findElements(By.tagName("td"));
        //     // console.log(cols);
        //     for (const col of cols) {
        //         console.log(col.getText() + "\t");
        //     }
        // }

    } finally {
        await driver.quit();
    }
}



async function goToPersonalPage(){
    driver.findElement(By.xpath("//*[text()='Personal page']")).click();
    await driver.wait(until.elementLocated(By.xpath("//*[text()='Logout']")));
}

async function checkAddedFilesSize(fileSize){
    await driver.wait(until.elementLocated(By.xpath("//*[text()='Your current used storage size is ']")));
    await driver.wait(until.elementLocated(By.xpath("//*[text()='"+fileSize+" MB']")));
}

async function createCluster(clusterName){
    let clusterNameField = driver.findElement(By.id("ClusterName"));
    clusterNameField.sendKeys(clusterName, Key.RETURN);
    driver.findElement(By.xpath("//*[text()='Create Cluster']")).click();
}

async function deleteCluster(clusterName){
    driver.findElement(By.xpath("//*[text()='X']")).click();
    let clusterNameInTable = driver.findElement(By.xpath("//*[text()='"+clusterName+"']"));

    await sleep(1000)

    await driver.wait(until.elementLocated(By.xpath("//*[text()='Logout']")));
    await driver.wait(until.stalenessOf(clusterNameInTable));
}

async function goToCluster(clusterName){
    await driver.wait(until.elementLocated(By.xpath("//*[text()='"+clusterName+"']")));
    driver.findElement(By.xpath("//*[text()='See']")).click();
    await driver.wait(until.elementLocated(By.xpath("//*[text()='Upload file']")));
}

async function uploadFile(filePath, waitTimeSec){
    driver.findElement(By.xpath("//*[text()='Upload file']")).click();
    await driver.wait(until.elementLocated(By.xpath("//*[text()='Choose file for uploading to cloud']")));


    let chooseFile = driver.findElement(By.id("fileToUpload"));
    chooseFile.sendKeys(filePath);
    await driver.findElement(By.xpath("//*[text()='Add Tag']")).click();

    driver.findElement(By.id("defaultTagValue1")).sendKeys("Selenium Test")
    driver.findElement(By.id("defaultTagValue2")).sendKeys("Sardor")
    driver.findElement(By.id("defaultTagValue3")).sendKeys("binary files")
    driver.findElement(By.id("tagKey1")).sendKeys("TestTag1")
    driver.findElement(By.id("tagValue1")).sendKeys("TEST 1")
    driver.findElement(By.id("tagKey2")).sendKeys("TestTag2")
    driver.findElement(By.id("tagValue2")).sendKeys("TEST 2")

    driver.findElement(By.xpath("//*[text()='Upload File']")).click();


    // await sleep(waitTimeSec * 1000);

    await waitForAlertAndAccept("File uploaded successfully.", waitTimeSec)
    // let alertText = await driver.switchTo().alert().getText();
    // if (alertText !== ){
    //     throw "File uploading failed!"
    // }
    // await driver.switchTo().alert().accept();
}

async function addPermissions(principalUserName){

    driver.findElement(By.xpath("//*[@placeholder=\"User Name\"]")).sendKeys(principalUserName);
    driver.findElement(By.id("downloadPermissionCheckBox")).click()
    driver.findElement(By.id("deletePermissionCheckBox")).click()

    driver.findElement(By.xpath("//*[text()='Share Cluster']")).click();

    await driver.wait(until.elementLocated(By.xpath("//*[text()='1010']")));
}

async function goToFiles(){
    driver.findElement(By.xpath("//*[text()='My files']")).click();

    await driver.wait(until.elementLocated(By.xpath("//*[text()=' Your files ']")));
}

async function addFileToCluster(waitTimeSec){

    // driver.findElement(By.css('#mySelection > option:nth-child(4)'))
    //     .click();

    driver.findElement(By.id("checkAll")).click();
    // console.log("Searching for the check box...")
    // driver.findElement(By.xpath("//*[text()='Check / Uncheck All']")).click();
    // console.log("Found!")
    driver.findElement(By.xpath("//*[text()='Add']")).click();


    // var labels = driver.findElements(By.css('.checkbox label'));
    //
    // //# assumes that only one label will fit the criteria of having the desired innerText
    // var myLabel = labels.filter(function(label) {
    //     return label.getAttribute('innerText') === 'Manage the Coaching Process';
    // })[0];
    //
    // var myCheckbox = myLabel.findElement(By.cssSelector('input[type=\'checkbox\']'));
    // myCheckbox.click();



    // await sleep(waitTimeSec * 1000);

    await waitForAlertAndAccept("All chosen files have been added to the cluster.", waitTimeSec)
    // let alertText = await driver.switchTo().alert().getText();
    // if (alertText !== "All chosen files have been added to the cluster."){
    //     throw "File adding to cluster failed!"
    // }
    // await driver.switchTo().alert().accept();
}

async function goToSharedWithMeClusters(){

    driver.findElement(By.xpath("//*[text()='See shared with me clusters']")).click();

    await driver.wait(until.elementLocated(By.xpath("//*[text()='Shared with you clusters:']")));
}

async function goToSharedCluster(clusterName){
    await goToSharedWithMeClusters()
    await driver.wait(until.elementLocated(By.xpath("//*[text()='"+clusterName+"']")));

    driver.findElement(By.xpath("//*[text()='"+clusterName+"']")).click();
    await driver.wait(until.elementLocated(By.xpath("//*[text()='Your permissions are:']")));
}

async function checkThatTestFileIsAvailable(fileName){
    driver.findElement(By.xpath("//*[text()='You can ']"));
    driver.findElement(By.xpath("//*[text()='Download']"));

    driver.findElement(By.xpath("//*[text()='"+fileName+"']")).click();
}

async function deleteFile(fileName){
    await driver.wait(until.elementLocated(By.xpath("//*[text()='"+fileName+"']")));
    let fileInTable = driver.findElement(By.xpath("//*[text()='"+fileName+"']"));

    await driver.findElement(By.xpath("//*[@id=\"root\"]/div/div/div/div/table/tbody/tr/td[8]/button")).click();

    await waitForAlertAndAccept('Delete the file from the cloud?', 10)

    await sleep(1000)

    await driver.wait(until.elementLocated(By.xpath("//*[text()=' Your files ']")));
    // await driver.wait(until.stalenessOf(fileInTable)); //TODO i dontk understand this!!    NoSuchElementError: no such element: Unable to locate element: {"method":"xpath","selector":"//*[text()='undefined']"}
}



async function run(){

    const args = [];
    process.argv.forEach(function (val, index, array) {
        if(index > 1) {
            args.push(val)
        }
    });

    await seleniumTest(args);
}

run().then(() => {
    console.log("RESULT: Execution completed successfully")
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForAlertAndAccept(alertText, timeOutSec) {
    let curTimeSec = 0;

    let currentAlertText = ''



        while (true) {
            try {
                currentAlertText = await driver.switchTo().alert().getText();
            } catch (e) {
                curTimeSec += 1
                if (curTimeSec > timeOutSec)
                    throw "Timed out for alert: " + alertText

                await sleep(1000)
            }

            if (currentAlertText !== '') {
                console.log("Found an alert with text: " + currentAlertText)
                break
            }

            curTimeSec += 1
            if (curTimeSec > timeOutSec)
                throw "Timed out for alert: " + alertText

            await sleep(1000)
        }


    if (currentAlertText !== alertText){
        throw "Alert text mismatch: Expected(" + alertText + "); Actual(" + currentAlertText + ")"
    }
    console.log("Alert text mached!")

    await driver.switchTo().alert().accept();
}