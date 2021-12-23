import P5 from "p5";
import p5 from "p5";
import Screen from "./screen";
import Button from "./button";
import { constants } from "./constants";
import { sendLoginRequest, sendSignupRequest } from "./server_functions";

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

    constructor(p5: P5) {
        super(p5);
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
    }

    // Runs initially when the game boots up, assumes user is a returning player logging in with existing credentials:
    setup = () => {
        // Ensure we're working from a clean slate:
        this.handleCleanup();
        this._loginMode = true;
        this._buttons = []; // Initial buttons: handle login (sends signal to BE) and setup signup (re-arranges login page to sign-up mode)
        const p5 = this._p5;
        const signIn = new Button(p5, "Login", 200, 512, this.handleLogin);
        this._buttons.push(signIn);
        const signUp = new Button(p5, "New User", 504, 512, this.setupSignup);
        this._buttons.push(signUp);
        this.loginInput.parent("app");
        this.loginInput.addClass("login-name");
        this.passwordInput.parent("app");
        this.passwordInput.addClass("login-password");
    }

    // Alternate setup for signing up new user
    setupSignup = () => {
        this._loginMode = false;
        const p5 = this._p5;
        this.handleCleanup();
        this._buttons = []; // Reset buttons list to switch them around and change their captions
        const signUp = new Button(p5, "Sign Me Up!", 200, 512, this.handleSignup);
        this._buttons.push(signUp);
        const login = new Button(p5, "Back to Login", 504, 512, this.setup)
        this._buttons.push(login);
        p5.text("Sign up as new user", this._center, 112);
        // Reset input fields:
        this.loginInput.remove();
        this.passwordInput.remove();
        this.loginInput = p5.createInput("");
        this.passwordInput = p5.createInput("", "password");
        // Add third input for password confirmation:
        this.passwordConfirm = p5.createInput("", "password");
        this.passwordConfirm.parent("app");
        this.passwordConfirm.addClass("login-password-confirm")
        this.loginInput.parent("app");
        this.loginInput.addClass("login-name");
        this.passwordInput.parent("app");
        this.passwordInput.addClass("login-password");
        this._buttons.forEach((button) => {
            button.render();
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
            // If either input field is empty, show a generic error message:
            this.setErrorMessage("Please enter valid username and password", 400);
        }
    }

    handleSignup = () => {
        const username = this.loginInput.value() as string;
        const password = this.passwordInput.value() as string;
        const confirm = this.passwordConfirm?.value() as string;
        const passwordsMatch = password === confirm;
        // Allow signup if username field is not empty and passwords match and are 6 or more characters long:
        if (username.length > 0 && password.length >=6 && passwordsMatch) {
            const req = { username: username, password: password }
            sendSignupRequest(req, this.setHttpStatus);
        } else {
            // TODO: Make sign-up errors more specific
            console.log("Error while signing up new user")
        }
    }

    resetErrorFlags = () => {
        this.httpResponseCode = 0;  // Certain values for this will cause error text to appear
    }

    // Can we pass this function to the server functions?? YES WE CAN!!!
    setHttpStatus = (status: number) => {
        this.httpResponseCode = status;
    }

    // If there is an HTTP status indicating an error, assign a message and position it:
    handleErrorCodes = () => {
        switch (this.httpResponseCode) {
            case 200:   // If the status is 200 or 201, remove error messages
            case 201:
                this.setErrorMessage("", 0);
                break;
            case 403:
                this.setErrorMessage("Incorrect password for username", 400);
                break;
            
        }
    }

    // Call this to set login/signup error messages:
    setErrorMessage = (msg:string, pos: number) => {
        this.loginErrorMessage = msg;
        this.loginErrorMessagePosition = pos;
    }

    // Use render method to handle showing/unshowing error messages for the login/signup process
    render = () => {
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
        p5.text("Username", this._center, 192);
        p5.text("Password", this._center, 296);
        if (this._loginMode) p5.text("First time on SMARS?", this._center + 32, 432, 256, 128);
        p5.textSize(12);
        p5.text("Copyright 2021 Dan Atack Comics Online", this._center, 704);
        // Green text begins
        p5.textSize(42);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("User sign-in page", this._center, 112);
        this._buttons.forEach((button) => {
            button.render();
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