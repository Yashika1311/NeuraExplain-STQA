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

public class LoginTest {

    @Test
    public void testLogin() {

        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {

            // Open Login Page
            driver.get("http://localhost:5173/login");

            // Wait for Email field
            WebElement emailField = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(By.id("email"))
            );

            // Wait for Password field
            WebElement passwordField = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(By.id("password"))
            );

            // Enter credentials
            emailField.sendKeys("thakuryashika14@gmail.com");      // Replace with valid user
            passwordField.sendKeys("Yashika@14");           // Replace with valid password

            // Click Login
            WebElement loginButton = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.cssSelector("button[type='submit']")
                    )
            );

            loginButton.click();

            // Wait until redirected to Chat page
            wait.until(ExpectedConditions.urlContains("/chat"));

            // Verify login success
            Assert.assertTrue(
                    driver.getCurrentUrl().contains("/chat"),
                    "Login failed. User was not redirected to Chat page."
            );

            System.out.println("✅ Login Test Passed!");

        } catch (Exception e) {

            e.printStackTrace();
            Assert.fail("Login Test Failed: " + e.getMessage());

        } finally {

            driver.quit();

        }
    }
}