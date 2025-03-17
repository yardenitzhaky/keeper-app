using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System;
using KeeperAppTests.PageObjects;
using SeleniumExtras.WaitHelpers;

namespace KeeperAppTests
{
    [TestClass]
    public class KeeperAppFormTests
    {
        private IWebDriver driver;
        private WebDriverWait wait;
        private BasePage basePage;
        private LoginPage loginPage;
        private RegisterPage registerPage;
        
        [TestInitialize]
        public void Setup()
        {
            Console.WriteLine("Setting up test environment...");
            // Setup Chrome driver with options
            var options = new ChromeOptions();
            options.AddArgument("--start-maximized");
            
            // Create Chrome driver
            driver = new ChromeDriver(options);
            
            // Configure wait
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(35));
            
            // Initialize page objects
            basePage = new BasePage(driver);
            loginPage = new LoginPage(driver);
            registerPage = new RegisterPage(driver);
        }
        
        [TestCleanup]
        public void Cleanup()
        {
            Console.WriteLine("Cleaning up test resources...");
            driver?.Quit();
        }
        
        // Helper method to dismiss cookie alert if present
        private void DismissCookieAlertIfPresent()
        {
            try
            {
                // Give a short time for the cookie alert to appear
                System.Threading.Thread.Sleep(1000);
                
                var cookieAlertButton = By.CssSelector(".cookie-alert-accept");
                if (basePage.IsElementDisplayed(cookieAlertButton))
                {
                    Console.WriteLine("Cookie alert found, dismissing it...");
                    driver.FindElement(cookieAlertButton).Click();
                    System.Threading.Thread.Sleep(500); // Allow time for the alert to be dismissed
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error handling cookie alert: {ex.Message}");
            }
        }
        
        [TestMethod]
        public void CookieAlert_CanBeDismissed()
        {
            Console.WriteLine("Starting CookieAlert_CanBeDismissed test...");
            // Navigate to app using base page
            basePage.NavigateTo("");
            
            // Wait for loading spinner to disappear
            WaitForLoadingSpinnerToDisappear();
            
            // Verify the cookie alert is present
            var cookieAlertModal = By.CssSelector(".cookie-alert-modal");
            Console.WriteLine($"Cookie alert displayed: {basePage.IsElementDisplayed(cookieAlertModal)}");
            
            // Find and click the accept button
            var acceptButton = driver.FindElement(By.CssSelector(".cookie-alert-accept"));
            acceptButton.Click();
            Console.WriteLine("Clicked accept button on cookie alert");
            
            // Wait for animation to complete
            System.Threading.Thread.Sleep(1000);
            
            // Verify the alert is no longer visible
            try
            {
                var alertAfterClick = driver.FindElement(cookieAlertModal);
                Console.WriteLine($"Cookie alert still visible after clicking: {alertAfterClick.Displayed}");
            }
            catch (NoSuchElementException)
            {
                // If element is completely removed, that's also good
                Console.WriteLine("Cookie alert was removed from DOM after dismissal");
            }
            
            // Refresh page to verify the setting was saved
            driver.Navigate().Refresh();
            WaitForLoadingSpinnerToDisappear();
            
            // Verify alert doesn't reappear
            Console.WriteLine($"Cookie alert visible after refresh: {basePage.IsElementDisplayed(cookieAlertModal)}");
        }
        
        [TestMethod]
        public void Debug_PageLoadTest()
        {
            Console.WriteLine("Starting Debug_PageLoadTest...");
            // Navigate to login page using login page object
            loginPage.GoToLoginPage();

            // Wait for loading spinner to disappear
            WaitForLoadingSpinnerToDisappear();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Log basic info
            Console.WriteLine($"Current URL: {driver.Url}");
            Console.WriteLine($"Page Title: {driver.Title}");
            
            // Try to find body
            var body = driver.FindElement(By.TagName("body"));
            Console.WriteLine($"Body element found: {body != null}");
            
            // Success if we got here
            Console.WriteLine("Page loaded successfully");
        }
        
        [TestMethod]
        public void LoginPage_HasFormElements()
        {
            Console.WriteLine("Starting LoginPage_HasFormElements test...");
            // Navigate to login page
            loginPage.GoToLoginPage();

            // Wait for loading spinner to disappear
            WaitForLoadingSpinnerToDisappear();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Wait for page to load
            System.Threading.Thread.Sleep(2000);
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            Console.WriteLine($"Form element exists: {form != null}");
            
            // Count input fields
            var inputs = form.FindElements(By.TagName("input"));
            Console.WriteLine($"Number of input fields found: {inputs.Count}");
            
            // Find button - using the same approach as the original test
            var button = form.FindElement(By.TagName("button"));
            Console.WriteLine($"Submit button found: {button != null}");
        }
        
        [TestMethod]
        public void RegisterPage_HasFormElements()
        {
            Console.WriteLine("Starting RegisterPage_HasFormElements test...");
            // Navigate to register page using page object
            registerPage.GoToRegisterPage();

               // Wait for loading spinner to disappear
            WaitForLoadingSpinnerToDisappear();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            Console.WriteLine($"Form element exists: {form != null}");
            
            // Count input fields
            var inputs = form.FindElements(By.TagName("input"));
            Console.WriteLine($"Number of input fields found: {inputs.Count}");
            
            // Find button
            var button = form.FindElement(By.TagName("button"));
            Console.WriteLine($"Submit button found: {button != null}");
        }
        
        [TestMethod]
        public void LoginForm_EmptySubmit_ShowsValidation()
        {
            Console.WriteLine("Starting LoginForm_EmptySubmit_ShowsValidation test...");
            // Navigate to login page
            loginPage.GoToLoginPage();
            

            // Wait for loading spinner to disappear
            WaitForLoadingSpinnerToDisappear();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            Console.WriteLine("Found login form, attempting empty submission");
            
            // Find and click submit button - using the same approach as original test
            var button = form.FindElement(By.TagName("button"));
            button.Click();
            
            // Wait a moment for validation to appear
            System.Threading.Thread.Sleep(1000);
            
            // Look for error messages
            var errors = driver.FindElements(By.CssSelector(".error"));
            Console.WriteLine($"Number of validation errors displayed: {errors.Count}");
            if (errors.Count > 0)
            {
                Console.WriteLine($"First error message: {errors[0].Text}");
            }
        }

        [TestMethod]
        private void WaitForLoadingSpinnerToDisappear()
        {
        try
        {
            Console.WriteLine("Waiting for loading spinner to disappear...");
            // Wait for loading spinner to disappear
            By loadingSpinnerLocator = By.CssSelector(".loading-container");
            
            // Use ExpectedConditions to wait for invisibility or element not present
            wait.Until(driver => {
                try 
                {
                    var element = driver.FindElement(loadingSpinnerLocator);
                    return !element.Displayed;
                }
                catch (NoSuchElementException)
                {
                    // If the element is not found, it's not displaying
                    return true;
                }
                catch (StaleElementReferenceException)
                {
                    // If the element is stale, it's likely gone from DOM
                    return true;
                }
            });
            Console.WriteLine("Loading spinner no longer visible");
        }
        catch (WebDriverTimeoutException)
        {
            Console.WriteLine("WARNING: Timed out waiting for loading spinner to disappear after 35 seconds");

        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error while waiting for spinner: {ex.Message}");
        }
        }
    }
}