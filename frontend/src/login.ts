import P5 from "p5";
import p5 from "p5";
import AudioController from "./audioController";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";
import { sendLoginRequest, sendSignupRequest } from "./server_functions";
import { playSound } from "./engineHelpers";

export default class Login extends Screen {
    // Login screen types: keep track of buttons to enable click response handlers. Center value is for centering text.
    _buttons: Array<Button>;
    _center: number;
    _loginMode: boolean;
    httpResponseCode: number;
    loginInput: p5.Element;
    passwordInput: p5.Element;
    passwordConfirm: p5.Element | null // Only show password confirm input field if user is signing up for first time
    loginErrorMessage: string | null;
    loginErrorMessagePosition: number;
    username: string;
    loggedIn: boolean;
    switchScreen: (switchTo: string) => void;

    constructor(p5: P5, audio: AudioController, switchScreen: (switchTo: string) => void) {
        super(p5, audio);
        this._loginMode = true; // Default setting for the login page is login mode; if false this means we're in sign-up mode instead.
        this._buttons = [];
        // Input fields created are DOM elements (not part of the canvas):
        this.loginInput = p5.createInput("");
        this.passwordInput = p5.createInput("", "password");
        this.passwordConfirm = null;
        this._center = constants.SCREEN_WIDTH / 2;  // Horizontal center, for centering text.
        this.httpResponseCode = 0;                  // We will use this to determine error messages based on the backend's reponse codes
        // Rather than a bunch of specific flags, we'll set a message based on the HTTP response status from the server.
        this.loginErrorMessage = null;
        this.loginErrorMessagePosition = 0;
        this.username = ""  // Keep track of the username once sign-in/sign-up is successful
        this.loggedIn = false;  // Set to true once login is successful
        this.switchScreen = switchScreen;
    }

