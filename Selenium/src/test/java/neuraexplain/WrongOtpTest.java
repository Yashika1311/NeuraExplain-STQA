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

public class WrongOtpTest {

    @Test
    public void testWrongOTP() {

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

            // Fill Registration Form
            driver.findElement(By.id("name"))
                    .sendKeys("Yashika Test");

            driver.findElement(By.id("email"))
                    .sendKeys("test" + System.currentTimeMillis() + "@gmail.com");

            driver.findElement(By.id("phone"))
                    .sendKeys("98" + (System.currentTimeMillis() % 100000000));

            driver.findElement(By.id("password"))
                    .sendKeys("Password@123");

            driver.findElement(By.id("confirmPassword"))
                    .sendKeys("Password@123");

            // Click Create Account
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Wait for OTP Screen
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("otp-0")));

            // Enter WRONG OTP
            driver.findElement(By.id("otp-0")).sendKeys("1");
            driver.findElement(By.id("otp-1")).sendKeys("1");
            driver.findElement(By.id("otp-2")).sendKeys("1");
            driver.findElement(By.id("otp-3")).sendKeys("1");
            driver.findElement(By.id("otp-4")).sendKeys("1");
            driver.findElement(By.id("otp-5")).sendKeys("1");

            // Click Verify
            driver.findElement(By.xpath("//button[contains(text(),'Verify')]")).click();

            // Wait for Error Message
            WebElement errorMessage = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.className("registerError")
                    )
            );

            // Verify Error is Displayed
            Assert.assertTrue(
                    errorMessage.isDisplayed(),
                    "Error message was not displayed for incorrect OTP."
            );

            System.out.println("Wrong OTP Test Passed Successfully.");

        } catch (Exception e) {

            e.printStackTrace();
            Assert.fail("Wrong OTP Test Failed: " + e.getMessage());

        } finally {

            driver.quit();

        }
    }
}