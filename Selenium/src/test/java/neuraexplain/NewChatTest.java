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

public class NewChatTest {

    @Test
    public void testNewChatResetsComposer() {
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

            // Select Technical Mode via the custom ModeSelector dropdown
            WebElement modeButton = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.cssSelector("button.chatSelect")
                    )
            );
            modeButton.click();

            WebElement technicalOption = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.xpath("//button[contains(normalize-space(.), 'Technical Mode')]")
                    )
            );
            technicalOption.click();

            // Enter and send a sample question
            WebElement inputBox = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatInput"))
            );
            inputBox.sendKeys("prime minister of india");
            driver.findElement(By.cssSelector(".chatSendButton")).click();

            // Wait until AI reply appears and has text
            wait.until(driver1 -> {
                WebElement bubble = driver1.findElement(By.cssSelector(".chatRow.ai .chatBubbleText"));
                return bubble.getText().trim().isEmpty() ? null : bubble;
            });

            // Click New chat to reset composer state
            WebElement newChatButton = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.xpath("//button[contains(normalize-space(.), 'New chat')]")
                    )
            );
            newChatButton.click();

            // Verify the input box is cleared
            WebElement clearedInputBox = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatInput"))
            );
            Assert.assertEquals(clearedInputBox.getAttribute("value"), "", "Expected chat input to be cleared after clicking New chat.");

            // Verify the empty chat state is shown
            WebElement emptyState = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatEmptyState")
                    )
            );
            Assert.assertTrue(emptyState.isDisplayed(), "Expected empty chat state to be visible after clicking New chat.");

            // Verify previous history is still present
            WebElement historyItem = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatHistoryItem")
                    )
            );
            Assert.assertTrue(historyItem.isDisplayed(), "Expected saved chat history to remain visible after starting a new chat.");

            System.out.println("✅ New chat reset test passed.");
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail(e.getMessage());
        } finally {
            driver.quit();
        }
    }
}

