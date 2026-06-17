package neuraexplain;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class ChatTest {

    @Test
    public void testModeSuggestion() {

        WebDriverManager.chromedriver().setup();

                ChromeOptions options = new ChromeOptions();
                options.addArguments("--start-maximized");
                String headless = System.getenv("HEADLESS");
                if (headless != null && (headless.equalsIgnoreCase("true") || headless.equals("1"))) {
                        options.addArguments("--headless=new", "--disable-gpu", "--window-size=1920,1080", "--no-sandbox", "--disable-dev-shm-usage");
                }

        WebDriver driver = new ChromeDriver(options);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        try {

            // Open Login Page
            driver.get("http://localhost:5173/login");

            // Email
            wait.until(ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector("input[type='email']")))
                    .sendKeys("thakuryashika14@gmail.com");

            // Password
            driver.findElement(By.cssSelector("input[type='password']"))
                    .sendKeys("Yashika@14");

            // Login
            driver.findElement(By.cssSelector("button[type='submit']")).click();

            // Wait for Chat Page
            wait.until(ExpectedConditions.urlContains("chat"));

            // Select Technical Mode using the custom ModeSelector dropdown
            WebElement modeButton = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.cssSelector("button.chatSelect")
                    )
            );
            modeButton.click();

            // Wait for the custom dropdown option to become visible
            WebElement technicalOption = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.xpath("//button[contains(normalize-space(.), 'Technical Mode')]")
                    )
            );
            technicalOption.click();

            // Enter Question
            WebElement inputBox = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatInput"))
            );

            inputBox.sendKeys("prime minister of india");

            // Click Send
            driver.findElement(By.cssSelector(".chatSendButton")).click();

            // Wait until AI reply appears and has text
            WebElement aiText = wait.until(driver1 -> {
                WebElement bubble = driver1.findElement(By.cssSelector(".chatRow.ai .chatBubbleText"));
                return bubble.getText().trim().isEmpty() ? null : bubble;
            });

            String response = aiText.getText().toLowerCase();

            System.out.println("AI Response:");
            System.out.println(response);

            // Verify response suggests General Mode
            Assert.assertTrue(

                    response.contains("general mode")
                            || response.contains("switch")
                            || response.contains("general"),

                    "Expected suggestion to switch to General Mode was not found."

            );

            System.out.println("✅ Chat Mode Suggestion Test Passed.");

        }

        catch (Exception e) {

            e.printStackTrace();
            Assert.fail(e.getMessage());

        }

        finally {

            driver.quit();

        }

    }

}