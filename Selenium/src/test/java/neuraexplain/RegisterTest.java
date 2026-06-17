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
import org.testng.annotations.Test;

import java.time.Duration;

public class RegisterTest {

    @Test
    public void testRegisterPage() {

        // Setup ChromeDriver
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {

            // Open Register Page
            driver.get("http://localhost:5173/register");

            // Wait until page loads
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("name")));

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