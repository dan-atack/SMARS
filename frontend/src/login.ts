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
    _loginMode: boolean
    loginInput: p5.Element;
    passwordInput: p5.Element;
    passwordConfirm: p5.Element | null // Only show password confirm input field if user is signing up for first time
    _loginUsernameError: boolean;
    _loginPasswordError: boolean;
    _loginGenericError: boolean;

    constructor(p5: P5) {
        super(p5);
        this._loginMode = true; // Default setting for the login page is login mode; if false this means we're in sign-up mode instead.
        this._buttons = [];
        // Input fields created are DOM elements (not part of the canvas):
        this.loginInput = p5.createInput("");
        this.passwordInput = p5.createInput("", "password");
        this.passwordConfirm = null;
        this._center = constants.SCREEN_WIDTH / 2;  // Horizontal center, for centering text.
        // Flags for error messages (if adding new ones, make sure to add them to resetErrorFlag method below as well):
        this._loginUsernameError = false;   // Username not found from backend
        this._loginPasswordError = false;   // Password does not match username in backend
        this._loginGenericError = false;    // Either field is empty (before dispatching to backend)
    }

    // Runs initially when the game boots up, assumes user is a returning player logging in with existing credentials:
    setup = () => {
        // Ensure we're working from a clean slate:
        this.handleCleanup();
        this._buttons = [];
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
        p5.text("First time on SMARS?", this._center + 32, 432, 256, 128);
        p5.textSize(12);
        p5.text("Copyright 2021 Dan Atack Comics Online", this._center, 704);
        // Green text begins
        p5.textSize(42);
        p5.fill(constants.GREEN_TERMINAL);
        p5.text("User sign-in page", this._center, 112);
        this.loginInput.parent("app");
        this.loginInput.addClass("login-name");
        this.passwordInput.parent("app");
        this.passwordInput.addClass("login-password");
        // Initial buttons: handle login (sends signal to BE) and setup signup (re-arranges login page to sign-up mode):
        const signIn = new Button(p5, "Login", 200, 512, this.handleLogin);
        this._buttons.push(signIn);
        const signUp = new Button(p5, "New User", 504, 512, this.setupSignup);
        this._buttons.push(signUp);
        this._buttons.forEach((button) => {
            button.render();
        });
    }


    // Alternate setup for signing up new user
    setupSignup = () => {
        const p5 = this._p5;
        this.handleCleanup();
        this._buttons = []; // Reset buttons list to switch them around
        const signUp = new Button(p5, "Sign Me Up!", 200, 512, this.handleSignup);
        this._buttons.push(signUp);
        const login = new Button(p5, "Back to Login", 504, 512, this.setup)
        this._buttons.push(login);
        p5.background(constants.APP_BACKGROUND);
        p5.fill(constants.EGGSHELL);
        p5.textAlign(p5.CENTER, p5.TOP);
        // White text begins
        p5.textSize(72);
        p5.textStyle(p5.BOLD)
        p5.text("Welcome to SMARS!", this._center, 16);
        p5.textSize(28);
        p5.textStyle(p5.NORMAL);
        p5.text("Username", this._center, 192);
        p5.text("Password", this._center, 296);
        p5.text("Confirm Password", this._center, 400);
        p5.textSize(12);
        p5.text("Copyright 2021 Dan Atack Comics Online", this._center, 704);
        // Green text begins
        p5.textSize(42);
        p5.fill(constants.GREEN_TERMINAL);
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
            console.log("Sending login request...")
            const req = { username: username, password: password }
            sendLoginRequest(req);
        } else {
            // If either input field is empty, show a generic error message:
            this._loginGenericError = true;
        }
    }

    handleSignup = () => {
        const username = this.loginInput.value() as string;
        const password = this.passwordInput.value() as string;
        const confirm = this.passwordConfirm?.value() as string;
        const passwordsMatch = password === confirm;
        // Allow signup if username field is not empty and passwords match and are 6 or more characters long:
        if (username.length > 0 && password.length >=6 && passwordsMatch) {
            console.log("Attempting to register new user...");
            const req = { username: username, password: password }
            sendSignupRequest(req);
        } else {
            // TODO: Make sign-up errors more specific
            console.log("Error while signing up new user")
        }
    }

    resetErrorFlags = () => {
        this._loginUsernameError = false;
        this._loginPasswordError = false;
        this._loginGenericError = false;
    }

    // Use render method to handle showing/unshowing error messages for the login/signup process
    render = () => {
        const p5 = this._p5;
        p5.fill(constants.RED_ERROR);
        p5.textSize(18);
        p5.textStyle(p5.NORMAL);
        // Render error messages by type:
        if (this._loginGenericError) p5.text("Please enter valid username and password", this._center, 400);
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