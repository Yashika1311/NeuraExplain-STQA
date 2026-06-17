package neuraexplain;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.Random;

public class WrongOtpTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:5173";
    private static final int EXPLICIT_WAIT_TIME = 30;
    private static final String TEST_PASSWORD = "TestPass@123";
    private static final Random RANDOM = new Random();

    @BeforeMethod
    public void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        String headless = System.getenv("HEADLESS");
        if (headless != null && (headless.equalsIgnoreCase("true") || headless.equals("1"))) {
            options.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080");
        }

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(EXPLICIT_WAIT_TIME));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testWrongOTPShowsError() {
        try {
            // Navigate to register
            driver.get(BASE_URL + "/register");

            // Wait for form
            // Fill Full Name
            driver.findElement(By.id("name"))
                    .sendKeys("Yashika Test");

            // Fill Email
            driver.findElement(By.id("email"))
                    .sendKeys("yashika" + System.currentTimeMillis() + "@gmail.com");

            // Fill Phone
            driver.findElement(By.id("phone"))
                    .sendKeys("9876543210");

            // Fill Password
            driver.findElement(By.id("password"))
                    .sendKeys("Password@123");

            // Fill Confirm Password
            driver.findElement(By.id("confirmPassword"))
                    .sendKeys("Password@123");

            // Click Create Account
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Wait for OTP screen
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("otp-0")));

            // Verify OTP page appeared
            Assert.assertTrue(
                    driver.findElement(By.id("otp-0")).isDisplayed(),
                    "OTP Verification page was not displayed."
            );

            System.out.println("Register Test Passed Successfully.");

        } catch (Exception e) {

            e.printStackTrace();
            Assert.fail("Register Test Failed: " + e.getMessage());

        } finally {

            driver.quit();

        }
    }
}