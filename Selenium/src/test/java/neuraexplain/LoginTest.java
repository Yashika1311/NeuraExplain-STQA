package neuraexplain;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginTest {

    @Test
    public void testLogin() {

        WebDriver driver = new ChromeDriver();
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        try {
            driver.manage().window().maximize();
            driver.get("http://localhost:5173"); // CHANGE to your frontend URL

            // Wait for login page to load properly
            WebElement loginBtn = wait.until(
                    ExpectedConditions.elementToBeClickable(By.cssSelector("#loginButton"))
            );

            loginBtn.click();

            // Wait for redirect OR dashboard/chat page
            wait.until(ExpectedConditions.urlContains("chat"));

            System.out.println("Login successful, redirected to chat");

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}