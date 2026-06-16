package neuraexplain;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ChatTest {

    @Test
    public void testChatResponse() {

        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();

        // IMPORTANT: avoids some storage/security restrictions
        options.addArguments("--disable-web-security");
        options.addArguments("--disable-site-isolation-trials");
        options.addArguments("--start-maximized");

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        try {
            // 1. Open CHAT directly (not landing page)
            driver.get("http://localhost:5173/chat");

            // 2. Clear and inject token BEFORE React auth check runs
            JavascriptExecutor js = (JavascriptExecutor) driver;

            js.executeScript("window.localStorage.clear();");
            js.executeScript("window.localStorage.setItem('token', 'test-token');");

            // 3. Force React to re-evaluate auth state
            driver.navigate().refresh();

            // 4. Wait for chat input (now user is "authenticated")
            WebElement chatInput = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatInput")
                    )
            );

            // 5. Send message
            chatInput.sendKeys("Hello AI, this is Selenium test");
            chatInput.sendKeys(Keys.ENTER);

            // 6. Wait for AI response bubble
            WebElement response = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatBubble.ai .chatBubbleText")
                    )
            );

            System.out.println("AI Response: " + response.getText());

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            driver.quit();
        }
    }
}