    // Runs initially when the game boots up, assumes user is a returning player logging in with existing credentials:
    setup = () => {
        this.currentScreen = true;  // Flag to tell the app to show this screen and respond to its click handlers
        // Ensure we're working from a clean slate:
        this.httpResponseCode = 0;
        this.handleCleanup();
        this._loginMode = true;
        this._buttons = []; // Initial buttons: handle login (sends signal to BE) and setup signup (re-arranges login page to sign-up mode)
        const signIn = new Button("Login", this._center / 2 - 32, 512, this.handleLogin, 256, 128, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons.push(signIn);
        const signUp = new Button("New User", this._center + 32, 512, this.setupSignup, 256, 128, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons.push(signUp);
        // Add input elements to the page in descending order to produce a good tab index
        this.loginInput.parent("app");
        this.loginInput.addClass("login-name");
        this.passwordInput.parent("app");
        this.passwordInput.addClass("login-password");
    }

    // Alternate setup for signing up new user
    setupSignup = () => {
        this._audio.quickPlay("ting01");
        this._loginMode = false;
        const p5 = this._p5;
        // Cleanup old error messages and reset buttons list to switch them around and change their captions
        this.httpResponseCode = 0;
        this.setErrorMessage("", 0);
        this.handleCleanup();
        this._buttons = [];
        const signUp = new Button("Sign Me Up!", this._center / 2 - 32, 512, this.handleSignup, 256, 128, constants.GREEN_TERMINAL, constants.GREEN_DARK);
        this._buttons.push(signUp);
        const login = new Button("Back to Login", this._center + 32, 512, this.handleBackToLogin, 256, 128, constants.GREEN_TERMINAL, constants.GREEN_DARK)
        this._buttons.push(login);
        p5.text("Sign up as new user", this._center, 112);
        // Reset input fields:
        this.loginInput.remove();
        this.passwordInput.remove();
        this.loginInput = p5.createInput("");
        this.passwordInput = p5.createInput("", "password");
        // Add third input for password confirmation:
        this.passwordConfirm = p5.createInput("", "password");
        // Add input elements to the page in descending order to produce a good tab index
        this.loginInput.parent("app");
        this.loginInput.addClass("login-name");
        this.passwordInput.parent("app");
        this.passwordInput.addClass("login-password");
        this.passwordConfirm.parent("app");
        this.passwordConfirm.addClass("login-password-confirm");
        this._buttons.forEach((button) => {
            button.render(p5);
        });
    }

    handleClicks = (mouseX: number, mouseY: number) => {
        this._buttons.forEach((button) => {
            button.handleClick(mouseX, mouseY);
        })
    }

    handleLogin = () => {
        // Check that username and password fields are not empty:
        const username = this.loginInput.value() as string;
        const password = this.passwordInput.value() as string;
        if (username.length > 0 && password.length > 0) {
            const req = { username: username, password: password }
            sendLoginRequest(req, this.setHttpStatus);
        } else {
            // If either input field is empty, play an error sound, show a generic error message, and reset HTTP code:
            this._audio.quickPlay("fail01");
            this.httpResponseCode = 0;
            this.setErrorMessage("Please enter valid username and password", 400);
        }
    }

    handleSignup = () => {
        const username = this.loginInput.value() as string;
        const password = this.passwordInput.value() as string;
        const confirm = this.passwordConfirm?.value() as string;
        const passwordsMatch = password === confirm;
        // Allow signup if username field is not empty and passwords match and are 6 or more characters long:
        if (username.length > 3 && password.length >=6 && passwordsMatch) {
            const req = { username: username, password: password }
            sendSignupRequest(req, this.setHttpStatus);
        } else if (password.length < 6) {
            this.httpResponseCode = 0;
            this.setErrorMessage("Error: Password length must be at least 6 characters", 384);
            this._audio.quickPlay("fail01");
        } else if (!passwordsMatch) {
            this.httpResponseCode = 0;
            this.setErrorMessage("Error: Passwords do not match", 384);
            this._audio.quickPlay("fail01");
        } else if (username.length <= 3) {
            this.httpResponseCode = 0;
            this.setErrorMessage("Please choose a username with at least 4 characters", 280);
            this._audio.quickPlay("fail01");
        }
    }

    // Handles the button click to return to the login configuration
    handleBackToLogin = () => {
        this._audio.quickPlay("ting01");
        this.setup();
    }

    resetErrorFlags = () => {
        this.httpResponseCode = 0;  // Certain values for this will cause error text to appear
    }

    // This method gets passed to the server functions to update the login/signup request's status code
    setHttpStatus = (status: number, username?: string) => {
        this.httpResponseCode = status;
        // If login or signup is successful, call the post-login cleanup method:
        if (username) {
            this._audio.quickPlay("ting01");
            this.handleClosePage(username);
        }
    }

    // Once the user has logged in, cleanup the login screen and tell the App what is the next screen to go to:
    handleClosePage = (username: string) => {
        this.username = username;
        this.loggedIn = true;
        this.handleCleanup();
        this.currentScreen = false; // Tell the App to no longer show the login page once login is completed
        this.switchScreen("menu");  // This crucial little function belongs to the App, and tells it which screen to show next
    }

    // If there is an HTTP status indicating an error, assign a message and position it:
    handleErrorCodes = () => {
        switch (this.httpResponseCode) {
            case 200:   // If the status is 200 or 201, remove error messages
            case 201:
                const msg = "";
                if (this.loginErrorMessage !== msg) {
                    this.setErrorMessage(msg, 0);
                }
                break;
            // Login errors:
            case 403:
                const ms = "Incorrect password. Please try again."
                if (this.loginErrorMessage!== ms) {
                    this.setErrorMessage(ms, 400);
                }
                break;
            case 404:
                const m = "Username not found. Please check spelling or sign up as a new user."
                if (this.loginErrorMessage!== m) {
                    this.setErrorMessage(m, 400);
                }
                break;
            // Sign-up errors:
            case 409:
                const duplicate = "Sorry, that username is already taken. Please try something else."
                if (this.loginErrorMessage!== duplicate) {
                    this.setErrorMessage(duplicate, 280);
                }
        }
    }

    // Call this to set login/signup error messages:
    setErrorMessage = (msg:string, pos: number) => {
        this.loginErrorMessage = msg;
        this.loginErrorMessagePosition = pos;
        if (msg.length > 0) this._audio.quickPlay("fail01");    // Play an error sound if a new, non-empty message is set
    }

    // Use render method to handle showing/unshowing error messages for the login/signup process
    render = () => {
        this._audio.handleUpdates();
        const p5 = this._p5;
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.EGGSHELL);
        p5.textAlign(p5.CENTER, p5.TOP);
        // White text begins
        p5.textSize(72);
        p5.textStyle(p5.BOLD)
        p5.text("Get your ass to SMARS", this._center, 16);
        p5.textSize(28);
        p5.textStyle(p5.NORMAL);
        p5.text(this._loginMode ? "Username" : "Username (at least 4 characters)", this._center, 192);
        p5.text(this._loginMode ? "Password" : "Password (at least 6 characters)", this._center, 296);
        if (!this._loginMode) p5.text("Confirm Password", this._center, 400);
        if (this._loginMode) p5.text("First time on SMARS?", this._center + 32, 432, 256, 128);
        p5.textSize(12);
        p5.text(`SMARS Version ${constants.RELEASE_VERSION}`, this._center, 684);
        p5.text(`Copyright ${constants.RELEASE_YEAR} Dan Atack Comics Online`, this._center, 704);
        // Green text begins
        p5.textSize(42);
        p5.fill(constants.GREEN_TERMINAL);
        if (this._loginMode) {
            p5.text("User sign-in page", this._center, 112);
        } else {
            p5.text("Sign up new user", this._center, 112);
        }
        this._buttons.forEach((button) => {
            button.render(p5);
        });
        // Green text begins
        p5.fill(constants.RED_ERROR);
        p5.textSize(18);
        p5.textStyle(p5.NORMAL);
        // Check for error codes in HTTP response and render error message if there is a problem with the login/signup process:
        this.handleErrorCodes();
        if (this.loginErrorMessage) {
            p5.text(this.loginErrorMessage, this._center, this.loginErrorMessagePosition);
        }
    }

    // Cleanup function to run when login is complete (or when context changes from login to signup/vice versa)
    handleCleanup = () => {
        const p5 = this._p5;
        this.resetErrorFlags();
        p5.clear();
        this.loginInput.remove();
        this.passwordInput.remove();
        if (this.passwordConfirm) this.passwordConfirm.remove();    // Remove PW confirm input field if it exists
    }

}