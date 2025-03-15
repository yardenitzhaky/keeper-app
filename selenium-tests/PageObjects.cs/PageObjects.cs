using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace KeeperAppTests.PageObjects
{
    /// Base page object with common functionality for all pages
    public class BasePage
    {
        protected IWebDriver Driver;
        protected WebDriverWait Wait;
        protected string BaseUrl = "https://yardenitzhaky.github.io/keeper-app";

        public BasePage(IWebDriver driver)
        {
            Driver = driver;
            Wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateTo(string path)
        {
            Driver.Navigate().GoToUrl($"{BaseUrl}/{path}");
        }

        public bool IsElementDisplayed(By locator)
        {
            try
            {
                return Driver.FindElement(locator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        // Helper method to enter text into an input field
        protected void EnterText(By locator, string text)
        {
            var element = Driver.FindElement(locator);
            element.Clear();
            element.SendKeys(text);
        }
    }

    /// Page object for the Login page
    public class LoginPage : BasePage
    {
        // Locators
        private By IdentifierField => By.Id("identifier");
        private By PasswordField => By.Id("password");
        private By RememberMeCheckbox => By.Id("rememberMe");
        private By LoginButton => By.CssSelector("button[type='submit']");

        public LoginPage(IWebDriver driver) : base(driver)
        {
        }

        public void GoToLoginPage()
        {
            NavigateTo("#/login");
        }

        public void ClickLogin()
        {
            Driver.FindElement(LoginButton).Click();
        }

        public void Login(string identifier, string password, bool rememberMe = false)
        {
            EnterText(IdentifierField, identifier);
            EnterText(PasswordField, password);
            
            if (rememberMe)
            {
                Driver.FindElement(RememberMeCheckbox).Click();
            }
            
            ClickLogin();
        }
    }

    /// Page object for the Registration page
    public class RegisterPage : BasePage
    {
        // Locators - only keep the most essential ones
        private By UsernameField => By.Id("username");
        private By EmailField => By.Id("email");
        private By PasswordField => By.Id("password");
        private By ConfirmPasswordField => By.Id("confirmPassword");
        private By RegisterButton => By.CssSelector("button");

        public RegisterPage(IWebDriver driver) : base(driver)
        {
        }

        public void GoToRegisterPage()
        {
            NavigateTo("#/register");
        }

        public void Register(string username, string email, string password, string confirmPassword)
        {
            EnterText(UsernameField, username);
            EnterText(EmailField, email);
            EnterText(PasswordField, password);
            EnterText(ConfirmPasswordField, confirmPassword);
            Driver.FindElement(RegisterButton).Click();
        }
    }


}