using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System;
using KeeperAppTests.PageObjects;

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
            // Setup Chrome driver with options
            var options = new ChromeOptions();
            options.AddArgument("--start-maximized");
            
            // Create Chrome driver
            driver = new ChromeDriver(options);
            
            // Configure wait
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            
            // Initialize page objects
            basePage = new BasePage(driver);
            loginPage = new LoginPage(driver);
            registerPage = new RegisterPage(driver);
        }
        
        [TestCleanup]
        public void Cleanup()
        {
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
            // Navigate to app using base page
            basePage.NavigateTo("");
            
            // Wait a moment for the page to load
            System.Threading.Thread.Sleep(2000);
            
            // Verify the cookie alert is present
            var cookieAlertModal = By.CssSelector(".cookie-alert-modal");
            Assert.IsTrue(basePage.IsElementDisplayed(cookieAlertModal), "Cookie alert should be displayed");
            
            // Find and click the accept button
            var acceptButton = driver.FindElement(By.CssSelector(".cookie-alert-accept"));
            acceptButton.Click();
            
            // Wait for animation to complete
            System.Threading.Thread.Sleep(1000);
            
            // Verify the alert is no longer visible
            try
            {
                var alertAfterClick = driver.FindElement(cookieAlertModal);
                Assert.IsFalse(alertAfterClick.Displayed, "Cookie alert should no longer be visible");
            }
            catch (NoSuchElementException)
            {
                // If element is completely removed, that's also good
                Assert.IsTrue(true, "Cookie alert was removed from DOM after dismissal");
            }
            
            // Refresh page to verify the setting was saved
            driver.Navigate().Refresh();
            System.Threading.Thread.Sleep(2000);
            
            // Verify alert doesn't reappear
            Assert.IsFalse(basePage.IsElementDisplayed(cookieAlertModal), "Cookie alert should not reappear after dismissal and refresh");
        }
        
        [TestMethod]
        public void Debug_PageLoadTest()
        {
            // Navigate to login page using login page object
            loginPage.GoToLoginPage();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Wait for page to load
            System.Threading.Thread.Sleep(2000);
            
            // Log basic info
            Console.WriteLine($"Current URL: {driver.Url}");
            Console.WriteLine($"Page Title: {driver.Title}");
            
            // Try to find body
            var body = driver.FindElement(By.TagName("body"));
            Assert.IsNotNull(body, "Body element should be found");
            
            // Success if we got here
            Assert.IsTrue(true, "Page loaded successfully");
        }
        
        [TestMethod]
        public void LoginPage_HasFormElements()
        {
            // Navigate to login page
            loginPage.GoToLoginPage();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Wait for page to load
            System.Threading.Thread.Sleep(2000);
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            Assert.IsNotNull(form, "Form element should exist on login page");
            
            // Count input fields
            var inputs = form.FindElements(By.TagName("input"));
            Assert.IsTrue(inputs.Count >= 2, "Login form should have at least 2 input fields");
            
            // Find button - using the same approach as the original test
            var button = form.FindElement(By.TagName("button"));
            Assert.IsNotNull(button, "Form should have a submit button");
        }
        
        [TestMethod]
        public void RegisterPage_HasFormElements()
        {
            // Navigate to register page using page object
            registerPage.GoToRegisterPage();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Wait for page to load
            System.Threading.Thread.Sleep(2000);
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            Assert.IsNotNull(form, "Form element should exist on register page");
            
            // Count input fields
            var inputs = form.FindElements(By.TagName("input"));
            Assert.IsTrue(inputs.Count >= 4, "Register form should have at least 4 input fields");
            
            // Find button
            var button = form.FindElement(By.TagName("button"));
            Assert.IsNotNull(button, "Form should have a submit button");
        }
        
        [TestMethod]
        public void LoginForm_EmptySubmit_ShowsValidation()
        {
            // Navigate to login page
            loginPage.GoToLoginPage();
            
            // Dismiss cookie alert if present
            DismissCookieAlertIfPresent();
            
            // Wait for page to load
            System.Threading.Thread.Sleep(2000);
            
            // Find form
            var form = driver.FindElement(By.TagName("form"));
            
            // Find and click submit button - using the same approach as original test
            var button = form.FindElement(By.TagName("button"));
            button.Click();
            
            // Wait a moment for validation to appear
            System.Threading.Thread.Sleep(1000);
            
            // Look for error messages
            var errors = driver.FindElements(By.CssSelector(".error"));
            Assert.IsTrue(errors.Count > 0, "Validation errors should appear for empty submission");
        }
    }
}