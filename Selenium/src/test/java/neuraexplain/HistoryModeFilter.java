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

public class HistoryModeFilter {

    @Test
    public void testHistoryModeFilter() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");

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

            // Create a unique Study Mode chat so history can be filtered
            WebElement modeButton = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.cssSelector("button.chatSelect")
                    )
            );
            modeButton.click();

            WebElement studyOption = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.xpath("//button[contains(normalize-space(.), 'Study Mode')]")
                    )
            );
            studyOption.click();

            WebElement inputBox = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatInput"))
            );
            String uniqueQuestion = "history mode filter test " + System.currentTimeMillis();
            inputBox.sendKeys(uniqueQuestion);
            driver.findElement(By.cssSelector(".chatSendButton")).click();

            wait.until(driver1 -> {
                WebElement bubble = driver1.findElement(By.cssSelector(".chatRow.ai .chatBubbleText"));
                return bubble.getText().trim().isEmpty() ? null : bubble;
            });

            // Select Study mode in the history filter sidebar
            WebElement historyFilter = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.xpath("//aside//select")
                    )
            );
            historyFilter.click();

            WebElement studyFilterOption = wait.until(
                    ExpectedConditions.elementToBeClickable(
                            By.cssSelector("aside select option[value='study']")
                    )
            );
            studyFilterOption.click();

            // Verify the history filter label updates to Study Mode
            WebElement historyTitle = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatHistoryTitle")
                    )
            );
            String titleText = historyTitle.getText().trim();
            Assert.assertTrue(titleText.toLowerCase().contains("study mode"),
                    "Expected history title to contain 'Study Mode', but was: " + titleText);

            // Verify at least one filtered history item is visible
            WebElement firstHistoryItem = wait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            By.cssSelector(".chatHistoryItem")
                    )
            );
            Assert.assertTrue(firstHistoryItem.isDisplayed(), "Expected at least one history item to be visible after filtering.");

            System.out.println("✅ History mode filter test passed.");
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail(e.getMessage());
        } finally {
            driver.quit();
        }
    }
}

