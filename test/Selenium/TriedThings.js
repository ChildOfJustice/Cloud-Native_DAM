const {Builder, By, Key, until, ActionChains} = require('selenium-webdriver');
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
// const ActionChains = require("selenium-webdriver");
const Action = require("selenium-webdriver");

async function run(){

    const args = [];
    process.argv.forEach(function (val, index, array) {
        if(index > 1) {
            args.push(val)
        }
    });

    await seleniumTest(args);
}

async function seleniumTest(args) {

    let damSystemUrl = args[0];

    chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
    let driver = await new webdriver.Builder()
        .withCapabilities(webdriver.Capabilities.chrome())
        .build();

    try {

        await driver.get(damSystemUrl);
        let loginButton = driver.findElement(By.xpath("//*[text()='Login']"))

        loginButton.click();


        await driver.wait(until.titleContains("Signin"));

        // await driver.switchTo().activeElement()
        // await driver.switchTo().defaultContent()
        // await driver.switchTo().frame("ModelFrameTitle");

        // let usernameField = driver.findElement(By.xpath("//*[text()='Username']"));

        // let editorFrame = driver.findElement(By.css("#modal-dialog"));
        // await driver.switchTo().frame(editorFrame);

        // let body1 = driver.findElement(By.tagName("body"));
        // body1.sendKeys(Keys.CONTROL + "a");


        // let usernameField = driver.findElement(By.id("signInFormUsername"));
        // await driver.wait(until.elementIsSelected(usernameField));
        // usernameField.sendKeys("izzvms@gmail.com", Key.RETURN);
        //driver.manage().window().
        //driver.findElement(By.name("password")).sendKeys("superPassw0rd!");
        //driver.findElement(By.name("signInSubmitButton")).submit();
        // button = driver.find_element_by_class_name(u"infoDismiss")

        //await ActionChains(driver).move_to_element(button).click(button).perform()


       // await new Action.Button.LEFT.c(driver).click(driver.findElement(By.name("signInSubmitButton"))).perform();
        // driver.findElement(By.xpath("//*[text()='Sign in']")).click();


        // await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
        await driver.wait(until.elementLocated(By.xpath("//*[text()='This site can’t be reached']")), 10000);


    } finally {
        await driver.quit();
    }
}

run().then(() => {
    console.log("RESULT: Execution completed successfully")
});