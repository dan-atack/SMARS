# The Saga of SMARS: ChangeLog and Study Notes

# Volume I: Pre-Release Development (SMARS 0.1.0)

## Chapter One: The Creation of the Git Repo

### Difficulty Estimate: 1

### October 25, 2021

Can't do anything without a repository!

1. Create a remote git repository, and make a simple README file, to fetch to the local repo.

2. Do a 'git init' and then set the remote repo from a local workspace:

   git init

   git remote add origin https://github.com/dan-atack/SMARS

3. Verify the remote repo:

   git remote -v

4. Do a first git pull from the master branch:

   git pull origin master

5. Do an initial git commit and push that to the remote:

   git push --set-upstream origin master

## Chapter Two: The Typescript NodeJS Server

### Difficulty Estimate: 5

### (Based on instructions found at https://auth0.com/blog/node-js-and-typescript-tutorial-build-a-crud-api/)

### October 25, 2021

Well, the first phase of this project was a bit of a freebie, now to start the actual work!

1. Bootstrap an NPM project:

   npm init

2. Install (that's the 'i' in the command shown below) additional packages needed for the project: Express (the server itself), Dotenv (for loading environment variables), CORS (for ah, preventing CORS-related errors) and helmet, which is a security thing. Following a tutorial here:

   npm i express dotenv cors helmet

3. Now that we have some nice node modules installed, add a .gitignore file with node_modules as its first entry. Do another git add/commit/push to test it out.

4. Install Typescript, using the '-D' flag to install it as a 'Dev Dependency,' meaning it will NOT be installed in the production environment:

   npm i -D typescript

5. Next, install the type definitions for the packages installed earlier:

   npm i -D @types/node @types/express @types/dotenv @types/cors @types/helmet

6. Create a Typescript configuration file (tsconfig.json) with basic default values for a simple Typescript project:

   npx tsc --init

### October 27, 2021

7. Create an environment variables file through the command line with the 'touch' command:

   touch .env

8. Add a port number to the environment variables file. For this project we'll use port 7000, as it is a magical number.

9. Add the .env file to the project's gitignore file, to ensure that any secret information that winds up in there later on is not shared on GitHub.

10. Create an SRC directory to host the Node.js application files:

mkdir src

11. Create an index file (in Typescript!) within the source directory:

cd src

touch index.ts

12. Add some commented-out 'sections' to the index.ts file, which will serve as a template for the components of an Express server: Required external modules, App variables, App configuration and Server activation.

13. In the External Modules section, start by importing your various modules that were added with the package installer. The formatting of this import process, by the way, differs somewhat from how we did it in BlockLand, but the essential structure and function of what's being done is the same.

14. Next, call the dotenv's config method to import environment variables. The server index is the ultimate 'top level' module in this project, so it "serves" as the entry-point for everything that needs to be globally accessible within the project.

15. Now for our first deployment of Typescript: saving the PORT variable. Essentially what we have to do here is use the 'process' object, which is a component of Node.js, to check if we can find a value for PORT in the .env file, and then either exit the application if it is not found, or assign it as a constant if it is. The process object seems to refer to the running instance of the Node.js server itself, and so has broad reach in terms of the information contained within it, as well as what it can be asked to do (such as shut down the whole application and throw an error message if an environment variable is missing).

16. As for Typescript, when we declare the PORT variable we'll declare that it's a number, then use the parseInt function, which is one of Javascript's 'built-in' objects, to ensure that what we take from the .env file is understood as a number when it's assigned to that variable. Further, we'll actually ensure that when we originally take that value from the .env file it's actually a STRING, using the 'as string' assignment inside the brackets of the parseInt function, so that we guarantee that we convert a string into a number. Typescript is a harsh mistress, but it acts this way for our own good.

17. Now, let's configure the Express server, starting by assigning the variable 'app' to the output of the express() function call.

18. With the app created, we can now start to configure it to use our imported packages, using Express's 'use' method, in a manner very reminiscent of BlockLand's configuration (although less seat-of-the-pants this time, unsurprisingly). Each package's purpose should be briefly explained in a comment above its 'use' statement.

19. Finally, we create the server, telling it to 'listen' on the port and console log that fact.

20. Next, we'll add another Typescript package, ts-node-dev, to accelerate the development process by automatically restarting the Node 'process' every time a change is detected in any of the source files, while only re-transpiling files that have changed. This is an optimization package for NodeJS apps using Typescript, and on larger apps it can significantly improve the speed with which an app is re-launched between save changes in the development environment. Basically it replaces Nodemon from the BlockLand project; automatically re-launching the app after saved changes and converting Typescript into Javascript when it does so. As with the previous Typescript installs, make sure this one is also installed as a 'Dev Dependency' so it's not included in the project's production files:

npm i -D ts-node-dev

21. We can now prepare the 'dev mode' script in the project's package.json file, which will allow us to launch this sucker! Our 'dev' script runs the ts-node-dev service with a few arguments:

    --respawn <-- Tells the TS Transpiler to keep watching for changes after the script has exited (finished)

    --pretty <-- Uses the Pretty diagnostic formatter

    --transpile-only <-- Uses TS's faster transpiler module

src/index.ts <-- This of course refers to the app's entry file, e.g. the server index file (NOTE that the 'main' file name in the package.json is still index.JS [capitals added for emphasis] since this will be the name of the file that is actually RUN once the Typescript transpiler has converted the project's code into Javascript)

22. For some reason, it appears that adding Typescript to the project somehow removed all of the previously added dependencies... Re-install those with NPM and then boot it up... Success! We're listening on port 7000, although not much else happens at this stage. Still, a triumphant git push seems in order notwithstanding. I suppose this technically means we're just about through setting up the bare bones of the NodeJS server too, although maybe it's not quite time to move on to the next chapter...

23. Setup a 'Hello World' get response in the server and find it in the browser! Then close out the chapter :D

## Chapter Three: MongoDB

### Difficulty Estimate 5, For Real This Time!

### October 28, 2021

The creation of a MongoDB service, and initial connections between it and the server. Starting with a Mongo cheat sheet!

1. Bootstrap a MongoDB service. It turns out you can run the service and enter the terminal from anywhere in terms of the directory you're in when you run these commands to stop and then start the mongoDB service:

   (PS) > net stop mongoDB

   (PS) > net start mongoDB

2. You can then enter the mongo shell terminal program with the following command (again, given from anywhere, and not to be confused with the similar command, 'mongod' which gives a bunch of info about the status of the Mongo daemon [process]):

   mongo

3. Check which databases already exist:

   show dbs

4. Create/enter a new database ('use' command will create a new db if the database name does not already exist):

   use <database_name>

5. Create a new collection within the database:

   db.createCollection('<collection_name>') <-- Note the quotes

6. Add a new document by hand, via the terminal:

   db.collection_name.insertOne({name: 'Doc' occupation: 'Inventor'})

7. Retrieve your document by hand (in the Windows terminal):

   db.find()

8. Add Mongo to the project's dependencies list.

9. Write a simple function to find your test document from MongoDB. Import it to the server and setup a simple endpoint, then visit the relevant link in the browser to call the database import. This function can be removed later on as it is a proof-of-concept... Addendum: Total success! The function was made to work with Typescript, and also demonstrated that it is not necessary to have the mongo application running in Powershell (so long as the process is open the Mongo server will respond... as long suspected but not verified until now!)

## Chapter Four: Unit Tests

### Difficulty Estimate: 6, since this is truly uncharted territory now

### October 29, 2021

This is penultimate chapter in the game's pre-development phase, which is to say, the phase before anything particular to the actual game itself gets developed. What we want now is to install the unit test library Jest, and then create a simple function and a unit test to go with it. Like the database connection in the previous chapter, this is a proof-of-concept job, so the exit criteria will just be to run that test from the command line to check that the test function behaves, and that we can do more unit tests in the future.

1. Add Jest, Jest for Typescript, and Jest Types and to the project's DEVELOPMENT dependencies list:

   npm i -D jest ts-jest @types/jest

2. Add jest to package.json's test script, and add a new test script to test for coverage as well.

3. Make a dummy function that adds two numbers together and export it.

4. Make a new directory, test, at the root of the project.

5. Create a unit test file that imports the adding function and compares its output for 2 + 2 to 4. THERE... ARE... FOUR... LIGHTS!!!

6. Create a jest.config.js file at the root of the project, to tell the Jest API what environment to use for running tests (node) and to use the TS-Jest package, since our program and its unit tests will all be written in TS.

7. GENERAL NOTE: Unit tests need to start with an empty export object in order to avoid block-scope errors for re-declaring the same function/class as the file they're testing. This is apparently a side-effect of unit testing with Jest for Typescript, but luckily it seems to be fairly well known, and therefore hopefully not evidence of malpractice on my part.

## Chapter Five: DevOps It Up A Little Bit

### Estimate: 7

### November 2, 2021

In the final chapter of the abstract, pre-game development phase of the project, the mission is to setup GitHub actions on the remote repo, and create a basic workflow configuration file for the project. As the first implementation of a Continuous Integration strategy, we want to be able to do the following whenever a push is made to the remote repo:

- Checkout the current branch
- Run all unit tests for the code on that branch
- Report on the outcome of said tests and only allow merges to master if all tests are passing
- (Down the line) create and optimize Docker images of the project's code

1. Add simple manual workflow template to 'Actions' section on Github. This creates a new directory, /github/workflows within the project repo, and populates that with a file, 'manual.yml' which contains a simple 'greeting' job, and is executed via the Github UI or API... (see next task).

2. Install the Github CLI and configure it to work on this machine, with VS Code as the default editor.

3. Trigger your manual workflow from the terminal within VS Code:

   gh workflow run manual.yml

4. You can then see a history of the runs of this workflow by using the list command:

   gh run list --workflow=manual.yml

5. Re-configure the manual.yml file to run your npm test script instead of saying hello world.

## Chapter Six: Add P5 and separate the frontend from the backend

### Difficulty Estimate: 8

### December 3, 2021

Never willing to take 'no' for an answer, and remembering that the directory structure of Blockland might not be the most ideal model, the goal of this chapter will be to setup the game's frontend in its own directory and with a separate package file and set of scripts, and making sure that it can 'talk' to the backend. Key sub-goals of this chapter include:

- Creating frontend directory using P5 and Parcel; Parcel builds the typescript (with P5) and runs a dev server that can send messages to the backend.
- Exit criteria: When the frontend and backend are running (using 2 terminals to run each individually), the frontend can send a signal to the backend and get back a reply.

1. Change the filestructure of the project to fully separate the frontend and backend. New directory structure will look like this:

SMARS
..|- backend
....|- src
....|- test
....|- package.json
....|- tsconfig.json
..|- frontend
....|- src
......|- app.ts
......|- other_files.ts
......|- styles.scss
....|- dist (transpiled TS and CSS files)
....|- index.html
....|- package.json
....|- tsconfig.json

2. Do an npm init for the new frontend sub-directory, to create a new package.json to manage the frontend's scripts and dependencies. Since the frontend is detached from the backend, this means that certain libraries which were recently pronounced incompatible might now be given a second chance... LOOKS LIKE P5JS IS BACK ON THE MENU, BOYS!

3. Install Parcel to the frontend, to compile the Typescript (and P5) and run a dev server locally.

4. Make a button in the frontend using P5JS click-response techniques, and have it dispatch a signal to the backend when it's clicked.

5. Setup a new endpoint in the backend server to send a simple response signal.

6. Get a signal to the backend and receive a response from the front, as our first 'end-to-end' proof of concept!

## Chapter Seven: Create basic app framework and login page

### Difficulty Estimate: 6

### December 14, 2021

Since we've finally gotten the stack we are looking for, it's time to create the framework for the game's frontend, starting with a login page and pre-game menu (not rushing ahead with the gameplay this time!). Without going too deeply into the world of media queries, try to make it with mobile devices in mind, or at least with different screen sizes in mind so there's no awkward scrolling on smaller devices. Goals for this chapter include:

- Decide canvas size and test for different screen sizes
- Create simple SCSS styling rules for centering the app within its container (and rounding its edges!)
- Create Screen class, which will be the ancestor of all other menus and pages
- Create Button class, to be used throughout the app; use types to enforce customizability options
- See the extent to which SCSS rules affect text elements made by P5

1. Select a canvas size and test it with different screen sizes. Probably this won't be a very mobile game since it is a simulator but it would be good to have it be at least possible to play on a smaller screen.

2. Create Constants.ts file to contain immutable values to be used throughout the frontend, starting with the base_url to use for transactions with the backend.

3. Create Screen class, which will have a minimal set of properties that can be inherited by its descendents. Height and width will be the height and width of the canvas itself (whose dimensions should also be in that constants file, in order to be universal), and there will also be a boolean property, currentScreen, to denote whether it is the 'active' screen in the game's interface. Basically the idea with this is that if a Screen (or its descendent) is the active screen, it gets shown and any click-response behaviour associated with it is enabled; otherwise it is not shown and does not have its click-response handlers activated.

4. Create one instance of the Screen class in the main App (after importing it), and use it to render the background within the canvas. The app file itself will never do any rendering directly; that will occur through the Screen component, and any other components that are, in turn, called by it.

5. Create a new class, Menu, which inherits from Screen and adds a list of buttons and a color as its defining characteristics.

6. Create a Button class next, which will take arguments for position as well as a function that it will perform when clicked.

7. Create an instance of the Menu class in the main app, replacing the Screen instance. Give it one button, which when pressed calls the backend signal function. Initially, that function will be imported by the Menu class (later functions will be imported by more specific classes, such as MainMenu or InGameMenu, so that the functions associated with those menu types are inherent to them, not the more general parent class).

8. Next, create the Login class, descended from the Screen class, to handle the player's initial sign-in process. Since, unlike the Menu class, this component will not have further descendents, it can be made specifically to show everything that's needed for logging in and signing up; namely, a few buttons and some input fields. This class will have a special 'context' value that will be a string either saying 'login' or 'signup' depending on whether the user exists in the game's DB already or not.

9. Login class will initially have 2 buttons: Login and Sign-up, as well as 2 input fields: username and password. Make all of those elements as the Login class's setup method: this will render them a single time and then wait, unlike the draw method (Which acts upon the canvas instead of creating elements, like your dinosaurs game did).

10. Add some text labels for the username and password fields. Also, above the 'sign-up' button, add text that says 'First time on SMARS?'

11. When login is clicked, we'll want to dispatch the contents (values) of the input fields as a POST to the game's server. Test that this will work by creating a method for the Login class that checks that both the username and password fields are not empty, and logs them to the console.

12. Write a new server function that will POST an object containing a username and a password to the server.

13. Clicking Sign-up will instead change the Login class's loginMode to false, meaning we'll be in sign-up mode instead. To implement this we'll need a function to wipe and reset the canvas, and reprint everything with sign-up texts instead of the login labels. Then we'll need to add a third input for the password confirmation, and switch the two buttons' positions (so that now the default is sign-up instead of login). Now filling in the fields for username and password (and pw confirmation) and hitting 'signup' again will send those values to the backend to create a new user account (all backend activity will be setup in the next chapter).

14. Begin establishing more colour constants and using them throughout the app. It will look better in the long run if we do it this way now.

## Chapter Eight: Backend login functionality

### Difficulty Estimate: 5

### December 19, 2021

Now that the Login page's frontend is more or less complete (save some useful error messages for when the user messes up), it's time to add the server endpoints for the login/signup process, and then write the frontend server-calling functions to interact with them. There are 5 possible outcomes for the logging in/signing up, which will require two endpoints (one for login and one for signup):

- Login success
- Login fail due to username not found
- Login fail due to wrong password
- Signup success
- Signup fail due to username not available

Exit Criteria: User can create a new account which will be saved in the SMARS database, and login with it. Logging in successfully will trigger a console log saying that the login was successful, and displaying the user's name.

1. Create a new server endpoint for handling login requests, and have it console log an incoming login request's information.

2. Create a new server endpoint for handling signup requests, and have it console log an incoming signup request's information.

#3. Create frontend server function for sending a user's login information to the backend, and then console logging the server's response. Think about, but do not yet implement, exception handling for the server's return.

4. Create function for sending a new user's sign-up information to the backend, and again, console log the reply.

5. Create a server database function that will write a new user to the database. Be sure to include the following fields when creating a new user: username, password (note: find a way to 'salt' or otherwise protect this password for experience in security-hardening), dateJoined (date), lastSession (date-time), savedGames, and admin (false by default). This function needs to perform two interactions with the database, one to check if the username exists already, and one to write the new entry (if the username is not found).

6. Create another server database function that will take a user's login attempt and check it against the database, and then grant the user permission to login if the username and password from the frontend match the ones found in the database.

7. Add error messages to the Login class for the following situations (use response code to set them by passing the Login page's httpResponseCode attribute as a second argument to the server functions themselves... that might be the ugliest code I've ever run...)

- DONE - Incorrect password (please try again) (Requires backend response)
- DONE - Username not found (please sign up) (Requires backend response)
- DONE - Username not available (please select another name) (Requires backend response)
- DONE - Passwords do not match (Frontend only)
- DONE - Password too short (6 chars minimum) (Frontend only)
- DONE - New username too short (4 chars minimum) (Frontend only)

8. Rendering error messages: if there is already an error message and another error message is triggered (by clicking either of the buttons) then we must delete everything except the input fields in order to print the new message. Therefore it is necessary to extract everything EXCEPT the input fields' creation from the two setup methods and put everything else into render.

9. Make sure you close the connection to the database when server functions are finished. Just don't close it before they're done using it!

## Chapter Nine: The Main Menu - Frontend edition

### Difficulty Estimate: 6, since we will be adding unit tests to the frontend

### December 23, 2021

Now that the first interface that the user encounters has been completed, it is time to move on to next one: the Main Menu (we'll start actual game development some time around mid-2022 at this rate). The Main Menu will have just a few buttons:

- New Game
- Load Game
- Logout

Each of these will make a call to the backend (all BE functionality to be added in next chapter). Creating the Menu interface should be a relatively simple task on its own, but this chapter will also take the opportunity to add the Jest unit testing library to the Frontend repo, and add some tests of the functionality of both the Menu and the Login page. Additionally, in this chapter we'll need to establish how the App handles transitions between different screens, so that once the login process is complete, the user arrives at the Menu, and if they log out they go back to the Login page.

Exit criteria: Menu screen has three buttons with dummy handler functions. Jest is configured for the frontend, and we have at least one meaningful unit test of front-end functionality (perhaps we can test the App class's screen transition function once it's ready). Backend handlers for the Menu buttons and updates to the project's CI will be added in the next chapter.

1. Once the Login class receives the OK signal from the backend (consisting of a 200 or 201 status and the username that has logged in, which will be added to the response body as username: <username>), we need to take that as a cue to switch from the Login screen to the Main Menu screen. Let's start by adding a new method to the Login class, handleLoginSuccess, which will be called by the http status setter method and clear away the Login page and set the 'currentScreen' property to false if the server's response contains a that username field.

2. Add two new fields to the Login class: username (initially an empty string) and loginSuccess (initially false).

3. On the App level, create a variable for the username which also starts as an empty string.

4. Also at the App level, add a function that checks the login instance's login status (using the new field added in step 2 of this chapter) IF the username in the App class is empty.

5. Create another function for the App, called switchScreen, which will have a switch case that gets fed the string name of the current screen. For the instance whose name matches that string, this function will set its currentScreen property to true. Then in the App's draw function we can add a new if statement to render that particular screen if it has the currentScreen property (draw will essentially check each screen to see which one has that propery set to true, and call its render function if so).

6. Tell the App's checkForLogin function to call the switchScreen function and set the screen to the 'menu' screen once the username has been established.

7. Now to start rendering the menu. First, let's add a new parameter to the Menu class, (but not to its constructor, mind you) to display the current username.

8. Next, rather than creating the Menu's buttons in the App itself and then passing them in, pass the switchScreen function to the Menu (this function will in fact be passed to every Screen, including the Login page) to allow it to dictate which screen to show next as part of its cleanup routine. So when the user clicks the New Game button in the menu for instance, it will close up the Menu and then call the switchScreen function (which belongs to the top-level App script) with the code name for the next screen to be displayed. The App then calls THAT screen's setup method (via the SwitchScreen function) and voila! (See step 12 below for more details on the need for doing things this way).

9. Don't forget to add a new click handler to the App for handling the Menu buttons' click responders when it becomes the active screen.

10. Add some rules to the Menu class for rendering its buttons in an attractive manner on the screen (even spacing, centered, etc.).

11. Add a text element to the Menu class to display the username near the top of the screen (and a greeting!?).

12. Rewire the Menu class (and App functions) so that Menu buttons are created by the Menu's setup method rather than being passed in by the App. This is much, much cleaner at the expense of making the Menu class less re-usable since it's now the dedicated pre-game menu (it cannot be repurposed to also serve as the template for the in-game menu). This is a highly acceptable trade however, given the simplicity that it gives to the code overall. When the time comes, it will simply be necessary to make a new class for the in-game menu, also descended from the Screen class.

13. Create a Logout button, to allow the user to return to the Login page (and also get rid of the username at the App level). In the Menu this means resetting the username to "", and for the App's switchScreen's "login" case, this means setting the App level username to "" as well, and telling the login page to set the user's loggedIn status back to false (so that the App will resume checking for a new username).

14. Before we close out this chapter, it'll be time to add the Jest unit testing library to the Frontend's package, including adding the jest.config.js file and adding "test" and "test-coverage" scripts to the frontend's package.json file.

15. Make a test directory for the frontend, in anticipation of future tests. At the end of this chapter, contemplate what might be a good candidate for a unit test, but don't worry about it for now if we don't add one right away!

## Chapter Ten: Backend Functions for the New Game Screen

### Difficulty Estimate: 5

### December 29, 2021

Since the frontend has now progressed to the point where there are 2 working screens (login and main menu), it is time to pay some more attention to the backend, and set up the functionality that will support the next three screens (new game, load game and... well, preferences won't really to much for now but it will want to speak to the backend eventually). First priority will actually be to get some content loaded into the DB from the Blockland Map Editor. To do this, we'll need to establish a 'staging' file paste new map data into, as a prelude to sending it to the SMARS database, then write a function to retrieve a map based on its type.

Exit criteria:

- It is possible to create a new map using the Blockland editor, transfer it to the 'staging' file, and then upload it (using a shell command) to the SMARS database.
- It is possible to retrieve a map given its type - set up the endpoint for the server using req params then visit it

1. Create types for the Map and Save database entries, including all of the fields from the brainstorming session. Bear in mind that we'll let Mongo create the \_id's and that they will be in use.

2. Create the addNewMap function. This and the Map type above will be in the server's map functions.

3. Create a new file, mapImporter.ts, and put it at the root of the backend directory. Set it up to contain an export of an object that can have the contents of the Blockland map editor pasted into it.

4. Add this file to the project's gitignore.

5. Import this file to the addNewMap function's file and then run the add new map function from the command line by adding a script to the backend's package.json that runs it with the ts-node-dev command to add a new map to the database. Verify in powershell.

6. Create the getMap function, which will take a type argument from the req parameters and find all the maps that correspond to that type. So when there are three maps, and two have the type 'test' and one has the type 'polar,' when we search by type = 'test' we should only get the first two.

7. Create two maps with different types ('test' and 'polar') and save them to the database.

8. Set up the mapEndpoints file for handling server requests for a new map. Connect this to the getMap function and see if you can retreive your maps by visiting that endpoint with the appropriate URL parameters.

9. Lastly, for the sake of elegance, write a function that loops backwards through map files and eliminates all of the zeros that are tacked onto the end of a map file by the BlockLand editor (in other words, remove all of the 'empty sky' zeros before adding map data to the database). Test this by creating a new map in the BL Editor, copying it over to the mapImporter file, and running the add-map script again to check the output...

10. As usual, nothing is as easy as it seems; to avoid polluting the database we need to isolate the map upload function from the backend since the dev server launches our add-map script every time any backend file is saved (this is what watch mode does, and it's usually very handy). To fix this, create a new directory within the SMARS project, called 'map_editor' and install the following packages there:

- Typescript
- tsc
- ts-node-dev
- mongodb
- assert

11. Then remove the 'add-map' script from the backend and add it to the map editor's package.json. Try making a few maps and saving a few times to ensure it works correctly.

12. Update the project's gitignore to ignore everything in the map_editor directory.

## Chapter Eleven: Frontend Pre-game setup screen

### Difficulty Estimate: 5

### December 31, 2021

On the closing day of the year, let us begin work on the final pre-game interface: the New Game Setup screen. There's quite a lot of info to show on this screen, and it all needs to get passed to the Game Screen (to be developed in the next Chapter) so the work done here needs to anticipate the hand-off between pre-game setup and the actual game itself. Let's start by establishing what we want from a Pre-game setup screen.

Exit Criteria:

- Setup Screen allows user to choose difficulty level
- User can select one of three map TYPES, and get a small preview image of what the terrain will look like
- User can choose whether or not to enable random events
- One button starts the game
- Another button returns to the Main (pre-game) menu

1. Create the NewGameSetup screen, descended from the Screen class. It will have the following fields: difficulty, map type, randomEvents and minimap.

2. The NewGameSetup's setup method will create the following buttons, with console logs announcing they've been pressed to begin with: Easy, Medium, Hard (difficulty settings); Highlands, Polar, Riverbed (map type options); Yes or No for random events; Start Game and Back to Main Menu (these will call the switchScreen function, one to the game screen[!] and the other back to the previous screen).

3. Make the handlers for the start-game and back-to-menu buttons, and also copy over the button-handler methodry from the Menu class, and repurpose it for this screen. Add the "game" switch case to the App, and test that pressing the 'start game' button will go the the game screen, and that the 'return to menu' button does indeed go back to the main menu.

4. Setup the screen's textual elements next: "Set up new game" prominently up at the top, in the same white font as the main title, then maybe a slightly GREENER green as the colour for the non-button text that appears, for instance, within the description fields for the various options... the colour can easily change, of course, as it will use a constant value.

5. As for buttons, they should probably have a field for being \_selected, as well as a method for setting that property. Since pre-game setup options are selected all at once we need a way to easily see which value has been chosen for each category (difficulty, map type, etc.).

6. Add an instance of the NewGame class to the App file, then add it to the switchScreen case handler, the button responder (copy that functionality from the Menu class I guess?) and the master draw function. Then test it out!

7. Pretty-up the page before adding the minimap.

8. Create handler functions for the difficulty setting buttons; clicking one will set it to being selected, and de-select the others.

9. Create handler functions for the map type buttons. For now, ignore the fetch requests to the backend (we'll deal with them in a minute).

10. Create handler functions for the randomizer buttons.

11. Design a server function to pass a type name to the server's getMap endpoint. Feed that into the handler for the various map type buttons. Console log the map that gets returned.

12. Create two maps for each map type with the Editor/importer process.

13. Create the description text elements for each difficulty mode and terrain type and display them as appropriate (via a switch case in the render method??).

14. When the Start Game button is pressed, make it console log all of the information that will be passed to the Game module on startup: difficulty level, map type, terrain, random event boolean. These will become the contents of the StartGame type that will be one of the arguments to the Game class's constructor file (about which more in the next chapter).

15. Lastly, the Minimap: create a brand-new component class to render a simple map preview by creating a series of rectangles from a list of lists (using each sub-list's length as the sole criteria to determine the length of each rectangle, to save on processing power, or something!). Use this to render the map preview for each map that is loaded.

## Chapter Twelve: The Game Screen!

### Difficulty Estimate: 8 due to large complexity and need for finalizing designs before implementation

### January 1, 2022

To kickstart the new year with some fresh momentum, let's get started with the Game Screen at last! The game screen will be the interface the player uses to play the actual game, and it will need to be able to show many other components: the map, the sidebar, information popups, and additional in-game interfaces such as the tech tree or the population screen. This means that the top-level game component will essentially be a little app of its own, controlling which in-game screens are shown and updating the game's world via the Engine component.

Start criteria: (And answers as sub-bullets)

- Establish the full list of in-game screens:
  - map and sidebar [default view]
  - tech tree
  - population overview
  - report from Earth
- Establish top-level sidebar layout:
  - Martian clock
  - Username and avatar
  - Main Menu button
  - In-game info view buttons (population, tech, etc.)
  - Build options
  - Resources options
  - Overlay options
  - Query tool
  - Details panel
- Establish if updating everything should be delegated to an Engine component or if the Game class can handle it itself:
  - The Game class will have the responsibility of managing the in-game SCREENS; all game mechanics will be the province of the Engine (it will call the update/render methods for all of the various classes for Modules, Logistics, Population, etc.)
  - Mouse context will be the province of the Engine as well; since the Engine belongs to the Game, the Game will always be 'aware' of what mouse context the Engine is in.
  - Sidebar will also belong to the Engine, as it will interact with the mouse context info. So the control tree for within the game looks like this:

<img src="mockups/Basic_Component_Heirarchy.png" style="width: 60%;"/>

- Establish how click handler context will be managed:
  - Engine component has different 'mouse contexts':
    - query tool (default; lets you click on stuff to see info about it in the sidebar)
    - module placement
    - logistics placement start
    - logistics placement end
    - resource extraction target (to tell a worker/rover where to dig)
    - modal popup
- Engine will also handle the sidebar, including its extended/retracted status

With all that established, let's set the exit criteria for this chapter. Given the massively ambitious scope of the project, let's try to keep things down to a fairly small, achievable increment. Let's just start with the basic page layout scheme for The in-game interfaces, so make the Game component itself, then the Engine, Population, Technology, Earth, Industry and Logbook classes. Each one can begin as a simple page, and the exit criteria is that once the game starts you arrive on the Engine view and from there you can go to any of the other views within the game. This of course means that the Sidebar class will also need to be created for the Engine to control, and we might as well make the Map class too, although it can remain empty for now (we'll make it just to see how it shares the space with the sidebar).

Exit criteria:

- After clicking the Start Game button, the player arrives at the Engine view of the Game screen
- The Engine view has two sub-components, World and Sidebar, and within the Sidebar are the buttons to switch to the other in-game views
- Clicking any in-game view on the sidebar opens it as the main screen within the game
- In-game views contain their name and a close button which redirects back to the Engine interface
- Sidebar also contains a function to open the Main Menu, which calls the App's switchScreen function and goes to a new screen: InGameMenu
- The Game can tell if it's a new game, and prints the setup information from the pre-game screen when it's first entered (but not when it's returned to from the in-game menu).

1. Create the Game Class (inherit from Screen) and in its constructor get it ready to create an instance of each of the in-game views mentioned in this chapter's description. Give it a simple render method that just shows a hello world message on the screen.

2. Instantiate the Game class within the App, and add it to the switchScreen function, the mouse handler function and the draw function. Verify that you can get there from the new game screen.

3. Create the first of the in-game screen classes (Engine, since it's the default) again descended from the Screen class, again with a very simple initial render method that prints a 'hello SMARS' text to the screen.

4. Add the Engine class to the Game's constructor, and create the Game's setup method which calls the Engine's render method (or setup method) to show that component (And to declare it to be the currentView at the GAME level - add a switch case to the Game class to be able to handle different in-game views just as the App has for its screens, using the term 'view' in lieu of screen to avoid confusing the two).

5. Get the new game data to the Game class by adding some logic to the switchScreen's game case, such that it checks if the game already has that data and then gets the info from the pre-game setup screen ONLY IF it's not there already (we need this since it will be possible to enter the game screen from a 'load game' context in which case that data will not come from the pre-game setup screen). The Game class will need a setGameData method to be called by the App's switch case.

6. Create the Sidebar class and pass it to the Engine. Sidebar should occupy one quarter of the game's real estate on the right-hand side of the screen, and it will need a hello world setup and a handleClick method borrowed from the Menu class.

7. The Engine will also need a click handler to check if the mouse is over the sidebar when it's clicked, and call the sidebar's handleClick method if so.

8. Create the classes for the other in-game views, again with a very basic layout: setup function prints a little hello message, and at the bottom there's a button that has the game's changeView method to return to the main page... To save on trouble in the long-run, make all of these classes descend from a basic View ancestor class, which takes an additional argument for the changeView function to be passed to it.

9. Add instances of the new in-game view classes to the Game class's constructor.

10. Add buttons for switching to the in-game views to the Sidebar; test if they can be entered and exited.

## Chapter Thirteen: Filling out the Sidebar

### Difficulty Estimate: 3 - aren't we getting optimistic again!

### January 5, 2022

Before diving into the game's world directly, let's take a few moments to complete the layout and initial styling of the Sidebar panel, since it will be a vital part of the game's architecture and will help to solidify expectations about the game play experience itself. Like many other components, the Sidebar is deceptively complex too, as it will contain many buttons that will re-arrange parts of its own layout when pressed. Let's figure all of that out before getting into the game's world itself.

Exit criteria:

- All top-level buttons and components are visible and have minimal functionality, including the clock and Martian calendar.
- Engine setMouseContext method is created and passed to the Sidebar; activated when e.g. building new modules or hitting select or resource buttons.
- Clicking the Build button alters SB layout to show building category options; selecting a category brings up a list of individual building options.
- Minimap is visible in Details Area when no build/details options are not selected (in other words, when 'details' mouse context is active but no target has been selected, or map overlays/resource extraction mode are activated).

1. Choose a new colour for the non-screen buttons (Build, Extract, Details and Overlays), then make each of those buttons, plus their handler functions (can be simple console logs for now).

2. Make a rectangle for the details section of the sidebar, with maybe a darkish cyan kind of colour? It will form the background to the bottom half of the sidebar.

3. Add two circles near the top of the sidebar; the first one will dark blue, and will be the clock for the time of day display, and the second one will be dark red and will be used, eventually, to display the current Martian weather. Some day.

4. Create a new component class for the DetailsArea, and allow it to be in either an 'extended' or 'normal' mode depending on whether the sidebar's Buildings button is activated. If it is, tell the Sidebar to not show its normal list of buttons, and instead give most of the real estate to the DetailsArea (in extended mode) which will then render the building options categories, then individual building options, and finally the details for a seleted new building project. Building categories and options can be regular buttons, but we'll need at least a rudimentary new component for the new building details card.

5. Integrate the DetailsArea component into the sidebar. Give the Sidebar a setBuildOptions method and pass that to the DetailsArea so it can close itself/notify the Sidebar when it has been closed.

6. When in expanded mode, have the DetailsArea component render text element saying 'Build Options' as well as five buttons: Habitation modules, Industrial modules, Logistics, Vehicles, and BACK.

7. Create console log handlers for all but the last of these buttons; give the BACK button the setter function for the sidebar itself, so hitting it not only shrinks the details area again but also tells the Sidebar to resume showing and handling its own buttons.

8. When the building options are not selected, have the Details Area show the game's minimap!

9. Add an hour hand to the Martian clock.

10. Add a buildTypeSelection value to the DetailsArea's constructor. Add a setBuildTypeSelection method as well, which takes a string argument and uses it to set that value.

11. Give each building category's button handler method the ability to set the build type selection to a string that will go into a switch block, to determine which building options to show when that button is clicked.

12. Create a showBuildingOptions method for the DetailsArea that is called by the render method only if there is a value for buildTypeSelection (truthiness in action: if the string has no characters it's considered false!). This method will eventually fetch a list of building options from the server and use their data to fill out Building Chips - button-like components that display several bits of information about a structure or module. For now have the showBuildings method just print which building category was selected in a text element at the top of the details area, as well as rendering a 'back' button which sets the buildTypeSelection back to "", causing the building category options to be rendered again.

13. Create a new component class, BuildingChip, which will extend the Button Class but with default values supplied to all of its constructor function arguments so that the BuildingChip's own constructor will only need one argument which is the buildingData object, whose shape can be very simple right now (just a name, in fact). As well as x and y... and p5, naturally... Wow, this component has more arguments than the Spanish Inquisition has chief weapons.

14. Import the BuildingChip class into the Details area and have the \_optionsButtons property be a list of those instead of regular buttons.

15. Tell the handleHabitation button responder to create a list of three BuildingChips by making one for each of a short list of strings and pushing them to the optionsButtons list.

16. Tell the showBuildingOptions method to render all of the \_optionsButtons.

17. Create a populateBuildingOptions method to be called by each of the individual category buttons.

18. In the Engine, create a new method called setMouseContext, as well as a field for storing the mouse context, which will be a string. There will be a few different options that can eventually be given here, each of which will correspond to a case in a switch block within the handleClicks method for clicks falling outside the sidebar. Default value for this string will be "select" to represent the fact that when you first arrive in the game's UI you haven't actually selected anything, and thus clicking on an item (module, colonist, etc) selects it for examination.

19. Add a switch case to the handleClicks method in the Engine, to console log different mouse contexts when the mouse is clicked within the game's "world" area (i.e. not the sidebar).

20. Next, change the constructor requirements for the Sidebar and DetailsArea components to accept the setMouseContext method and store it as one of their own methods.

21. From the Details Area, pass the setMouseContext function to the BuildingChip component. Then give that component a handler function (overriding the basic button class's handler) that supplies a text string for the type of building activity (initially just 'place', but with the possibility of alternating between that and other options, e.g. 'twoPartPlace' or some such, in the future).

## Chapter Fourteen: Rendering the map (terrain)

### Difficulty Estimate: 5 - it's been done before but we need to consider scrolling

### January 13, 2022

Now that the sidebar has been set up, it's time to start rendering the game's world, starting with the map terrain. Taking the data from the pre-game selection screen, the Engine will print a series of blocks that will be the in-game terrain. In this chapter we'll need to establish rules for displaying the map, scrolling through the map if it's wider than one screen's width, and how much information each block will contain (does it just have a 'type' or is there more information about resource quantities and the like?)

Exit criteria:

- When the game starts, the map is visible in the game's world area
- If a map is too wide to be shown all at once, only a portion of it is rendered in the game's world area
- Clicking the mouse near the edge of the world (or hovering over it for a second) scrolls the map to that direction
- Resource information for the individual blocks is out of scope for this issue
- Vertical map scrolling will also be out-of-scope for now

1. Let's start by making some new classes: Map and Block. Look at the work done for the proof-of-concept project for inspiration.

2. Make a block dictionary INSIDE THE CONSTANTS FILE! Use this to add six different block type entries to interact with the Block class's constructor function. Export as a separate constant ('blocks') since most modules importing the constants won't need it.

3. Add block width value to constants file as well; use it to adjust the width of the game's columns.

4. Experiment with map scrolling by adding a new app-level method that fires on mousePressed (mousedown) as opposed to mouseClick (which is equivalent to mouseup). Then pass this to the Game and Engine modules so that they receive a different signal when the mouse is pressed, followed by the regular one when the click button is released.

5. Give the Engine a handleMouseDown method, which fires on the mousedown event, and looks to see if the click was within the 'scroll range' of either the right or left side of the map area. If it is, set a new flag for scrolling left/right to true until the mouse button is released.

6. Have the Engine's regular click handler reset the scrolling flags so that when the mouse button is released, no scrolling occurs.

7. Give the Engine a horizontal offset value and increase it by one pixel per render so long as the scrolling flag is set (or decrease by one pixel per render if the scroll direction is to the left).

8. Add an offset argument to the Map's render method so that the Engine can pass its offset value to the Map to include in its render calculations. As the offset increases (or decreases), this should cause the map's rendered output to shift to the side.

9. Make 3 more maps in the Blockland Editor, this time considerably wider so that we can test scrolling abilities more extensively.

10. In order to situate the player in the middle of the map (as opposed to on its left-hand edge), have the Map's setup calculate the total width of the map and then add an initial offset so that when the map renders it is already offset (and thus the player can immediately scroll either to the left or right, to make things more immersive).

## Chapter Fifteen: The Passage of Time

### Difficulty Estimate: 3

### January 15, 2022

The moment has arrived to implement the second of Kant's intuitions in the SMARS universe: time. The passage of time needs to be recorded by updating the game's internal clock and calendar so long as the Engine is running. Each render update will be recorded by the Engine as a tick, and every so many ticks will advance the game's internal clock by a certain amount. It should be possible to adjust the pace of time in the game by altering the amount of ticks in a... tock (increment). Ultimately the time keeping system should allow the implementation of day/night cycles and changing weather patterns between the Martian seasons. Rules for how to represent the Martian calendar should be established before implementing anything too complicated.

Exit criteria:

- The game has an internal clock that can monitor minutes, hours, days and years (years condensed to four days for brevity's sake) as well as an AM/PM cycle
- Game's clock and calendar display are updated by these values
- Clicking the Earth screen shows the current Earth date (calculated relative to Smartian date)
- Sidebar has new buttons: pause, slow, fast and turbo (labeled with chevrons to save space) that set the pace of time by altering the Engine's ticks per minute

1. Add a tick property to the game's Engine, and tell the render function to increase it by one every render.

2. Add a ticks per minute property and a minutes counter to the game's Engine and tell the render function to reset ticks to zero every time this number is reached, and augment minutes counter by one. Display minutes count in the world area to watch it tick.

3. Isolate time-keeping functions into their own Engine method so that the renderer can call that every time the basic tick counter is reset.

4. Add rules for the time-keeper to reset minutes each hour, and hours each day (actually twice per day; add an AM/PM value too). Print the whole time string to the screen and watch it for a whole "day" (hereafter referred to as a Sol).

## Chapter Sixteen: Modal Dialogues

### Difficulty Estimate: 5 due to planning of how and when modals will appear and be dealt with

### January 20, 2022

An important feature of SMARS's complex User Interface will be in-game popup dialogues AKA modals, which will be used liberally throughout the game to communicate important information to the player such as random events, [optional] tutorial info/advice, and various other events as the game develops ("I'd say from the depth of this ice that this thing must have been buried for at least 100,000 years!")

Exit criteria:

- In-game modal popup is shown at the start of the game and goes away when its 'dismiss' button is clicked
- Even though it's not directly related, this chapter will see the introduction of an environment variable for Dev Mode in the game's frontend directory, and an additional Modal popup will appear at the game's start when we're in dev mode (and not when this value is removed).
- Modal popup appears you when a full Smartian day has passed (Dev Mode feature)

1. Create the Modal class (brand new class) to be deployed by the Engine. Have a bit of a think about what its layout will be first, as well as how the Engine will know when to show you one, what its handler/s will be, etc.

2. Create a new method for the Engine, generateEvent, to be called each hour by the clock advance method. Have it take an optional number argument, which will be the percentage probability of firing an event. If it is called with no arguments it should take that as a signal to fire an event from a sequential list; if it gets the probability argument then it should only fire if a random number falls within the range of likelihood, and take an event from a different list.

3. Create new game constants lists: random events and scheduled events, to be called by the Engine. Events in both lists should have:

- A title
- A caption/text
- A unique ID number
- A one-item list of "resolutions" that will come to represent the various options for events where the player has to choose between different outcomes (multiple outcomes are outside the scope of this ticket but it's worth preparing for them now)

4. Have the Engine display a scheduled event at 1:00AM on the first day.

5. Have the Engine display a random event (with 50% odds) by calling the random event generator once every hour until it fires.

6. Create Dev Mode environment variable for the frontend, and use it to conditionally show a modal after the game's first hour.

7. Quickly experiment with adding a directory structure to the Frontend to categorize resources

## Chapter Seventeen: Managing Buildings in the Backend

### Difficulty Estimate: 5 [Hindsight: 8]

### February 1, 2022

After a brief pause to do some design work, the time has come to add the first module data to the backend! The goal for this chapter is to create the mechanisms for adding new buildings (modules and logistical/connector structures) to the game's database. Since there will eventually be many different types of modules and logistical connector things, each will have its own collection within the DB: Modules and Connectors. This chapter will focus on making the first few test structures to add to the game's interface in the next chapter, but more importantly, it will create the tools to easily add more buildings, as well as determining the object shape for modules and connectors.

Exit Criteria:

- Preliminary types for modules established
- Preliminary types for connectors established
- Modules and Connectors collections created in the DB
- Database function created for uploading a structure's info to either of these collections
- Database function for modifying a structure's info for either of these collections
- Database function for deleting a structure from either collection
- Database function for getting structures from the DB, initially just getting everything from a collection
- Server endpoint for using the reader function
- NPM scripts to run any of the above functions

1. Create the Modules collection in the DB.

2. Create the Connectors collection in the DB.

3. In a new file in the "world editor" directory (now renamed) make a file, newBuildings, that exports the Type information for Modules. This file will also contain the initial buildings' data, since the world editor directory is gitignored.

4. Create another file, add_building, which will read a list of new building info objects (using the Module type info) and upload any new items to the database's modules collection. As an experiment, add an \_id property to the module type info, and see if that can be taken advantage of to prevent duplicates from being accidentally pushed to the DB. If this doesn't solve that potential problem, then just be careful with the module uploader when adding new structures.

5. Fill out the information for a single test building, to use to validate the uploader function.

6. Add a new script to the world_editor's package.json file, which transpiles and runs the code in the add_buildings file. Run this script twice to see how many entries end up in the modules collection... Update: Mongo seems to understand what we're at with the \_id property but Typescript is getting really confused by it, so we will have to resort to just being careful when adding new buildings to the DB, and keeping older modules in a separate file called older_buildings for posterity.

7. Create the type information for Connectors now, in the new add_connectors file.

8. Copy the add_buildings file's database function into the add_connectors file, and modify it to point to the Connectors collection. Then rename add_buildings back to add_modules, as they will be kept completely separate. More code but less work this way - an ugly system to be sure but functional which is what counts right now.

9. Add a new script to the package.json for adding new connectors. Keep old connectors in a separate list within the older_buildings file when they're uploaded to the DB.

10. Make updater function for changing a module, and test it with its own package.json script.

11. Make updater function for changing a connector, and test it with its own package.json script.

12. Make deleter function for removing a connector/module (the specs go in the file itself) and deploy it with its own package.json script.

13. Make finder function to get structures from either the modules or connectors collections, and connect that to a new endpoint.

14. Make new endpoint for searching for structures in the backend, and add it to the server's index file.

## Chapter Eighteen: Buildings in the Frontend

### Difficulty Estimate: 6 due to regular difficulty plus a coat of rust on this here programmer!

### February 25, 2022

Following the addition of some basic structure data to the backend, it is time to make the connection and get buildings added to the game's interface. The goal of this chapter will be to get the building data from the backend into the Build menu (which may need to be re-worked to be more dynamic), then establishing the rules for structure placement. We'll also take this opportunity to implement the first of the frontend's unit tests, to verify that the logic for structure placement works correctly. This will probably involve using Mock tests to simulate the placement of buildings in the game's world, and checking that no undesired behaviour is allowed (such as buildings floating above the ground, buildings overlapping each other, etc.) This chapter will take a gradual approach to adding complexity to building placement, starting with simple overlap tests, then terrain checking, and finally structural strength evaluation. Calculations relating to costs will be out of scope, as will considerations of pressurized vs non-pressurized volume.

Exit criteria:

- Test building data can be fetched from the backend and displayed in a console log from the frontend
- The player can select a building from the sidebar and place it on the map (when the structure is selected would be a good time to console log its extended data, by the way)

1. Make a new server function to call the modules endpoint in the backend. This function should take two arguments, which are the category and type of structure to get from the backend. UPDATE: by making the second argument (for module/collection TYPE) optional, we can now use this function to return EITHER the list of structures for a given type, OR the list of types themselves for either category of structure. This would also be expandable in the future, i.e. if more than two categories are used (Never say never, vehicles collection!)

2. Go back to the backend and add a new structure finding function that queries one of the two collections (modules or connectors) and returns a list of the unique types of structures within that collection.

3. Re-structure the detailsArea component to initially show a two-item list of options: modules and connectors (and the back button). Remove all other top-level buttons from this component.

4. Add new field to the detailsArea component to hold information about which structure category is selected, along with which type (so there can be a total of 3 'layers' of option buttons).

5. Import the getStructures function to the detailsArea component, then have it get called with a single argument by your two new buttons (Modules and Connectors).

6. Now modify the getStructures function to accept an additional, mandatory argument, the setter function to pass the list of types it retrieves to the detailsArea component when it gets them from the backend.

7. Separate the original getStructures function from the getStructureTypes variant, so that each can be called separately.

8. When the detailsArea's buildTypeOptions value is set, render a new set of buttons, labelled for the different Types. Do not render the actual building options themselves, and ensure that the component's click handlers are also adjusted.

9. Re-jigger the detailsArea's whole button rendering logic to allow it to show three layers of options: building categories, building types (within a category) and individual building options (within a type).

10. When a building type is selected, do a second fetch to get the buildings for that type, then console log them when they come in.

11. Update the building list fetcher to take an argument for a setter function, and copy the type definition for building data into the frontend's server functions file so it can set the types for the data passed to the buildingOptions field.

12. Time to enforce a standard: All database read functions will convert all queries and results to lowercase, and all structures in the modules and connectors collections will be updated to have their TYPE fields in lowercase.

13. Alter the backend's structure functions and endpoints so that modules and connectors use a different endpoint, and the request parameters can be used to specify the type of module/connector, instead of having the parameter be either 'module' or 'connector' and then returning every item from one of those two categories.

14. Update the README file for the World Editor suite to include detailed instructions on what to do and what to expect when adding modules/connectors to the game's backend.

15. Add a field to the detailsArea for 'selectedBuilding,' which holds the data for a module / connector.

16. Create the Module class, which will take ModuleInfo sized data as its main constructor argument.

17. Create the Connector class, which will take ConnectorInfo sized data as its main constructor argument.

18. Create the Infrastructure class. Take a look at the game jam version first, for inspiration. Then take almost nothing from it.

19. When the detailsArea has a building selected, have the Engine register that fact.

20. When a building is selected and the engine's mouse context is 'place,' have the engine console log the selected building's data when the mouse is pressed on the screen.

21. Now, when the mouse is pressed in the place context and there's a building selected, have the engine call a new Infrastructure method called placeBuilding, which adds the selected structure to either the \_modules or \_connectors array for the Infrastructure class.

22. Now figure out how to make the Infrastructure/Building classes render on the screen.

23. When the Engine has a building selected and is in place mode, make the mouse cursor a shadow of the selected building when it's hovering over the map area. Also, make it snap to the grid. (Look at the game jam for an example of how this is done).

24. Now when the mouse is pressed and a building is selected and we're in place mode, add that building to the Engine's Infrastructure component (matching the building type - module or connector - to the appropriate Infrastructure list).

25. Add a cancelBuilding method to the Engine, to be activated by the back button if a building is selected. Clicking 'back' when a building is selected does not change the displayed building option buttons, but cancels the placement selection process for the currently selected building (sets the mouse context back to select and sets the selected building value to null).

26. Iron out the kinks in building rendering and placement process:

- Buildings don't disappear until they're entirely outside of the screen
- Building placement shadow should only be rendered if the mouse is over the map area, not the sidebar
- Add an outline to selected build chips, so that the player can see which building is selected
- Disable map scrolling when mouse context is in building placement mode
- Clicking the building chip for the building that is already selected unselects it

27. Clean up the on-screen 'console log' text before ending the chapter.

## Chapter Nineteen: Buildings in the Frontend II - Module Placement Logic

### Difficulty Estimate: 6 for new dynamics development

### March 22, 2022

Since the implementation of the building placement process is a bit more involved this time around, it was necessary to get the basics down first, then move all of the more advanced rules governing building placement into a separate chapter. This chapter will focus on those more advanced features - namely limiting building placement based on terrain and the locations of other buildings. Once these constraints are in place, we can map out a timeline for adding further considerations, such as resource costs, advanced connector placement (multi-click placement for connector start/stop locations) and connector orientation (horizontal / vertical / composite (H + V) connector segments). Edit: also, Unit tests! Damn the nay-sayers, even if they're highly imperfect since it's hard to wire them up with P5 they're still worth doing, dammit!

Exit Criteria:

- Placing a module is constrained by:
  -- [DONE] Terrain (no obstacles in the way)
  -- [DONE] Terrain/gravity (must be placed on flat ground)
  -- [DONE] Infrastructure (no other modules in the way)
  -- [DONE]Infrastructure/gravity (strength of the module beneath)
  -- [DONE] Infrastructure + terrain + gravity (can be placed on a combination of flat ground and other modules)
- Module Info data structure has 'shapes' added to it, so that we can begin to store more elaborate building images in the backend, and have the frontend interpret them. This would be a big boon to the game's development, in terms of enriching the game's Lookanfeel, so let's really aim to have at least something there before ending this chapter.

1. Make a new Infrastructure class method, which just has a simple console log statement.

2. Make a unit test to validate this new method!

3. Make a new function, which will take number arguments for width, height, x and y, and returns a list of all the coordinate pairs that a shape of those dimensions would occupy.

4. Make a unit test for this method (sadly we can't mock the object class itself because P5 won't permit it).

5. Add the script for calling this new frontend unit test to the GitHub Actions Basic CI workflow. Push changes to deploy the test.

6. Make another new method for the Infrastructure class, which will take the game's map as an argument, and print it out. This and the module coordinate calculator will both be called by the add_module method when it is called by the Engine's mouse responder (when the context is 'place', of course). This will require the Engine to pass the map to the Infra class's add_module method as well, incidentally.

7. Make the terrain collision detection method, which pairs the map info and the projected module location and announces the location of any collisions it detects.

8. Make another unit test for this method.

9. Prevent new modules from being placed if the terrain collision detector returns anything other than true. If it returns a list, console log it.

10. Use a modified version of the collision detection test's core logic to look at the coordinates of other modules and also use that to prevent incorrect placements.

11. Make a unit test for the above method.

12. Develop new logic to compare the terrain to a Module's footprint and determine if the module is on flat ground. Add this to the Module placement method to prevent placements that are not on level ground.

13. Make a unit test for the above method.

14. Develop new logic, similar to that used for the previous step, to check if a module is going to be placed on top of another module. This will be complicated because we need to allow a module to rest on top of one single other module, or multiple other modules. Therefore the initial need for this method will be to simply go through all of the existing modules and ensure that all of the columns immediately below the new module have something in them. Then we can pass any gaps that are detected by this test to the terrain/footprint checker, so that a new module can rest on any suitable combination of existing modules and/or terrain.

15. Add a new module to the database that is 1 x 1 blocks, to test this whole system.

16. In the World Editor suite, alter the basic object shape for ModuleInfo to include a new array for holding the 'shapes' that comprise the module's graphical depiction.

17. Update the Lander module's info so it can be our first prototype of a graphically interesting module.

18. Copy the updated type info to the Frontend (server functions file) and fix any bugs that this might cause - and thank goodness for Typescript! Now that I think of it actually, once the kinks have been ironed out in the Frontend, make it the exporter of the ModuleInfo type (we'll do the same thing in time with the ConnectorInfo) so that there's no need to copy and paste stuff between the frontend and the world editor, and so that the Frontend, which is in version control, is the source of truth for all database object types.

19. Then update the Module class's render function to look for a 'shapes' array and default to the matte black rectangle if this isn't found.

20. Update the images for the other basic modules, using at least one arc in the process. Remember, quads' coords go clockwise; presumably it's the same for triangles.

21. Add all remaining shapes to the Module class's render switch case.

22. Make a dome with some trees under it to validate the arc and triangle rendering system.

23. Very basic column strength logic: If a module has column strength zero, nothing can be placed on top of it; if it has anything greater than that, then the sky's the limit (literally). We'll add more complexity to this formula at a later date; for now this should be good enough to prevent stacking things like domes or any other structure that should be the top of whatever stack it's involved with.

## Chapter Twenty: Saving Games

### Difficulty Estimate: 3

### April 9, 2022

Now that we have a map, time, and buildings, there is enough data in a game file to be worth saving to the database, to be retrieved (loaded, if you will) in the next chapter. To save a game we will need a button (already created!), a view within the game to take us to the game saving interface, a method (or combination of methods) for collecting the relevant data, and finally, a new collection in the database to keep this info. We'll also need a new server function for the frontend to send the saved game data, and a handler function and endpoint in the backend to recieve and acknowledge the frontend's save game request. Let's start from the database and work backward so that we add the new collection first, then figure out the save game object's shape and create the database function that will upload it, then the end point, then the server function, and finally work out the interface in the frontend once the data structures are well understood.

Exit criteria:

- Player can hit the 'save game' button in the in-game menu, enter a name for their save file, press 'enter' and receive a confirmation message (it can be a console log for now) from the backend, and then exit the menu and resume playing.
- Save game data can be viewed in its entirety in the game's database under the save_games collection.

1. On paper, make a list of all the information that currently needs to be captured in a save file, and which in-game entities hold that information.

2. Create the new saved_games collection in the database.

3. Update the existing work on the save game types in the save functions backend file.

4. Create a new function to send a Save Game object to the database.

5. Create a new POST endpoint for the save function, and add it to the server.

6. Create a Game class method called getGameData, which cobbles together all of the data into a SaveInfo object.

7. When the in-game menu redirects to the Save Game screen, have the App call that function and then console log the result.

8. Create the Save screen, descended from the Screen class. Style it in same manner as the login screen.

9. Look to the Login screen for inspiration on how to add an input element to a P5 page (the key is to have nothing interesting rendering, so it should be fairly easy given that the Save Game screen is just a little form with a few information displays attached). Add an input element so that the player can enter a name for their save file.

10. Add a Submit button which when pressed console logs the complete SaveInfo object, complete with the game name the user just entered.

11. Make a new server function that will take a SaveInfo object and post it to the server. It will just need to console log the status of the server's return, so unlike many other server functions, it will not need to take additional arguments to accept setter functions. Hurray! UPDATE: It actually did need a setter for the Save Screen's success/failure message to be able to display onscreen. Whatever.

12. Import the save game server function to the SaveGame class, and have it call the function when the save button is pressed. Check the database to see if a save game's data made it.

13. Add a conditionally rendered error text for the game name if an insufficient/nonexistent name is given. Also, add a word about the minumum game name length to the text at the top of the screen.

14. Disable the save button if a success status is returned, so the user can't accidentally spam the button and flood the database with clones of the same save file.

## Chapter Twenty-One: Loading Games

### Difficulty Estimate: 4

### April 10, 2022

The time has come! Now that we have saved game data in the database, let's try to fetch it back to the frontend, and feed it into the game's Engine so as to start the game in the exact circumstances that the save was taken in. Starting from the backend, create the server functions that will retrieve: 1) all of the save game file names for a particular player, and 2) the full saveInfo object for a specific game. Once that's retrieved, it will be fetched by the frontend, and then passed to the Engine via a new method, the loadSavedGame method (actual name to be determined after consultation with marketing). We'll also need to make the LoadGame screen, which may just be the last Screen component for a while. (We should also insert a humorous 'hello world' screen for when the player clicks the 'Preferences' button at the start of the game, to avoid a crash/UX trap kind of situation).

Exit Criteria:

- The player can go to the Load Game screen in the pre-game menu, and see all of the save files associated with their username.
- The player can select a saved game file and click the 'Load Game' button to boot up the game's engine with the data from their previous file.
- Upon loading the Game screen, the Engine displays a modal popup welcoming the player back (pausing the game in the process).
- The player can do everything they could do before, including saving a new file and then loading THAT, and continuing to play...

1. Make a server function that takes the current username as a parameter, and gets the id, game name, game time and timestamp data for all save files in the game's database that match that username.

2. Make another server function that gets all of the SaveInfo for a particular game, taking that game's id as a parameter.

3. Keep both of these functions in a file called loadFunctions. Export both of them to the new endpoints file loadEndpoints, and set up their URL paths.

4. Patch the Load Game endpoints into the server's index file. Test by visiting a save game's ID in the browser.

5. Create a new server function for the frontend, which will fetch and console log the save games list for the current user.

6. Create a new server function for the frontend, which will fetch and console log the whole save data file for a particular game, given its ID.

7. Have the App call both of these functions when the current screen becomes the load game screen.

8. Create the Load Game screen, descended from the Screen class, and mimicking much of the style of the other various menu screens. Make sure the initial Load Game screen has a working 'Return to Main Menu' button, and a 'Load Game' button that responds when you press it.

9. Add a property for saved games, which will be a list of objects that have a field for each game's ID, game name, game time, and timestamp (Date) object.

10. Import the save game list fetcher server function to the Load Game screen, and have it called by the setup method, to immediately get the list of the current player's saved games when they land on the page.

11. Make a new component, LoadOption, that is descended from the basic button, but which takes additional arguments for the basic save info mentioned in item 1 of this chapter. It should display the timestamp to the one side, and the Smartian time to the other side, below the saved game file's name (Which will form the main text). The ID does not need to be shown.

12. Examine the Blockland Map Editor to see how pagination was implemented for the block type options display, then apply the same principle to the Load Games page, so that it only displays 4 files at time, and allows the user to press 'previous' or 'next' buttons to show more files.

13. Clicking a Load Option should select it, and deselect all of the other ones. The Load Game page should have a field for the current selected game, which will be that same data object with the ID, name, game time and timestamp (the Save Summary).

14. Import the second server function (the one that gets all of a game's data) and assign that to the 'confirm' button on the Load Game screen, so that when you click it, the full save info object for the currently selected game is displayed in the console.

15. Start creating the Game's loadSaveGame method. Just make it a basic console log first, and have the App call it when the switchscreen function lands on the "game" screen and the loadGame screen has a save info object.

16. Separate the Engine's core setup routine from the new game data loading mechanism, so that the setup method can continue to be called in a variety of contexts (not just a new game, but when the player returns to the game from the menu, or now when the player arrives from the load game screen). Bring out the new game stuff into a separate method called loadNewGame, and have the Game call that when it has a GameData (new game) object and the gameHasLoaded flag is set to false.

17. Add a loadSavedGame method to the Engine to handle importing the loaded game's info. Make sure this is only called once and is not a part of the Engine's normal setup routine, so that you don't reload the game's data every time you return to the game from the menu, say.

18. Fill out the Engine's loadSaveGame method so that it takes all of the the info from the Save Info object (which the Game will pass to it when it calls the method) and uses that to set everything to align with the loaded game values. Start by setting the game time and map info in the Engine.

19. Since the beginning of time, Man has loved his buildings. But what happens when the buildings... don't have their full data available? Well, what happens is, it becomes necessary to fetch the building data for each of the buildings in the modules and connectors lists; re-using the server functions for fetching building data and then using that to re-create the buildings from the save game. We'll also want to add exception handling here, to take care of instances where a building's data fails to load (in which case simply erase that building's existence and make a note of it in the console). Update: We need an individual building fetch function! Create one in the backend and add it to the structureFunctions/endpoints system.

20. Now, in the frontend's server_functions file, make a function that can make a request to this endpoint, and take a setter argument to pass the result to the Engine.

21. Create the setter function in the Engine and import the server function. Call it for the first module in the modules list after a game is loaded.

22. Now create an Engine method that will sort the modules list alphabetically, then go through it and add a new Module for each entry in the list, and calling the getOneBuilding function whenever it reaches a new building name. Because this is an asynchronous operation, this operation will need to be broken up to wait for the result of each building info fetch. This might require the addition of a new setter function that skips past setting the current building and instead targets a different property, one which is exclusive to this loading function, and which contains the instructions for re-populating structures directly (so the setter doesn't just get the data, it actually uses it to make the buildings too).

23. Create a new method to the Infrastructure class, which adds a new module without asking any of the usual questions (about footprint, obstacles, etc) so that loaded buildings can be re-populated in any order. Have the Engine call this function when the game loads modules from a save file.

24. Add the same functionality but for Connectors.

25. Alter the Modal popup's constructor to simply take the modal data object itself, instead of an ID to look up a specific message in the game constants file. At a later point we'll want to make most modal messages come from the backend, but for now it will suffice to pass a simple (hardcoded) message that gets created by the Engine when a saved game is loaded.

26. Add a new modal popup to be fired when the Engine loads a saved game, so that the game starts out paused until the player clicks to exit the modal.

27. Add error message display/s to the Load Game screen (for if the button is pressed without a save being selected, or if there are no saves found for the current user).

28. Clean up the remaining console logs for the loading process, and merge that branch!

## Chapter Twenty-Two: It's the Economy, Stupid

### Difficulty Estimate: 5 for what is expected to be a large amount of hopefully fairly simple challenges

### April 13, 2022

With the final basic elements of the game's UI finally in place, we can now proceed to the next major feature from a gameplay standpoint: the first in-game resources, and some of their early uses. This chapter will aim to be modest in its scope, introducing the basic mechanics of the game's resource system without adding anything too fancy (such as building oxygen leakage levels). The game's resources will be managed by a new abstract class, called the Economy class, and this will of course in turn be managed by the game's Engine. The Economy class will be the repository of all resource quantity data, as well as the functions that alter and update those values. One interesting challenge for this chapter will be integrating new resource data into saved game files that didn't initially have a place for them, so once again there will be a need to gracefully handle bringing older save files into a new production environment. Great things to have actually, those legacy files, from a software development cycle learning point of view.

Exit criteria:

- [DONE] When the player starts a new game or loads a saved game, they can see the quantity of the game's 4 basic resources (cash, water, air and food) at the top of the map area
- [DONE] When the player starts a new game, their choice of difficulty level affects the game's initial resource quantities
- [DONE] If a save file is loaded that does not contain any resource data, the player gets a normal game's starting resources added to the file when it is loaded in the Engine
- [DONE] If a save file is loaded that DOES contain resource data, that info should be used and displayed.
- [DONE] New save files include resource data
- [DONE] New Modules and Connectors cost money; the costs are now subtracted from the player's resource counts when new structures are built
- [DONE] All buildings in the database have a cost in money
- [DONE] All buildings leak a small amount of air (can really be just a fixed amount right now, just to prove the concept works, and that it's done by the Economy class)
- [DONE] [stretch] The Economy class also displays the increase/decrease RATE for each resource in green or red, underneath the current total

1. Create the Economy class and add it to the game Engine's constructor function. The Economy class is a display-only entity, in the sense that the player does not directly interact with it, so it won't need much in the way of a click-handler or setup function, or even a renderer, initially.

2. Add a single field for resources; make it a dictionary and make the types an export at the top of the module(?).

3. Make a second field for resource counts from the previous 'tick.'

4. Add a render method that prints out the symbol and current quantity of each resource at the top of the screen.

5. Encode the positions for the various resource quantity displays as properties of the Economy class.

6. All resource quantities that are kept by the Economy class should be 1000x higher than the values shown on the interface, to allow for fractions/very small changes to be shown to the player.

7. Add a new field to the GameData model used by the New Game screen, to add differing starting amounts of resources based on difficulty.

8. Have the Engine call the Economy's setResources method when it sets up a new game to load up the game with the values appropriate to the player's chosen difficulty level.

9. Add new descriptor info to the pre-game 'game details' display regarding resources. The first one to actually be true!

10. Update the SaveInfo object's data shape to include a resource category. Check to see that this doesn't break anything.

11. Update the Save information gathering method used by the Game class, and make sure the Save Screen is also able to handle the updated information. Validate by saving a game that has modules and connectors and resources.

12. Ensure that the Load Game screen can handle resource information - as well as a lack of it - when importing loaded games from the server. Validate by loading and console logging the info for the game saved in the previous step, as well as another file that was saved before the advent of resources.

13. Add a protocol to the Engine to allow it to handle games that were loaded without resources.

14. Add the logic for the Engine to load games that do have resource data.

15. Add an alternate text for the resume game modal that is shown if the game detects that a load file is missing any fields that are in the latest official definition (like resource data, for example). Inform the player that the world might have changed since they were last there but that their save data is like, totally safe.

16. Ensure all modules and connectors in the database have a monetary cost value.

17. When a new structure is placed, console log its cost from the Engine. Then log it from the Economy class.

18. When a new structure is placed, check if the cost can be met be the player's current resources (in this case, just money).

19. When a new structure is placed, and the player can afford it and it passes all of the checks, subtract its cost from the player's resource stockpile.

20. Oxygen loss from buildings: For the first iteration of this, lets have each module leak 0.01 oxygen per hour; add an oxygen-loss calculator method to the Infrastructure class, which calculates the amount of oxygen leakage based on the length of the modules list, then returns that value. Have the engine call that method, then pass the result to the economy's oxygen reducer method - or better yet, give the economy class a generic resource subtractor function that uses a switch case.

21. Add a set of display elements to the Economy class to display the rate of change for each type of resource.

22. Make the resource subtractor method update not just the current amount for the resource being subtracted, but its previous value as well. Use that to calculate the rate of change for each resource. Also rename the method to the resourceUpdater, since it could be used for positive adjustments as well.

23. Add buildings' monetary costs to the Build Chip element so the player can see the cost for new structures before placing them.

24. Add logic to the resource updater to only allow resource quantities to go down to zero, and to set a flag to true if a resource has been depleted.

25. Use the resource depletion flag to set the change rate and current quantity's text colours.

## Chapter Twenty-Three: The Colonists

### Difficulty Estimate: 8 for new rules to govern colonist movements and animation

### April 18, 2022

Following the creation of the in-game resource system, it is time to finally meet the Smartians! The colonists will represent the first dynamic elements of our simulated world, and so their addition to the game represents a major milestone in the game's interestingness. The early colonists will have a simple existence, simply moving about more or less randomly across the map, and consuming resources directly from the economy class's stockpiles via telepathy. While their initial behaviour will be simple, we can still take advantage of this moment to set up the structure that will allow for more complex behaviour in the future. This will involve setting up a needs/goals-based approach to determining colonist behaviour, so that colonists will wander around until one of their needs (e.g. food and water) creeps up above a certain pre-set threshold, at which point they will set a 'goal' to go and find whatever resource will satisfy their need. This feature will be setup in this chapter, but the gradual increase in needs for food and water will be suppressed for the moment, until it is possible to satisfy them by moving to specific locations within the base to access resources and services (e.g. kitchens and rest areas). Later generations of colonists will move to still more distant locations, to explore and do work for the expanding colony!

The chapter will conclude by adding some basic stats about each individual colonist to the game's save files, so that colonists can immediately resume what they were doing when a saved game is loaded.

Exit Criteria:

- [DONE] Colonist class is created to render the individual colonists in the game's world. Colonists can stand still or walk to either the left or right
- [DONE] Population class is created to manage colonist activities, including managing resource needs and movement (calling the handler functions of the individual colonists)
- [DONE] Each colonist consumes a small amount of air and water each hour
- [DONE] Each colonist consumes a small amount of food every eight hours
- [DONE] Colonists walk around at random within that horizontal range and are restricted by their climbing abilities (see next point)
- [DONE] Colonists climb at a slow rate, and will avoid climbing up or down anything steeper than two tiles (basic terrain navigation sense for colonists)
- [DONE] Population View shows the number of colonists, along with some filler text.
- [DONE] Colonist positions, needs, goals and progress are included in save file data, and colonists resume whatever they were doing before the game was saved without missing a beat (tick)
- [DONE] [STRETCH] Colonists' movements, including walking, climbing, and standing still, are animated

1. Create the Colonist class. Initially it should be very simple, resembling a block, but without even a type. Add a simple render function (a circle ought to do it) for now.

2. Create the Population class. This will be created by the Engine at the game's outset to keep track of all the individual Smartians. Population class will initially be quite simple, like the Economy or Infrastructure classes were at their outset.

3. Plug the Population class into the Engine when it loads up and have it render a single colonist, at the location of the first module in the Infrastructure's list. Or, if there is no infrastructure yet built, at the horizontal center of the map. It doesn't matter if they end up in the air or anything, their simple rules of physics will be added soon enough.

4. Once the first Colonist is rendered as a circle, upgrade their 'body' to include hands and feet, and a helmet. Keep each of these as distinct fields of the Colonist class, so they can be easily kept track of during the scripting of movement animations.

5. Add a method for the Colonist to detect what they're standing on (check the 'player' class from the game jam for inspiration here). If they're not standing on anything, have them instantly 'fall' down to the surface of whatever column they're standing on.

6. Prepare the ground for motivation/decision-based actions for the Colonists: Add a field for a colonist's "needs" which will take the form of a dictionary (with an explicitly defined type, ColonistNeeds), and map each type of need to a number from 1-10 that indicates its urgency. The same object type can be used again for a related property, needThresholds, which will map the same keys to a different set of numbers, these ones representing the cut-off point at which a colonist will "choose" to try to satisfy a given need.

7. Next, add a 'current goal' field to the Colonist class, to store the string name of the activity the colonist is attempting to perform. This can have a default value of 'explore', so that the colonist will just wander around until he/she gets hungry/thirsty enough to seek out whatever resource is needed to satisfy their need/s.

8. Add an 'update needs' method to the Colonist class which augments the value of each need by a certain amount.

9. Create an 'update decision' method to check the current needs, and then on the basis of that, either keep the current activity as it is, or set it to 'get food' or 'get water' or whatever code name will be used to represent a particular course of action.

10. Adjust the Population class's updater methods so that it splits along updating each colonist's position every minute, and their needs once every hour. The position update will first check goal status, and then that will pass along the signal to either start or continue movement.

11. Fine tune the Colonist's updateGoal method to check needs vs thresholds and set a goal for the first need to cross the threshold. Make sure it also respects an existing goal once one is set (except for 'explore', that is) and waits for the goal to be reset before assigning a new one.

12. Create a separate method for setting the colonist's goal, which includes a switch block based on which type of goal has been chosen (exploration vs getting food, water or rest) and which calculates a destination based on the type of goal and the location of resources/facilities to satisfy it. This will become more complex when we add the ability for modules to hold resources and allow the colonists to transact with them, as they will have to have to be able to update/alter their plans if resource locations change, or are unavailable. For now we'll simply fill out the 'explore' case so that the colonist is sent to move to a randomly chosen nearby location.

13. Create a "Check Goal Status" method, which will be called every minute, to ensure that a colonist always has a goal, and that they are always moving to pursue it - or to detect if they're arrived at their destination, in which case it's either time to get a new goal (in the case of an 'exploration' goal) or to perform some kind of secondary action (such as getting the needed resource from a module, or in time, doing some kind of work task).

14. Colonist movement: Colonists will always be in a particular grid space, to avoid having to introduce a more complex physics system. When a colonist makes the decision to move to an adjacent space, they will begin the move, at which point a walking animation will be shown, and then after a given amount of time (which varies depending on the terrain being crossed) they arrive in the destination tile, at which point the movement animation stops playing. Movement thus happens 'instantaneously' after a brief delay which represents the effort to move into the destination space.

15. Create a 'start movement' method for the Colonist class that checks the column to the colonist's left/right and then reports the "cost" of moving to that location (1 for flat ground, various other values for when the elevation is different), then initiates a move (sets the movement type and cost and sets the isMoving flag to true).

16. Create a rudimentary animation sequence for the Colonist, to be rendered when they are walking. Animation should start and end with the moving parts in the same position, so it can be looped with itself. Animation is rendered one frame at a time, with each render increasing an 'animation tick' variable that resets when the loop is complete (or the move is ended). Animation data is either a series of positions for each individual element, or a mathematical formula to derive position for each frame in the loop. Bonus points if you use the latter method to any extent!

17. For Colonist animations to work properly, we'll need to pass them the Engine's game speed setting (specifically, the number of ticks per game minute) to determine how many frames should be played for a given movement sequence. Total frames to allocate to an animation = frames per minute times movement cost (so that short movements will be over quickly while longer ones play out slowly).

18. Use the Colonists' movementType field to detect which type of movement animation to play. If there is no movement going on, render the image of the standing colonist.

19. Extract the code for the Colonists' animation position calculations to the animationFunctions file, and export that to be used by the Colonist class. Export the entire switch case for each body part as a separate function (e.g. getHeadPosition, getBodyPosition, etc.).

20. Explore the use of keyframes for the simple climb animation, by creating a tuple or an array containing the time markers for each individual movement, as a fraction of the whole move. So for example if you had four equal movements, their key frame times would be 0.25, 0.5, 0.75 and 1, with the final frame at time = 1 being the fully-translated position (identical to where the update-position method will place the colonist's standing image an instant later).

21. Using the techniques developed for step 20, quickly create similar animations for the other three types of movement. They can all be highly derivative of the small climb one (as in, big climb can be the exact same motions but with double the y values, and the descent moves can just be the same sequence but in reverse!)

22. Add the population counter to the Engine's Population view.

23. Add some filler text to this View as well.

24. Add a Population-level function to handle Colonists' resource consumption. Call it every hour along with the rest of their updates, and deduct a small quantity of air and water from the Economy's stockpiles every hour, for every colonist.

25. Add an additional outcome to the above-mentioned function, to also decrement food every 8 hours.

26. Add a 'colonists' field to the Save Info type, so that new saves can take data about colonists. The colonists field should be an array of 'ColonistData' type objects, which have the following fields: x, y, needs (food, air, water), current goal, isMoving, movement type, movement cost, movement progress, movement destination, and the direction they are facing. Animation tick is not needed, as the save data's temporal resolution only goes to the minute, not the individual tick. The Population class will need to construct an array of Colonist Data objects from its colonists list, and the game will call that function and store the return as part of the upgraded SaveInfo package.

27. Get the Game to populate this info before passing SaveInfo to the Save Game Screen. Console log it on the Save Screen to validate.

28. As for loading saved games that include population data, create a new method for the Population class that takes the saved info and creates a colonist that is programmed with that data. Also update the Colonist class' constructor function to accept this info as an optional third parameter, so colonists can be created with or without the loaded game data.

29. Add the population count to the LoadOption pseudo-button, so players can see their colonies' population from the Load Game screen.

## Chapter Twenty-Four: BACKDOOR UNIT TESTS

### Difficulty Estimate: 7 For Refactoring and Familiarization with Jest

### May 6, 2022

Following the fairly complex (and often very painful) implementation of the basic Colonist movement and decision-making logic, the need for robust, reliable unit tests has been in the media again. A new approach to this issue has been hypothesized, which is to use a 'data-processing' object class for each in-game class, and then wrapping that in a shell class that contains the P5/rendering elements. That way, all of the data-processing that goes on behind the scenes for entities that have an on-screen display of some kind can be carried out (and tested) with a class that DOESN'T require P5 and thus should be fully mockable. Let's devote some time towards experimenting with this method of doing things and see if it finally allows for the creation of some useful mock tests.

Exit Criteria:

- [DONE] The Colonist class uses its ColonistData subclass for all non-visual data processing
- [DONE] The ColonistData subclass has at least one unit test that validates the Colonist's movement/position update logic

1. Create a new class, called ColonistData, which will hold all of the Colonist's logic and data processing abilities, but none of its rendering/P5-related functionality. Copy all of the non-P5 attributes and methods from the Colonist class into this new class.

2. Import this class to the Colonist class, and have the Colonist's constructor make a new instance of this class, stored under a new field, this.\_data.

3. Remove all of the copied methods and attributes from the Colonist class, and rewire the remaining methods (render and drawing methods) to use values from the ColonistData sub-class instead of the Colonist class itself.

4. Update the Population-level updater functions for the Colonist class to pass on update requests to the dataFunctions (ColonistData) class instead of trying to perform the updates in the Colonist class directly. Manually test the game to make sure it runs the way it did before these changes.

5. Now, create a new test file called ColonistData.test, and try setting up a simple unit test that creates an instance of the ColonistData class and uses that to directly test its functionality. This will be an improvement over previous unit test attempts, as it will be an actual instance of this class, instead of a one-time copy of its individual methods, like we set up with the Infrastructure class unit tests. Start with a simple test to check if the setGoal method alters the \_currentGoal property.

6. Before closing the chapter, add a new graphic to the mockups folder, with a diagram of the Colonist's decision-making process tree in the upper half, and the movement process tree below, to illustrate the complete flow from the Population class's general update methods through to the implementation of individual movements by each Colonist.

7. Use this diagram to come up with a series of meaningful unit test cases for the Colonist's decision/movement logic.

## Chapter Twenty-Five: The Beginning of the Game

### Difficulty Estimate: 6 For New Animations and New Engine Functions

### May 23, 2022

The game's story needs a beginning, and since it takes place on planet SMARS, it starts with the landing sequence. This chapter will see the improvement of three existing Engine features, and the creation of two new ones, as well as the creation of the Lander class, which will handle the on-screen animation for the landing sequence which begins the game. First, new options will be added to the mouse context system, which will see the addition of a 'landing' context for when the player selects their starting location, as well as a 'wait' context, which will be used to disable mouse-clicks and scrolling during the landing sequence animation. Secondly, a Modal popup will be created with two possible resolutions, requiring the implementation of a system to use the data in the Modal class's "resolutions" array to activate different responses from the Engine depending on which option is chosen. The third Engine system to be upgraded will be the mouse shadow renderer, which will display in different colours depending on a landing site's feasibility. As for new functions, the Engine will need one function to begin the landing sequence, attached to the click handler for when the mouse context is 'landing', and another function to handle the placement of the colony's first structures when the animation ends. Finally, a new Lander class will be created to handle the visual effects for the landing sequence animation. Plus it would be fun to add/improve a few starting modules, like a cantina, a sleeping quarters, a storeroom and an oxygen recycler, maybe? Maybe even make them non-test types this time!? It's getting real, man!

Exit Criteria:

- [DONE] An introductory modal is shown immediately when the game starts, inviting the player to choose their landing site
- [DONE] When the mouse context is 'landing', the cursor shadow is shown in green or red depending on a site's feasibility
- [DONE] When the mouse context is 'landing', the sidebar should not be shown
- [DONE] When the mouse is clicked with the 'landing' context, a confirmation modal is shown
- [DONE] When the player selects 'No, Wait a second...' option, the modal is closed and the mouse context remains 'landing'
- [DONE] When the player selects 'Sure I'm sure!' option, the modal is closed and the mouse context becomes 'wait'
- [DONE] When the mouse context is 'wait', the click responder is deactivated, and the sidebar is not shown!
- [DONE] When the player selects 'Sure I'm sure', they are shown an animation of a spaceship landing on the spot they chose
- [DONE] When the landing animation is finished, the game emerges from 'wait mode'
- [DONE] When the landing animation is finished, the initial base structures are created. No test structures this time!
- [DONE] When the landing animation is finished, the initial colonists appear, and the game begins!

Features Added:

- Modals can have more than one possible resolution, depending on which option the player chooses.
- Modal resolutions can themselves have can have multiple outcomes in the game (changing mouse context, altering resource values, etc) so that selecting a single resolution can have a number of consequences.
- Engine scroll system now uses mouse hover instead of click-and-hold near the map's edges.
- Mouse shadow can be rendered under a variety of circumstances including landing and building placement, based on mouse context.
- New mouse context added: landing (for handling the selection of the initial landing site, in expanded map view mode)
- New mouse context added: wait (for temporarily suspending gameplay while still in map mode - to play an animation, say)
- Engine can have animations

1. Add the creation of a new modal to the Engine's setupNewGame method, displaying a message welcoming the player to SMARS, and instructing them to pick their landing site.

2. Add a new mouse context, 'landing', to the Engine's mouse context switcher. Have it simply console log when the mouse is pressed while in 'landing' mode at first.

3. Update the Modal class's EventData type to convert the 'resolutions' field to a list of tuples, each of which has the structure (buttonText: string, engineMethod: string, value: number) where buttonText would be the writing on the button in the modal, the engineMethod would correspond to a switch case in the Engine's resolveModal method (which we'll take this opportunity to rename, from the closeModal method), and the value will be a number that provides additional data for the Engine's resolve function (such as a quantity of a resource to be added or removed, or an Enum to correspond to a particular mouse context!) Fix all existing Modal data objects to adhere to this new system.

4. Upgrade the closeModal Engine method to resolveModal, with the ability to process different outcome type strings and adjust various values when a modal is resolved. Have it default to the first item in the Modal's resolutions list for now (the ability to choose among different resolutions will be added later).

5. When the mouse context is 'landing', or any other context for that matter, ignore any clicks outside of the play area, to prevent the player from entering the in-game menu before they select their landing site.

6. In fact, can we just not even show the menu until the player has landed?? Implement that by first adding a new Engine property, hasLanded, which is set to true upon the player's selection of a landing site. Pass this value to both the Map and Sidebar classes at render time, in the first case to tell it to render a wider area, and for the Sidebar to tell it to not render at all.

7. Ensure the Engine doesn't accept mouse clicks for the Sidebar as long as hasLanded is false.

8. Ensure the mouse click handler is able to register clicks on the expanded map area while hasLanded is false.

9. Add a new Engine method that is the top-level mouse-shadow renderer, and have it be responsible for rendering not only the building shadow, but also the landing path shadow as well, which it will call as sub-methods. Create this distinction with the existing building shadow rendered, and ensure it still works properly.

10. Alter the scrolling system so that scrolling occurs when the mouse holds the same position for more than 5 frames inside the scroll area, instead of the current system with the mouse click handler and the isScrolling variables. It should be simpler this way, really. New system: two new engine variables needed: mouseInScrollArea (which is the number of frames the mouse has spent near to either side of the map) and scrollThreshold, which is the amount of frames that need to pass for scrolling to start.

11. Add a new Engine method that renders a green rectangle that extends 4 grid places to the left and right of the cursor, and goes all the way from the bottom of the map to the top, but rendered behind the map terrain (the mouse shadow rendered must be called before the map in the Engine render sequence).

12. Extend all maps from the database that are less than 50 columns wide, as they will cause problems with the map when it is in extended mode. Update the Map Editor README file to remind users to make all new maps at least 64 columns wide in the future.

13. Make the Map follow in the footsteps of the Colonist class, by refactoring its non-rendering attributes and methods into a MapData class. Test that this doesn't break anything.

14. Add a new method to the MapData class, which looks at a range of 8 columns and tells if they're all the same height. It should return true if they are all the same height, and false if they aren't.

15. Add a set of unit tests for this new Map method, to verify that it returns true and false under the appropriate circumstances.

16. Have the Engine's mouse shadow renderer change the color of the rectangle it draws based on the outcome of this new Map method.

17. Add a new Engine method, confirmLandingSequence, which will run when the mouse is clicked with the landing context. This method will take care of evaluating whether a valid landing site has been selected, and if so, create a new Modal popup to request confirmation. This modal will be the first to have more than one possible resolution, so the next thing we'll need to do is figure out how to manage multiple outcomes.

18. Update the Modal class to be able to render, and handle more than one possible resolution, depending on the length of the Resolutions property. This will require the addition of a new method to the Modal class, in order to be able to pass the resolution index value to the Engine's closeModal function (which is passed down, via props drilling, into the Modal's soon-to-be many close buttons).

19. Setup the constants file to export modal data, and start using this method immediately to avoid further cluttering the Engine with hard-coded data. Modal data should really come from the backend, ultimately.

20. Create a new Engine method, startLandingSequence, which will take care of setting the mouse context to 'wait', setting a wait time for the landing animation to play. Initially though, just have it call the handleLandingSequence method (which we will soon rename to completeLandingSequence, or something else that implies its role as the end of that process, rather than the entire thing).

21. Add new mouse context instructions for when the context is 'wait', telling the Engine to ignore all clicks when in this mode.

22. Add a new switch block case to the Engine's closeModal method, to allow the confirm button to trigger the startLandingSequence method.

23. Add new Engine data field for waitTime, to tell the Engine how long to remain in wait mode before reverting to normal behavior. When mouse context is in 'wait' mode, no mouse responses should occur (clicks or even scrolling should be disabled).

24. When the Engine's mouse context is 'wait', have the renderer call a new method, advanceWaitTime, which decrements the waitTime value and resets then calls another new method called resolveWaitPeriod, which can call different scenario-specific methods (in this case, the now-renamed completeLandingSequence - formerly handleLandingSequence - method that sets the hasLanded variable to true, and finally begins the game).

25. Create the Lander class, which will be a fairly simple entity with parameters for x, y, width, height, start (which will be zero), destination (which will be a y value representing the altitude at which the animated spaceship will 'touch down' on the Smartian surface) and duration (amount of renders the animation will last). Give this class a render method that draws a large circle, as well as a smaller circle and a triangle, which overlap to form a teardrop shape. It will need to accept offset values.

26. Give the Engine a new property, animation, which will be an instance of the Lander class, or null. When the landing sequence is initiated, have the Engine create an instance of the Lander class. In the render method, add a check for the animation property, and if there is an animation, render it.

27. Give the Lander class a new method, advanceAnimation, which updates the lander's position to move it 1/duration pixels closer to the destination height. Have the Lander's render function call this to advance the animation.

28. Change the new game setup sequence so that colonists are not created the instant the game starts.

29. Make the two colonists spawn by the completeLandingSequence method instead - place them at the left and right edges of the landing zone (add new Engine field to record the altitude and position of the designated landing zone - this info will also be used by the constructor function for the Lander, to position it and tell it where the surface is).

30. Design the new structures that will be created after the landing sequence is completed. Focus on the function that Modules will play in the near future: providing resources and services for individual Colonists. Therefore, resource capacities/limits and number of Colonists that can be served should be prominently considered.

31. Add the new Module, 'Cantina' to the game's database, including its shapes.

32. Add the Module 'Crew Quarters' to the database, including shapes.

33. Add Module 'Storage Module' to the database, including shapes.

34. Add Oxygen and Water Tank modules, with their shapes.

35. Have the Engine place each of these modules, in a stack, at the landing zone when the landing animation is complete.

36. Revisit the render rules for the Lander, and spruce up that animation, just a little bit.

37. Using comments, organize all of the various Engine methods to better indicate where future methods should go (Major categories are setup functions, structure placement functions, modal functions, landing functions and time keeping functions).

38. Remove scrolling functionality from the render method into its own method, handleScrolling, and call that from the render method. Have the handleScrolling method itself check the mouse context to see what parameter/s affect scrolling. This will be helpful for customizing scroll behaviour based on mouse context, to allow for faster scrolling, etc (see below).

39. If the player has the cursor in the scroll area for more than a second, higher threshold value, scroll at double speed.

40. Add a switch to the backend's getStructureTypes function so that it doesn't send structures with the type 'test.'

41. Comment-out all remaining console logs that occur outside of an error context (e.g. when the player attempts to place a structure in an invalid location). Then it's time to make a commitment.

## Chapter Twenty-Six: Buildings in the Frontend, Part III - Connector Placement

### Difficulty Estimate: 7 - Tweaking the existing Connector a fair bit, plus adding new unit tests for connectors and infra classes, plus adding the mouse shadow class

### June 25, 2022

Adding Connectors to the game will allow the player to connect different modules for colonists to move between them, and to allow certain types of resources to be transfered between modules. Although the actual uses for these abilities will be addressed in subsequent chapters, it will be the goal of this chapter to set up all of the systems needed for placing connectors on the map, and keeping track of them with the Infrastructure class. This includes, of course, ensuring that Connector data is added to the save/load game system and thoroughly tested for proper integration and backwards compatibility. It will also be the goal of this chapter to upgrade the Infrastructure class to begin keeping track of the base's interior structure and systems (such as where all of the modules' floors are, where there are connection points, etc). Actually using this information practically (i.e. having the colonists begin to be able to walk on floors and use ladders, or pass resources between modules through pipes and ducts) is, again, out of the scope of this chapter. We will also be making heavy use of unit testing here, creating testable data classes for both the Infra and Connector classes, as well as creating the new mouseShadow class using the same type of architecture.

Exit Criteria:

- [DONE] The player can select a Connector from the sidebar and click on the map to create a shadow representing its start point
- [DONE] The player can click on a second (stop) point on the map; if the location is good, this places the new Connector
- [DONE] The player can cancel placement by pressing the sidebar's 'back' button, or by clicking an invalid placement location
- [DONE] When placing a Connector's terminus, the mouse shadow shows a preview of the segment that will be created
- [DONE] When placing any Connector or Module, the mouse cursor will change colour based on whether or not a location is valid
- [DONE] Some Connectors can only be either horizontal or vertical
- [DONE] Some Connectors can be either horizontal OR vertical, and can be placed in either direction (but not both, for now)
- [DONE] The Connectors component data is its own class, and has at least 1 meaningful unit test
- [DONE] The Infrastructure component data is its own class, and has at least 1 meaningful unit test
- [DONE] The MouseShadow component's data is its own class, and has at least 1 meaningful unit test
- [DONE] The Infrastructure class contains a map of the base's volume - basically all of the coordinates that are inside a module
- [DONE] [STRETCH] Add a simple image for the two basic connector CATEGORIES (transport and conduit)
- [DONE] Ensure all backwards compatibility with older saves (saves with obsolete connector data should simply disregard it)

Features Added:

- Infrastructure class has several of its methods in a unit-testable InfrastructureData class.
- Infrastructure data class keeps track of base volume as modules are added.
- Mouse Shadow class calculates module placement validity and changes colour accordingly.
- Mouse Shadow class can also calculate connector start/stop placement validity and provides a preview of the full connector prior to placement.

1. In the same manner as was done for the Module and Map classes, decouple the Connectors class data from its render methods, and test thoroughly that nothing is broken by this (make and load a new save file, and ensure that old saved games can load). Leave everything else the same (don't start upgrading the data types yet).

2. Update the Engine to ignore the Connectors in existing save files.

3. Add a comment to the ConnectorInfo class's cost field to stipulate that the cost is now in terms of 'per unit of length.'

4. Then update the ConnectorInfo type (in server_functions.ts) to include a 'width' property, then individually update both Connectors in the database (ladder and air duct) to include this property.

5. Add a new field to the Connector Data class: segments, which will be a list of up to two objects with this shape: {start: {x: number, y: number}, stop: {x: number, y: number}}. Better yet, make both start and stop equal a Coords type, for maximum efficiency.

6. Next, add the Coords type {x: number, y: number} to the Backend's saveFunctions, and use it to update the shape of the SaveInfo object's connectors field. Simultaneously, update the SaveInfo object in the SaveGame.ts file so that the two are in sync. See if this breaks anything.

7. Update the Game.ts file to ensure that new Save games include Connectors' segments data, if it exists. Keep the x and y data for now as well, but prepare to deprecate in the future (code is at line 144 in game.ts).

8. Prepare to deprecate the older Connectors: Have the Engine log a warning text whenever a Connector that has NO segments property is loaded.

9. Validate that new Connectors will save, and contain the segment property, by loading a saved game that already has connectors, then seeing the deprecation message, then creating at least one new connector, then saving that file, then loading it. There should be no deprecation messages, as ideally all of the old connectors as well as the new ones will now be saved with the 'segments' field.

10. Create a new Engine Mouse Context: ConnectorStart, which simply console logs its name when a click is registered with that context.

11. In the BuildingChip component, add some logic to its handleClick method to set the mouse context differently for Connectors than for Modules placement (might be necessary to slightly alter the existing 'place' context name to make it more explicitly about modules).

12. Create a new class of game entity called MouseShadow, which will render a rectangle (for now) at a coordinate point. It should also have a color property. Do this in the form of a dual class creation, one for MouseShadow and another for MouseShadowData, so that we can add unit tests a few steps from now.

13. Import the MouseShadow class to the Engine, and create a new Engine property, mouseShadow, to be either null, or an instance of the mouseShadow class.

14. Update the mouseContext switch function to create a new mouseShadow instance when the mouse context is set to either placeModule, or connectorStart. It should be possible to pass the parameters (height and width) of the building in question to the mouseShadow's constructor.

15. Update the Engine's renderBuildingShadow method to call the MouseShadow's render function, passing it just the x and y coordinates of the mouse.

16. Have the setSelectedBuilding method call a new Engine method, createMouseShadow, and pass it the module/connector's width/height data there, as appropriate. This will be passed to the new MouseShadow's constructor, but won't necessarily cause the mouse shadow to be rendered right away (the renderBuildingShadow method still governs that).

17. Make the setMouseContext method call the Engine's new destroyMouseShadow method whenever the mouse context is changed and the selectedBuilding field is null - indicating that no building is selected for placement.

18. In the Infrastructure class, find the method for determining a building site's suitability. Integrate that with the new Engine method, ValidateMouseLocationForPlacement, which will call it whenever the mouse shadow is rendered to determine the suitability of the present mouse location for placing the currently selected building. Turn the mouse shadow red for unacceptable locations, and green for acceptable ones.

19. Use this moment to detach the Infrastructure's Data component into its own separate class. Unlike with other data classes, it will not be possible to bring everything over since the Modules and Connectors lists themselves contain entities with require the P5 component, so the Infra Data class will only be able to take the basic location suitability tests for itself, while leaving much of the Infra class's core functionality in the original class.

20. Make a very simple unit test for the Infrastructure Data class, that establishes that a method exists and can be called.

21. Add another test that validates one of the existing methods, such as calculateModuleArea, with some dummy data.

22. Make unit tests for all the other Infra Data methods, then get rid of the original Infra tests file (it doesn't actually test anything so after it's been used up for inspiration it will have served its purpose).

23. Have the Engine's validateMouseLocationForPlacement method call the Infra Data class's checkTerrainForObstructions function and set the Connector initial placement mouse shadow to red or green accordingly.

24. Give the Infrastructure DATA class a new checkConnectorPlacement function, for the Engine to call when it's validating a Connector's potential location, and use it to color the mouse shadow for a new connector appropriately. First, have this method call the existing checkTerrainForObstructions function and reporting the result to the Engine. Validate this function with a unit test.

25. Add a new Infra Data class property: baseVolume. It will essentially serve as a second map, but for the base structures. It should be updated every time a new module is constructed, and will be used to allow the placement of Connectors inside the base.

26. Add a new Infra Data class method, updateBaseVolume, to be called by the Infra base class's AddModule method, that will create/update a map-like list of coordinates that contain modules. Add a unit test for this method that simulates calling the function multiple times, and also find a way to validate that the base volume is calculated when a game is loaded.

27. Elaborate on the checkConnectorPlacement method to not allow placement of a new Connector if it is above the terrain's surface (see how the Module placement check achieves this).

28. Make yet another function that checks if a set of coordinates matches a position in the baseVolume map, and use the outcome of this check to potentially override a fail from the check described on the previous line. So now the rule is, you can't build a Connector above the terrain's surface - UNLESS its location is inside the baseVolume, in which case allow it.

29. Make a unit test for the Connector master placement test function.

30. Add a new MouseShadow method lockShadowPosition, to be called by the Engine when the mouse is clicked with the "connectorStart" context. This should have the effect of freezing the mouse shadow in its current grid location by setting its locked property to true. Validate this, in the game and with a unit test!

31. Create a new Engine method, handleConnectorStart, that takes care of everything that happens when the mouse is clicked with the start connector context. This includes ensuring the click was at a valid location, setting the mouse context to "connectorStop", and locking the mouse shadow's location.

32. Add a new Engine mouse context, "connectorStop", and have it console log when a click is registered.

33. In the Engine's renderBuildingShadow method, add new logic to distinguish between the start/stop phase of the Connector's placement, and in the case of a stop placement, have the ShadowData class update its shape based on the location of the start coordinates. Add a new Mouse Shadow data field for the start coordinates, so they can be kept track of when the lock is set.

34. Have the MouseShadow component store the prospective grid location of the Connector stop point in a new variable, connectorStopCoords.

35. Have the Engine's validateMouseLocationForPlacement method check the MouseShadow's connectorStopCoords instead of the mouseX and mouseY position when evaluating the color of a prospective Connector.

36. Create a new Engine method, called handleConnectorStopPlacement, which will not take any arguments, but instead will grab both the start and stop coordinates for a soon-to-be connector from the MouseShadow (before deleting it). When called, this function will do a final run of the Infra Data class's checkConnectorEndpointPlacement (to be renamed 'checkConnectorEndpointPlacement' since it's ambidextrous) for the stop coordinates. There will be no need to validate the start since that will already have taken place when the handleConnectorStartPlacement method was called. If the Stop location passes the test, add a new Connector! (It will still be just a single point for now, but this will change soon).

37. Make a copy of the Engine's handleModulePlacement method for connectors. Call it handleConnectorPlacement, and have it call the Connector start validation check as well as the Economy's cost check (using the full length of a Connector to calculate its total cost) before placing a Connector.

38. Update the Infra base class's addConnector logic to make a new segment-based Connector using the data from the MouseShadow class. Have the method described in the line above call this, and see if we can finally lay us down a new Connector!

39. Update the Connector's base class to check for the segments property's start/stop coordinates and render both of them as a grey square (these are the terminuses and their appearance will be upgraded in the near future).

40. Have the Engine exclude Connectors that don't have the segments property when loading connectors from a saved game. Add a console log that this is happening, and don't just not render them - purge them from the Connectors list when loading a saved game file. Console log the number of connectors that are ignored when this happens.

41. Now we can finally go ahead and remove the x and y values from the ConnectorSaveInfo type, and all references to these values in the Connector class itself. Test that this has not broken anything by loading a saved game that contains (old-fashioned) connectors, as well as saving and loading a new game from the post-x-and-y era.

42. To aid with rendering, have the Connector Data class determine if it's a horizontal, or a vertical connector.

43. Give the render method for the Connector class a basic formula for filling in the gap between a connector's start and stop points.

44. Add a unit test for each of the Mouse Shadow class's many methods, and be thorough.

45. Add a unit test for the Connector Data class's constructor function, to test its ability to evaluate its orientation under a number of different circumstances (including for a single-point connector).

46. Add a method to the Connector base class that helps it make two vertical poles and a number of rungs if the connector is a ladder.

47. Add a simple calculation to reduce the x value and width of a conduit-type connector's in-between shape by about 20% each, so the connector is like a skinny pipe. And add a small circle to each of the endpoints.

## Chapter Twenty-Seven: Buildings in the Frontend, Part IV - Floor Logic

### Difficulty Estimate: 5 for Intro to TDD!

### July 8, 2022

Having now established how Connectors are placed on the map, it is time to take care of some of the behind-the-scenes logic that will govern their eventual role in the game. The focus of this chapter will be to establish how the base's interior will be structured in terms of floors that the colonists can traverse, and how members of the new Connectors class will link different levels of the base's interior for transit, and link different modules for resource distribution. The work here will have no visible output in the game's UI right away, but it will be possible to test most of the new logic, particularly if we use this opportunity to practice using a test-driven approach to development!

Exit Criteria:

- [DONE] The Infrastructure class will contain a list of 'floors', representing the surfaces within the base on which colonists can walk
- [DONE] Each new Floor is given a unique serial number
- [DONE] Floor information includes an up-to-date list of transit connectors that intersect it
- [DONE] Floor information includes an up-to-date list of the IDs of the modules that comprise it
- [DONE] Floor information is updated whenever a new Module or Connector is placed
- [DONE] If placing a new Module causes two Floors to merge, their module and connector lists are combined and the Floor with the lower serial number is discarded
- [DONE] All new floor-related logic is tested extensively
- [DONE] Modules and Connectors have a serial ID property that's given to them at creation by the Infrastructure class.
- [DONE] Infra class updates its serial number each time a module/connector is created, including by loading a saved game
- [DONE] [STRETCH] Unit tests for the new logic are written BEFORE the code itself!

Not doing:

- Module 'ground floor' detection and logic

Features Added:

- An invisible Floor class was created to manage information about the internal structure of the base, specifically the walkable surfaces that colonists will be able to traverse as they do with the map terrain.
- The Infra Data class keeps track of the transport connector segments and the floors they intersect with.
- The price for a new Connector is now determined by its length.
- Fixed a small regression bug that caused the mouse shadow to persist when the player was no longer in structure placement mode.

1. Create a new class, Floor, to keep track of all of the above-mentioned data, and also house the various methods that will operate on it. This will make it even simpler to create unit tests, as this will be a non-rendering class and thus no need for a separate 'floorData' class.

2. Make dummy methods for the floorData class, and leave them with just a console log / comment for now.

3. Briefly, do the same thing for the Infra Data class, just to get an idea of what we're going to be working with here.

4. Add a floors list to the Infra Data class as well. Like the base's volume, this is a data-driven system with no need to render anything.

5. Add an ID field to the Connector and Module classes, and have their constructors take an argument for this value.

6. Head on over to the tests folder and add a new file for Floor class unit tests. Start with the basics (check if a property exists) then add tests for both of the calculation methods in the Floor class: Check if adjacent, and update footprint. Leave tests empty for now, or make them so they auto-pass. Green power, dude.

7. Add tests for the new Infra Data class methods as well: Find floors at elevation; create new floor; delete existing floor; add module to existing floor; merge two existing floors (by placing a module in between them to form a single surface).

8. Add a unit test for the Infra Data class's FindFloorsAtElevation method, since we've already created that method.

9. Next, add a unit test for the Floor class's updateFootprint and checkIfAdjacent methods BEFORE writing the code for said methods! See how it influences the coding process.

10. Write the code for the Floor class's updateFootprint method so that it correctly updates the leftEdge and rightEdge values when provided a new module's footprint. Be sure that it can deal with a disordered list of column indices.

11. Write the code for the Floor class's checkIfAdjacent method so that it sets the adjacent value of its return tuple correctly under all circumstances. Once it passes its unit tests you can add additional code to update the message text field in the return tuple.

12. Write test cases for the Infra Data class's remaining methods (deleteFloor and combineFloors) before writing their code.

13. Elaborate slightly on the test case for the Infra Data's AddFloor method, to add another floor at elevation 5 that is separate from the first one (not that this function on its own has the capacity to merge the two). Also add another floor at a different elevation and test that that one shows up on the floors list too.

14. Update the Infra Data's findFloorsAtElevation test to check if it can find 2 floors at elevation level 5 after the changes on the previous step are implemented.

15. Test the Infra Data's serialization method by checking the serial number of each new floor as it's added.

16. Complete the code for the Infra Data's delete floor method and include with it a console warning if it deletes any number of floors other than 1 (it will still execute such an erroneous deletion, but at least it lets you know after the fact).

17. Complete the code for the Infra Data class's merge floor method, and validate with its lovely pre-made unit tests.

18. Add the unit tests for the Infra Data class's top level floor method, addModuleToFloors, before completings its code. Make sure that each of the following situations is tested: the first module is placed, creating a new floor; a second module is placed at the same level as the first one, but too far away to be added to it; a third module is placed beside the second one, such that the second floor is widened in the direction opposite the first module; a fourth module is placed between the first and second floors, such that they are all combined into a single floor consisting of 4 modules; a final fifth module is placed on a different elevation, forming a new floor. There should be 2 floors in total at the end of this exercise.

19. Now finish writing the code in the Infra Data class to make this a reality.

20. Add the test logic for the addConnectorsToModules method.

21. Create the actual addConnectorsToFloor method. Hopefully it all fits into one method; if not break it up in a way that makes sense (see next item)

22. Make it so that when a new floor is added, all existing connectors check to see if they should be added to it. Add an 'elevators' property to the Infra Data class to allow it to keep track of the essential details for each transport connector: its id, x position, top and bottom.

23. Add a few temporary text outputs to the Engine's renderer, to evaluate how well this system actually works in practice. Add outputs for: number of floors; modules in the SECOND floor; left and right edges of SECOND floor; number of 'elevators' in the base, and which elevators (ladders) connect with the THIRD floor.

24. The Mouse Shadow persists even when a new module is de-selected. Make it stop.

25. Fix the BuildingChip component's cost calculation (located in the render block, of all places) to ensure it is workings are transparent and its readout correct (neither is currently the case). Also add the words 'per meter' to the advertised price for connectors.

26. Make connectors actually cost the amount they state when placed by taking their length property and multiplying that by the price that gets passed to the Economy class.

## Chapter Twenty-Eight: Resources In the Modules

### Difficulty Estimate: 5 For refactoring the Module and Economy classes and ensuring compatibility with game save/load system

### July 16, 2022

Now that the base's Connector infrastructure is in place, it is time to implement the next key step towards a functioning simulator game: locating resources within the game's world. At the moment, resources are completely abstract quantities that exist in the game's Economy class. This chapter will rework that system so that instead of being represented as a global stockpile, the game's resources will now be 'stored' inside individual modules, so that colonists will need to visit specific locations to get the resources they need to survive. To implement this new system it will be necessary to update the module class to have a field for its current supply of a given resource, and have the Economy class routinely read each module's resource quantity value/s and populate the display at the top of the screen using that information instead. Once again we will be taking a test-driven approach to development, so we'll need to start by abstracting out the data and methods for both the Module and Economy classes.

Exit Criteria:

- [DONE] Modules have the capacity to store the game's various resources
- [DONE] The Modules created during the landing sequence start with some resources in them
- [DONE] The Economy class displays the sum total of the resources contained in all the modules
- [DONE] Modules' resource data is also included in save files and is restored properly upon game load
- [DONE] ModuleData class is created to allow unit testing of module methods
- [DONE] EconomyData class is created to allow unit testing of economy methods
- [DONE] All new functionality has unit tests developed prior to the actual code (as much as possible)

Features Added:

- New unit tests for the abstracted EconomyData class.
- New unit tests for the abstracted ModuleData class.
- Modules can now hold any of the game's resources
- Infrastructure class can produce a list of all modules' resources, to feed to the EconomyData class
- Resource data comes in the form of a list of tuples (e.g. [ ["water", 1000], ["oxygen", 2000], etc. ] ).
- Modules' IDs can be retrieved based on their resource containment options (i.e. find all modules containing water).
- Modules' locations can be gotten from the Infrastructure class using their ID as a lookup

Not doing:

- The Economy class's rate-of-change data is included in save files so it can be displayed as soon as a game is loaded
- Query tool AKA 'select' mode lets the player view a module's resources
- Backwards compatibility is not a consideration here as we will be dropping the use of the original SMARS database saved_games collection. It served us well but the time has come to move on.

1. From the Module class, abstract out its data fields and methods into a new Module Data class. As always, test this refactoring extensively before proceeding, including loading saves from long ago, and creating/loading a new save file.

2. Once the Module class has been refactored, do the same for the Economy class, abstracting out as many of its methods and data fields as possible. Again, test thoroughly with old saves, and new ones before proceeding.

3. Update the Module Data class to add a currentResources property. This can use the Resources type, which is exported from the Economy Data class.

4. Update the Resources type to include 'power' and 'equipment' and 'minerals'. Don't add any kind of display for now, just get ready.

5. Update the type template for the ModuleSaveInfo next (in the SaveGame file) to include a Resources attribute as well.

6. Update the ModuleSaveInfo and ConnectorSaveInfo types to include ID's as well.

7. Update the Game module's logic for gathering data from Modules before saving, so that it includes their Resource data as well as their ID number in the save data.

8. Take this opportunity to have the Game save Connectors' ID's as well.

9. Just when you thought there wasn't enough pain in the world: Revise the Resource type system that's currently in place to change it from Resources (which then contains a dictionary which matches all of the game's resource types to TUPLES containing their quantity and display symbols) to a singular Resource, which will still consist of a tuple, only this time it will represent the ["name", quantity] for a single resource.

10. Update the module data for the backend next, so that each module's storageCapacity field now expresses a list of the Resource(s) [names and quantities] that a module can store in terms of these new tuples, instead of the dictionary-like data storage currently used. Then, update each module in the database to reflect this new system. Save backups in the older_buildings file also.

11. Update the Economy class next so that its resources field contains an array of these tuples; one for each resource type (currently there are seven - money, oxygen, water, food, power, equipment and minerals). You can keep money as a resource this way, and only the Economy class will need to handle it. Tidy up the rest of the Economy class's code so that it can still handle its resource quantity displays for the first four of its resources (money, oxygen, water and food).

12. Do a find-all to update any remaining instances of the Resource type, and then load an old saved game to make sure nothing is broken. Test as well with a new game - save and reload it to validate that everything is still working with no regressions.

13. Make an Engine helper function that can be inserted into the Engine's Load Game sequence to help convert older, dictionary-based Economy data into the new format on the fly when legacy files are loaded. Also, maybe dump the saved games eventually too?

14. Use some strategic console logs and/or engine text readouts to verify that Modules' resource data is correctly formatted now. Add one to log each module's capacity when placed, and another one to log each module's current resources (again, when placed).

15. When modules and connectors are loaded by the Engine's loadConnectorFromSave and loadModuleFromSave methods, make sure to give each structure its proper ID from the save file (overriding whatever one the Infra Data class may have assigned). Check that the serial generator for Infra Data is updated sufficiently by the loading process so that there will be no duplicate serial numbers assigned when new structures are added. Finally, modify the Infra Data class's resetSerialNumber method to just be 'setSerialNumber', and allow it to take an argument (number) that will be used to set the new value. Test extensively with old and new files to make sure this doesn't introduce any regressions.

16. Add a dictionary to the Economy Data class that matches symbols to each resource type. Have the Economy base class access these symbols for its resource count displays, and also have it ignore (not display) the 3 new resources (equipment, power and minerals) for the moment.

17. Create the empty shells of the new Infra base class methods that will be used to manage individual modules' resources and get data for the Economy class. 3 Methods to add: addResourcesToModule, which will take a single Resource and a module ID (for the game start and various other occasions); findModulesWithResource, which will take a single string (the resource name) as its argument, and should return a list of the IDs of any module that contains a non-zero supply of that resource; and lastly a method for finding the location (coords) of a module given its ID. In tandem with the function from the previous step, we will have a good start towards telling the Colonists which module to go to when they need a particular resource.

18. Create empty shells for the new Module Data methods: addResource (takes one resource at a time and attempts to add it if the module has the capacity for it); deductResource (reduces the quantity of a resource in a module if, say, a colonist consumes from it - and if the resource is available).

19. Actually, in the end it's the Economy class that is interested in the 'big picture' economic data, so it makes more sense for the Econo Data class to take care of the grand calculations, so the Infra base class will just have a basic function which returns an array of all of the Resources possessed by all of the Modules (with anywhere from a handful to potentially hundreds of individual entries). The Engine will call this and pass it to the Economy Data class's new calculateResourceTotals method, which will contain a switch case (!)(?) to adjust its resource tallies every hour. Write its unit test first, now that this new architecture is understood, and add a new function, getAllBaseResources to the Infra BASE class (for grand total calculation; returns a list of all resources present in all modules). Make the unit test for the Economy Data function first.

20. Create the unit tests for the new Module Data class methods before writing their code. As always, be imaginative in trying to imaging 'edge cases' that might break the system.

21. Now start by writing the code for the Module Data methods first.

22. Next, do the code for the Infra base class. Sadly it won't be possible to do unit tests for these methods, but we can evaluate them in-game soon enough.

23. Now, update the Economy Data class to perform the function described in step 19. Do unit tests for this feature and create a new method before getting rid of any of the existing code.

24. Add some initial resources to the modules that are created at the end of the landing sequence. This will be a good live-action demonstration of the Infra class's new module resource addition methods too, since we cannot unit test those.

25. Now integrate the new Economy updater method by adding it to the Engine's handleResourceConsumption method (start by renaming it) to call the Infra Data's calculateBaseResources method every hour and then for each item in that function's return, pass the new value to the Economy.

26. Now that resource stockpiles have been added to all of the structures when a game is started, the next task will be re-adding those same resources when the game is saved and then reloaded. First let's make sure that the resource data is being saved correctly, by examining our lovely clean new database. If the resource data has made it successfully to the DB, then we can pass it to the loadModuleFromSave method, which is unfortunately weirdly wedded to the server_functions file in an extremely ungainly way... but such is life, there is no untangling them now. The only solution is to add yet more data to the server functions' getOneModule function, so that it is able to pass resources to newly loaded modules once they are created.

27. Last but not least please consider the following: starting cash based on difficulty level.

28. Also, now that there's a new database without any of the legacy issues, clean up some known legacy-enabling hacks, such as the Engine adding population to load games, the guard for old-fashioned resource data, etc. Most of that stuff is in the Engine I reckon, and it's all just clutter at this point.

29. Finally, fix it so that the cash rate of change is updated back to zero after every hour, like the other resources.

## Chapter Twenty-Nine: Colonist Movement in the Base

### Difficulty Estimate: 7 For new colonist movement and decision logic, plus probably a new animation, plus unit tests and planning, AND some refactoring. ADDENDUM: Difficulty was way higher than estimate due to chapter goals being insufficiently defined and too broad for a single chapter!

### July 22, 2022

Now that the game's resources are located in the modules, and the modules are on the map, the time has come to re-activate the colonists' needs, so that they gradually become hungry and thirsty throughout the day. As they do so, they will need to decide to acquire the resources necessary to reduce their needs, which they can now do by visiting the modules. The Colonists will be given the ability to decide that they should satisfy a need, as well as formulate an action plan to accomplish this. The actions that will initially comprise a Colonist's action stack will be things like "go to a specific location (often on a floor inside the base)" or "eat at a particular module", and so forth. This chapter will focus on the decision-making logic that will prioritize which resource to move towards, and the pathfinding logic needed to get to a location that is potentially far away and/or on a different level (floor) than the colonist is currently standing on. Hopefully the lessons learned so far about test-driven development and the use of flow-charts will aid in the development of these new features.

Exit Criteria:

- [DONE] Colonists will become hungry and thirsty as their needs increase over time
- [DONE] Colonists will move toward a module that contains the resource/s they need when they become thirsty or hungry
- [DONE] Colonists can walk on Floors in the base as though they were on the ground
- [DONE] Colonists can climb up ladders to get to a Floor
- [DONE] Colonists can decide to climb up, or down a ladder to get to a module on another floor
- [DONE] Colonists can decide to walk up to a ladder
- [DONE] Colonists should always be aware of the surface ID (whether map zone or floor) for the column they are in
- [DONE] There should be unit tests for everything before development (obviously now)
- [DONE] Additional data about colonist movement/decisions added to save/load games so they resume what they were doing seamlessly
- [DONE] Colonists should each have a unique ID that is stored with the rest of their save data

Features Added:

- Lots and lots of 'getter' methods added to Map, Floor and Infrastructure classes, to enable (relatively) easy pathfinding logic to be performed by Colonists
- Added resource transaction methods for Module class, so that colonists can call them to consume module resources
- Added external helper file to take care of Colonist pathfinding logic (for plotting a course of action to get to resources that are in the base, possibly on non-ground floors)
- Added Colonist Action Stack and Current Action attributes to keep track of their action plans
- Integrated colonist actions into save game data
- Added new logic for Colonist surface detection to allow the Colonist to stand on floors, and to fall back to the ground if they somehow happen to become detached from it (although an exception is made if the Colonist is climbing a ladder)

1. Add new properties to the Map Data class: topography (list of numbers representing elevations); zones (list of start/stop x values of regions of the map that are separated by an elevation gap of more than 2).

2. Define the new Map Data class methods to be used, and create their shells in the Map Data class: determineTopography, determineZones, walkableFromLocation.

3. Create unit tests for the determineTopography method, which will be run at the Map class's creation and kept in the topography property. Topography will be a list of numbers, each one representing the map's surface elevation for the column of that index.

4. Create unit tests for the determineZones method. It will run after the topography is established, and create a list of start/stop locations for every section of the map that is separated from the column next to it by an elevation drop (or increase) of greater than 2 grid spaces.

5. Create unit tests for the walkableFromLocation method. It will take four arguments: startX, startY, destX and destY, and use them to calculate whether a destination can be walked to from a given start (i.e. are they in the same 'zone', and does the destination's elevation match the topography for its location).

6. Write, and test the code for the determineTopography method. See above for an explanation of how it should work.

7. Write, and test the code for the determineZones method. See above for an explanation of how it should work.

8. Write and test the code for the walkableFromLocation method. See above for an explanation of how it should work.

9. Create the placeholder for the new Infra class method: getModulesWithResource.

10. Since this one sadly cannot be tested, just go right on and write the code for the getModulesWithResources method. It should take one argument for the resource type name, and return any module that A) has the resource in question and B) is of the type 'life support.'

11. Create the placeholders for the new Infra Data class methods: getFloorFromModuleId, getElevatorFromId, doesElevatorReachFloor, and isFloorOnGround.

12. Add a unit test for the getFloorFromModuleId method. As the name implies, it should take a module ID as its argument and return a pointer to the Floor that holds that ID in its modules list.

13. Add a unit test for the getElevatorFromId method. It should take a single argument, the ID of an elevator (connector) and return a pointer to the Elevator in question. The Colonist will use it, possibly in a for-each situation, to get info about all of the elevator ID's contained in the return from the function in the previous step.

14. Add a unit test for the doesElevatorReachFloor method. It should take a floor ID and and elevator ID, and return true if the elevator ID is found in that Floor's connectors list. The colonist will use this to find out if a connection exists between the floor they are currently standing on and the destination floor. Functionally, it is the equivalent of the Map Data class's walkableFromLocation method, in that it returns true if the colonist is able to walk directly to a connector from their present location.

15. Lastly, for the Infra class at least, create the unit test(s) for the isFloorOnGround method. Unlike the others, this will be called at the moment a floor is created, by using the map data class's (newly-added) determineTopography method, as well as the Floor's elevation data. This will determine if a newly-created Floor is considered the 'ground floor' or not, and set that boolean accordingly.

16. Create the code for getFloorFromModuleID and test it. See above for an explanation of how it should work.

17. Create the code for geElevatorFromId and test it. See above for an explanation of how it should work.

18. Create the code for doesElevatorReachFloor and test it. See above for an explanation of how it should work.

19. Add an ID field, this time a unique string given by combining its left side x and y coordinates, to each map zone that gets created during the Map Data class's topographical/zone determination method. This will enable to ground logic for the Infra Data/Floor class's ground floor status determination make more sense, since it is not just a question of WHETHER a floor is grounded, but of which ZONE (if any) a floor rests upon (and thus can be accessed from via walking).

20. Create the code for determineFloorGroundZones method and test it. See above for an explanation of how it should work. In addition to what is said there, consider too that a floor could become grounded after its creation, if it is extended to overlap with higher terrain on one side or the other of its original edges (e.g. when building out from the middle of a crater). In this case it would be necessary to check each time a module is added whether it (and by extension the whole floor) touches the surface of some zone on the map. Revise the unit tests for this method first to reflect this possibility. Ultimately the Infra Data class should have this method, but then call a new Floor class method when it has determined which Zones (if any) the Floor touches.

21. Plug the determineFloorGroundZones method into the Infrastructure / Infra Data class's new module creation sequence, so that each time a new module is added a test will be performed to see whether it is on the ground, and the appropriate Zone data added to the Floor's groundFloorZones list as appropriate.

22. Add a sneaky temporary text render to the Engine to show that the integration of the Floor Zone calculation has been successfully implemented.

23. Develop the Floor class's new setGroundZones method (unit test first) to allow it to be passed a list of map zones and then add only the ones not already in present in that Floor's ground zones list.

24. Enable the Colonist Data class's updateNeeds method as part of the updateNeedsAndGoals routine. Check that the colonists do indeed become thirsty when this method call is enabled.

25. Add a new field for the Colonist Data class: actionStack. This will be an array of objects (new type alert!) with the shape { type: string, location: Coords, duration: number, buildingID: number }. The type string will go into a new switch case method that will be added to the CheckGoalStatus method; location will be a set of coordinates; duration will be the length in minutes that an action will take to complete (movement actions will use 0), and buildingID will be an optional value representing the ID of the module/connector that is the target of an action such as 'work' or 'consume' (again, 0 will be used when this value is not needed).

26. Next, create another new field for the colonist for activityTimeElapsed, which will be the amount of minutes that have passed while doing the current activity (if its duration is more than 0).

27. Update the Engine's call to the Population class's updateColonists method to pass it a link to the Infrastructure class, so that it can pass that to individual colonists to use its methods.

28. Pass down the pointer to the Infra class instance all the way to the Colonist data class, so that its various goal status determination/updater methods can all use it. Ensure the setGoal and determineActionsForGoal methods can both accept an Infra parameter.

29. Add a call to the determineActionsForGoal method from the get-water case in the setGoal method, and in the action determinator method have it console log the ID's of any modules that contain water (making use of one of our newly added methods adder earlier in this chapter).

30. Remove P5 from the constructor of the Infrastructure class; replace both uses of it (there are only 2, one for module creation and one for connector creation) by passing the Engine's P5 instance to those method calls rather than using them in the Infra base class's constructor.

31. Grand re-factor, Part I: to finally untie the Gordian knot wherein classes have a base and data version, have the Engine pass down its P5 instance to the following classes, so that they and their data sub-class can be combined into a single class. Start by refactoring the following classes such that they will have P5 passed as an argument to their render methods. Classes to refactor to use this technique: Module/ModuleData, Infrastructure/InfrastructureData, and finally Connector/ConnectorData That is all (for now).

32. Grand re-factor, Part II: Go through the unit tests for the newly recombined classes and ensure they work in the new context. Do not rewire them if it's not needed to get a 'green' build!

33. Grand re-factor, Part III: Ensure the game works as it did before, then proceed to revise the ensuing instructions so that we can benefit from the combination of the Infra/Infra Data classes and finally find out (and unit test the logic for finding out) which module is closest to the colonist's coordinates! Also, create a technical debt section to this log file, and add the grand refactoring to it in some detail (classes remaining, unit tests to combine/update, etc).

34. Alter the Infra class's findModulesWithResource method to accept an additional argument for the quantity being sought. The current model returns all modules with a capacity to hold a resource, whereas we want something that actually contains enough of whatever it is to be useful to a hungry/thirsty colonist, say.

35. Add a new ModuleData method (and unit test) that takes a resource name and returns the quantity (if any) of that resource contained in the module. This will be a useful helper function to the Infra method described above.

36. Create a new Infrastructure method, findModuleNearestToLocation, that takes an array of modules and a set of coordinates (the colonist's location) and compares each module's location to the colonist's location. The ID of the closest module (that also contains the selected resource in a desired amount) is returned. Initially, only the X value should be evaluated for proximity. Unit test first, now that you can!

37. Use the outcome of the aforementioned method to get the ID of the nearest module that contains the desired resource. Now is the last best chance to also add the module's "dispenser" role, by the way - unless you don't mind colonists drinking out of the water tank directly. Addendum: For now, they can in fact drink from the water tank.

38. Plug the module ID for the needed resource into the Infra Data class's findFloorFromModuleId method, to find the Floor ID that the Colonist will need to travel to. Console log the floor's ID.

39. More importantly, now that the colonist has chosen a module to travel towards in search of resources, they can add the first item to their action stack: The action that will tell them to consume the resources at that module. This action item should look something exactly like this (using drinking water as an example) : { type: "drink", coords: { x: 10, y: 0 }, duration: (1 minute per unit of thirst), buildingId: 1007 }. When the colonist arrives at the chosen module, it will verify the coordinates, then execute a drink action lasting one minute for every unit of thirst (so that they will leave with no thirst). Adding items to the action stack will require its own method, addAction, so let's go ahead and create that, plus a simple unit test, before moving on to the rest of the code for dealing with actions, along with goals.

40. We can also add a second item to the action stack (which is executed in reverse order, so that this will happen immediately BEFORE the step added in the previous item). This will be the instruction to move towards the target module, and since movement is an immediate action, only the first two values need to be provided: { type: "move", coords: { module coordinates }, duration: 0, buildingId: 0 }. When the time comes, the actions resolver will read this as a movement type action and simply set the colonist's movementDestination to the appropriate column, since the next action added to the stack will be the one that brings the colonist to the floor containing the target module. Before we get to that though...

41. Add a new method (and unit test) to the Map Data class, to retrieve the ID of a map zone when given a single set of coordinates.

42. The colonist will call this method every minute, so the time has now come to pass the map data to the Population updater method in the Engine. Do this by adding an updateMapZone method to the Colonist class, which takes the map class and gets a zone ID from it by passing it the colonist's coordinates. Test in-game by re-writing the p5 text element that's currently showing the colonists' current goal to show their current map zone ID instead.

43. Fix Colonist Data class unit tests after recent refactoring of goal-setting methods.

44. Remove P5 from the map base class, and pass it to the render function. Cross this off the tech debt list once completed.

45. Next, from the retrieved Floor data, see if it has a ground floor zone, and if so, check if its ID matches the ID of the ground zone the colonist is standing on (they will have to have a property for the ground zone ID this way, but at least they don't have to also carry around the topography info!). If it is, then that means the Colonist can begin walking towards the module right away! If not, it means they will have to find a ladder... Test this by temporarily removing the need for a module to actually contain more than zero of the desired resource, and placing some empty store rooms on the ground, and seeing if the colonists will go for them (or at least, have them console log if they detect that they are in the same zone as the storage modules).

46. If a resource-bearing module is not on the ground in the same zone as the colonist, look up whether it's got any connectors (elevators) attached. Log their IDs if it does.

47. Update the Infra base class's addConnector method such that when a transport type Connector is placed it can determine its bottom point, and then use that to find if it has a ground floor zone. Add a groundFloorZone property to the Connector class, and make it a singular tense, since a ladder/elevator cannot be grounded in more than one zone (if any). Pass the Map to the addConnector method in the Engine to allow it to use the mapData class's getZoneIdFromCoordinates function.

48. Add the creation of a ladder to the Engine's initial base structure creation method.

49. For each elevator ID in a non-walkable Floor's elevators list, check if it has a ground zone ID. If any elevator has a ground floor ID, check if that matches the Colonist's current ground zone ID. If none of them do, then we'll have to tell the Colonist to clear their action stack and try looking for another module that contains their needed resource. But we'll get back to that in a moment...

50. If, on the other hand, an elevator DOES have a ground zone ID, then compare it to the Colonist's current ground zone. If they match, then we can add two new actions to the action stack: one telling the Colonist to climb the ladder, and another to tell them to move towards it. Then at that point we can start the action stack. If, however, there are ladders which have ground zone IDs but the colonist isn't in the right zone, then we'll have to think of how to handle that. Oy yoy yoy!

51. At this point, we should have all we need to determine the way to a floor that is removed by one elevator from the colonist's position, and the actions needed to get there from the current position. Phew! Take a moment to savour this triumph, before going in for some major refactoring and unit testing.

52. Change the code for the Colonist's checkGoalStatus method, so that instead of looking at whether the Colonist is at their movementDestination, instead it checks if there are any actions left in the action stack/current action. If there is no current action and the stack is empty then the current goal must be completed and it is time to pick a new one.

53. Next, take the 'explore' determination calculations and pass them to the determineActionsForGoal method, so that setGoal becomes a very minimal setter method with a single call to the action determinator. Place all code for the exploration movement destination determination into the action determinator.

54. Once the code for setting the exploration goal has been transplanted, update it so that instead of setting the movementDestination, it creates a one-action stack and then begins it.

55. Next we'll update how the movementDestination gets interpreted by the handleMovement method, to allow movements other than walking/climbing across the map to be considered, starting with climbing a ladder. We'll have to start by upgrading movementDest from a single number representing an x value to a fully-fledged set of Coordinates. Next, we'll stipulate that when the current action is "move" that the y value doesn't need to be considered by the startMovement method. Then the startMovement method will be divided into a higher-level switch case where it looks at the action type, and then its existing switch case for determining types of movement over the terrain can be called in the "move" case only.

56. Complete the drinking sequence by having the Colonist's startMovement case for 'drink' set the movementType to 'drink' and set the movementCost value to 1 unit of time per point of thirst. For the heck of it, do the same thing for 'eat' while we're at it.

57. Next, tell the checkActionStatus method to check actionTimeElapsed against the current action's duration when the current action is 'drink' or 'eat' and so that the action (And hopefully the goal) is resolved when the Colonist has finished eating/drinking their fill.

58. Also, tell the checkActionStatus method to start increasing the actionTimeElapsed value by one per cycle when the current action's duration is greater than zero, so that when the Colonist is performing an activity with a set duration value they start making progress towards it once they start.

59. Update the resolveAction cases for 'eat' and 'drink' so that they reduce the need for the appropriate resource by the amount consumed by the Colonist (we can just set the need back to zero for the first implementation).

60. Colonist class gets two new methods: eat and drink, which will be called by the startAction method, and which will initiate eating/drinking after verifying that the Colonist is in the right place. They will also call the Module Data class's deductResource method, which checks if a quantity of a given resource is available and reduces it by that amount if possible. If the resource is unavailable, or available in a smaller quantity than requested, it should return the amount of the resource that was available (if any) while reducing its supply to zero. As a bonus, use the return value to reset the duration value of the colonist's eat/drink action and then have the functions described in the previous step use that value instead, so the Colonist isn't filled up if the module doesn't have all of the needed amount of the a resource.

61. At this point sadly it would be foolhardy to go any further without attending to the existing unit tests for the Colonist/ColonistData class and trying to either tidy them up or just get rid of a bunch of them frankly. Addendum: They weren't in such poor shape after all, although a fair few modifications were needed. The real challenge now will be adding tests for all the newly added functionality in this chapter.

62. Add new unit tests for all of the currently existing goal-determination functionality.

63. Add new unit tests for all of the currently existing action-related functionality (except for the action stack determination logic - we'll tackle that in a moment).

64. Add new unit tests for the new movement logic (for resource consumption functionality).

65. Add new unit tests for the as-yet-to-be-developed action stack determination logic. Consider several precise scenarios, to be defined in advance on paper before going any further with the code for these operations.

66. Create an Infrastructure class method, findFloorFromCoordinate, which takes a set of coordinates and returns the Floor (if any) that is immediately under those coordinates.

67. Have the Colonist class call that method with its detectTerrainBeneath check, and if the colonist is found to be standing on a floor instead of a map zone, make their standingOnId a number instead of a string and set it to the Floor's ID.

68. Now that the Colonist can tell when they are standing on a floor as opposed to a map zone, add the logic that will enable them to determine how to get back to the ground/to another floor from that position. Create the first helper function that will go in our new ColonistMovementLogic helpers file: findElevatorToGround. It should take the Infra and Map classes as arguments, and return either the nearest elevator (or a pointer to it) or a NULL if no elevator is found.

69. Swap in the new consume action stack logic from the helpers file and have the colonist call it from the determineActionsForGoal method, in both the 'get-food' and 'get-water' cases. Rerun unit tests and then also run the game for a period of 2 in-game years as a final stress test. Then stick a fork in this chapter because it is DONE!!!

70. Give the Colonist class a unique ID field. Colonist IDs can be a 4 digit number starting at 9000 and be given by a simple population class counter.

## Chapter Thirty: Colonist Movement in the Base, Part II - Code Cleanup

### Difficulty Estimate: 3

### October 2, 2022

Since the last chapter was clearly a massive over-reach in terms of adding far too much complexity/new features at the same time (while simultaneously having a less-than-fully-developed game plan for how to implement everything), we now need to dedicate an entire new chapter to cleaning up the mess that was made during its implementation. This chapter should be relatively quick, since it will just aim to tidy up the code base and take care of a couple of lingering details that were omitted for the dev team's sanity from the previous installment. In particular, this chapter will take care of refining the Colonists' action stack logic, adding and updating some unit test cases for the Colonist Data class, and creating an eating animation to go with the ones made during the last chapter for climbing and drinking. By the end of this chapter we just want to have the whole eating/drinking/intra-base movement sequence sorted out and looking polished, and the game's architecture in good order before proceeding to the next feature increment.

Exit Criteria:

- [DONE] Colonist Action Logic's createConsumeActionStack function is updated to eliminate unnecessary movement actions when the Colonist can step right off of a ladder into the coordinates of a resource-containing module
- [DONE] Colonists have a movement animation for the 'eat' action
- [DONE] New unit test created for scenario where colonist is on a floor and needs to descend
- [DONE] New specification for Infrastructure class's findModulesWithResources method: It should now take an optional boolean argument that tells it to only return modules that have the type 'Life Support'
- [DONE] Colonist Data unit tests should all be updated to use the Cantina module data instead of the storage room
- [DONE] Some Infra/Infra data unit tests should also be updated to use the cantina module data
- [DONE] Console logs from the previous chapter should be, for the most part, commented-out/deleted

1. Create a unit test case for the Colonist Data class that expects a 3-part action stack if the coordinates for the consume action match the coordinates for the 'climb' action (in other words, drop the 'move' action between 'climb' and 'eat/drink').

2. Update the logic for the createConsumeActionStack function so that it creates the entire action stack at the end of its route determination. Also, make it only add the first (chronologically last) move action if the colonist isn't already in position to eat/drink when they get off the ladder (i.e. only add the 'move' action if the ladder's x doesn't match the target module's).

3. Update the corresponding logic for when the colonist is already on the same surface and doesn't need to move (e.g. if they've just eaten and just need to stay in place to take a drink). Validate in-game and with a unit test.

4. Create an animation sequence for the Colonist's 'eat' move. It should be a standard 10 frames long, with the colonist moving their hands up and inward towards their face and moving their head back and forth to mimick an eating motion.

5. Create a unit test where the Colonist is on a non-ground floor and needs to get down (to explore, say). Validate the action stack under such circumstances (should be 'move', 'climb', 'move'). Fix any issues with the code that arise from this test.

6. Update the Infrastructure and Colonist Data class unit test files to use the Cantina module for all test module data. This is in order to replace the Storage Room, which will be unable to satisfy the soon-to-be updated module resource finder method's stipulation that any resource containing module must also have the type 'Life Support' in order to qualify as a valid destination for a colonist to eat/drink at.

7. Update the Infrastructure class's findModulesWithResource method so that it can take a second, optional parameter called lifeSupp, which is a boolean that tells it to only returns modules that have the 'Life Support' type. Ensure that all unit tests and manual sanity checks pass before proceeding (obviously!)

8. Go through the code and comment-out a good 80-90% of the console logs for the previous chapter, so that only major events are reported to the log.

9. Add/fix the outcome for the Colonist's Action Logic where the colonist is on a (non-ground) floor and finds resources on another (non-ground) floor and has to move towards them. Add a unit test as well, of course.

10. Finally, we do need to have some kind of system in place for when a resource truly isn't available, to prevent the colonist from freezing up in the event of a scarcity. I recommend adding an additional trait, needsAvailable, to keep track of missed attempts at finding any of their needs. That way, if a colonist runs the get-water/get-food sequence and recieves and empty list, they can set the needsUnmet for that need to 0 (default value of 1 means that the resource is accessible, as far as the colonist knows). Then, the updateGoal method's first needs-based section can check for that value when preparing to set the goal to get-(need), and skip that need if the value is zero. In order to ensure the Colonist occasionally checks again, we can reset the availablilty value to 1 with each hourly update. I suppose we'll want to unit test this too.

## Chapter Thirty-One: The Inspect Tool

### Difficulty Estimate: 3 For New Mouse Shadow, Click Handler and Sidebar Display

### October 10, 2022

In order to give the player (not to mention the developer) a better picture of what is going on in the game's world, we will need a tool that can be used to 'inspect' in-game entities and display some vital stats about them in the Sidebar's details area. The Inspect Tool will be selectable from the Sidebar, using the button currently labeled 'select,' and will turn the mouse cursor shadow into a little magnifying glass. When the mouse is clicked over the game's world area, the Engine's mouse context handler will call a series of functions to determine which in-game object, if any, has been clicked, and print out some information about it to the Sidebar's details area, replacing the minimap display in the lower half of the Sidebar.

Exit Criteria:

- [DONE] The player can select the Inspect Tool from the Sidebar and see a little magnifying glass as the mouse cursor shadow when they move the cursor over the game world.
- [DONE] When the mouse is clicked on an in-game entity, the Sidebar's DetailsArea will show information about that entity based on what type of thing it is:
- [DONE] For Colonists, we should see their ID, their current goal, current action, and the value/threshold for each of their needs.
- [DONE] For Connectors, we should see their ID, name and type, as well as top and bottom coordinates and, in the case of conduit-type connectors, the resources they can transport (from the connector data).
- [DONE] For Modules we should see their ID, name and type, as well as what resources (if any) are contained and what the max capacity is for each, as well as whether the module is pressurized.
- [DONE] For Map tiles, we should see the name, resource type, hitpoints and yield info, which represents how much of the resource can be extracted by a single 'mine' action (coming soon!!?).
- [DONE] The player can unselect the current entity by any of the following means: A) Clicking another in-game entity, B) Clicking on any empty space in the game area, or C) Clicking another sidebar button/changing the mouse context.

1. In the Sidebar class, rename the 'Select' button to 'Inspect' and in the Engine, change the mouse context handler case name to reflect this as well ('select' and 'inspect' are lowercase for the mouse context handler).

2. Do a 'find in all files' for the word 'select' to ensure that any calls to the mouse context setter from outside the Engine use the updated terminology.

3. Combine the MouseShadow/MouseShadowData classes, and fix any unit tests that this might break, as well as ensuring all game functionality is unaffected.

4. Add an optional boolean parameter called 'inspectMode' to the MouseShadow class's constructor, and have that set a corresponding attribute, this.\_inspectMode. This will be read at render time to tell the MouseShadow to show the image of a magnifying glass instead.

5. Tell the Engine to create a new mouse shadow with the inspectMode boolean set to true whenever the mouse context is set to 'inspect.' Validate in-game.

6. Create the actual P5 shapes that the MouseShadow will use when it is in Inspect mode, and validate the tool's 'look and feel' in-game.

7. Add a new Engine method in the mouse handlers section, handleInspect, which will be called by the mouse click handler when the mouse context is 'inspect.' Initially it can do the job of console logging the grid coordinates which is currently performed by the click handler itself. This method should recieve the X and Y coordinates pair as a single argument so that it can print them, but also so that it can use them for what comes next...

8. Before adding anything to the Population class, take a moment to remove P5 from both it, and the Colonist class. Run the unit tests and do a manual sanity check before proceeding.

9. Write a new method for the Population class, getColonistFromCoords, to take a pair of coordinates, and use them to check each Colonist's location and return a pointer to the colonist (if any) that matches the input. Be sure to allow for clicks on the Colonist's feet or head. It should return a null if no colonist is found at the selected coordinates, OR if more than one colonist is found (since they can overlap, returning a null is the simplest way to let the user know to try again when they are not in the same position). We can unit test this, so let's do that, creating the inaugural Population tests file in the process!

10. Have the Engine's handleInspect method call the Population class's getColonistFromCoords method whenever a click is registered, and if it turns up an answer, console log it. Otherwise just print something like 'No colonist found at X, Y, moving on to the Infra class.' The idea is that this method will go through all of the various types of in-game entities in a particular order (Population, Connectors, Modules, Map Blocks) and report back as soon as it hits something (if indeed it does hit anything at all).

11. Before proceeding, remove P5 from the Connector class, and recombine it with the connector data class. Ensure all dependencies in other modules are updated and all unit tests/sanity checks passing before proceeding.

12. Next, write a method for the Infrastructure (base) class, which will findConnectorFromCoords by looping through the connectors list until it finds one that overlaps with the given coordinates. Only one connector should be returned by this process, so the issue of overlapping connectors should be a consideration here... as in fact it was for the Colonists, so perhaps a similar solution (just use the 'find' method on the array to return the first Connector that matches the given coordinates) can be employed here. If no connector is found, return a null. Again, unit test first before implementing - unit tests should account for whatever solution is used to deal with overlapping Connectors.

13. Next write another Infrastructure method, findModuleFromCoords, that finds a module from a provided set of coordinates and returns the result. Since Modules, unlike Connectors, cannot overlap with each other, this should be a simpler process than the previous case. Unit tests first, naturally.

14. Then, before doing the Map inspect handler, combine the Map and Map Data classes, again ensuring that all unit tests and manual sanity checks pass before proceeding.

15. Then, make a new method for the now-unified Map class, that returns the Block info (if any) for the selected coordinates. Can probably do this pretty efficiently by getting the column from the X value and then doing a find within the column for the Block that has a matching Y value. Unit test first, as always (NOTE that to fully unit test this it will be necessary to quickly decouple P5 from the Block's constructor).

16. Integrate the four newly developed coordinate-finder methods into the Engine's handleInspect method, so that it will first select a Colonist, then a Connector, then a Module, and finally a Block if none of the above have already been selected. The object, if any, that is selected by the Inspect tool will be stored under a new Engine property, inspecting, which will be able to be either a null, or a Block, a Colonist, a Module or a Connector, and which natually will start out as a null. Validate that this logic is working in the console log before proceeding. Also, if the player clicks in the air, that should deselect the current item (i.e. set the inspect property to null), as should any change to the mouse context.

17. Next, rather than overcrowding the DetailsArea component, which is already geared to be the building options menu, create a new component class, InspectDisplay, to handle the Inspect tool's visual output. Structure it so that its constructor takes no arguments, and give it skeleton methods for setup, updateInspectData, and render - making sure that the render method can accept P5 as an argument so that we can easily integrate unit tests for this class.

18. In the DetailsArea component, add a field for inspectData, which can be a simple boolean that gets set by the Engine when an object is selected with the Inspect tool.

19. Import the InspectDisplay class into the DetailsArea component and create an instance of it in the DA's constructor. Then, add a condition to the DA's renderer so that when the inspectData field is set to true, it renders the InspectDisplay component instead of the Minimap.

20. Next, add a method for the DA to updateInspectDisplay, which will be called by the Engine when it sets the boolean inspectDisplay to true or false, and which will simply call the InspectDisplay component's own updateInspectData method.

21. Merge the Module and ModuleData classes to help the Inspect Display identify modules without having to descend into their data class.

22. Fill out the Inspect display formatting for Block data, adding a few more InspectDisplay position attributes to use for convenience (halfway down mark, 1/4 and 3/4 marks, etc.). Data to display for Blocks: name (type), resource, yield, HP/Max HP.

23. Fill out the Inspect display formatting for Colonist data. Data to display: ID, need levels, current goal, current action.

24. Fill out the Inspect display formatting for Module data. Data to display: name (type), ID, resources contained/maximum, pressurization status, durability.

25. Fill out the Inspect display formatting for Connector data. Data to display: name (type), ID, and then bifurcating on the connector type (conduit or transport) show either the resources carried (for conduits) or the amount of colonists that can be on it at the same time (phrase the outputs differently).

## Chapter Thirty-Two: Production Modules

### Difficulty Estimate: 2 for new module info fields and one new structure

### October 21, 2022

Now that we have resources in modules, and colonists are able to consume these resources, and the player can see for themself what quantities of each resource are present, the next thing that the game needs is for the colony to be able to start PRODUCING resources. As the initial stockpiles of food and water (we'll leave the air supply to the side for the moment) begin to diminish, the colonists will need to produce more stuff. This means they will need modules dedicated to producing resources. In order to avoid adding unnecessary production info fields (inputs, outputs, labour time for production, etc.) into all of the current modules, this chapter will introduce two optional fields for the ModuleInfo type definition, for production inputs and outputs. We will create just one instance of a production module, the hydroponics pod, as well as updating the Inspect Display for modules to pivot on whether the module has the 'production' type. The chapter will end when the player can build a production module, save and reload their game, and see the module's production-related info in the Inspect Display area (some minor adjustments to the module display template will be needed).

Exit Criteria:

- [DONE] When clicked in Inspect mode, production module shows info about colonist slots occupied/available, as well as input/output quantities
- [DONE] First production module, the Hydroponics Pod, can be constructed and saved/loaded

1. Add two optional fields to the ModuleInfo type definition, productionInputs and productionOutputs, and make them both a list of resources.

2. Add a field to the Module class's constructor, crewPresent, which will be the number of colonists present in a module. All modules will have this property, and should display it as part of the Inspect Display _IF_ they have any a crew capacity of greater than zero. Once this property is added, quickly recheck the Module and Infra unit tests to make sure they're all still correct before proceeding.

3. Create a production module in the newBuildings.ts file. Before uploading it, add a line of logic to the World Editor suite's add_module and update_module files to prevent the uploading of a new production module if it does not have both the productionInputs and productionOutputs fields. Validate this logic by attempting to upload a production module that lacks these fields, and delete it if it accidentally gets through. Then upload your hydroponics pod data and see if you can build it in the game.

4. Remove P5 from the Button class, and create a basic unit test file for it.

5. Setup a button handler system for the Inspect Display to handle the 'Show More' button, which will be offered only when the player selects a production module.

6. Fill out the Production Inputs/Outputs display template for Production Modules, and ensure that the player can toggle back to the basic module display from the production details display (make the button a toggle switch that goes back and forth between the two display modes).

## Chapter Thirty-Three: Jobs For the Boys (Colonist Roles)

### Difficulty Estimate: 5 for Population screen updates and Colonist role-assignment system development

### October 23, 2022

Now that there are some empty production facilities lying around, it is time to prepare the Colonists to enter the job market. First they will need new infomation fields to assign ROLES, which will tell them what kinds of JOBS to do (see below this paragraph for a glossary of new role-related terminology). A role will consist of a name and a number, which will be the ID of the production module the colonist is assigned to. The player will be able to assign roles to the colonists in the Population screen, so there will be a bit of reformatting to do there. The Population screen should consist of a list of rows for each colonist, and on each row there will be a button for each type of ROLE option. We can leave a placeholder with fake data for the number of each roles available (which will be informed by the soon-to-be-developed Industry class). Chapter will be complete when the player can assign roles to colonists via the Population screen, and see each colonist's role info when they inspect them (this will probably necessitate the creation of an alternate colonist inspect display like we created for production modules just now). For the moment, assigning a role will not affect the colonist's behaviour; it will be purely a formal distinction.

ROLE: The top-level designation for the type of work a colonist is assigned to. Examples are 'farmer', 'miner', 'scientist' or 'explorer' - in each case what is represented is the overall purpose of the work the colonist will do, rather than a description of any specific task.

JOB: Jobs are the intermediate-level item in the work terms heirarchy, referring to a set of tasks (actions) that achieve a specific part of the overall mission of a colonist's ROLE. Examples of JOBS would be 'produce food', 'mine ore', 'transport resource' or 'do science.' A Job is essentially commensurate with a colonist GOAL, just as the tasks within a job are the same as colonist ACTIONS. The difference between a Job and a Goal is that whereas a Goal is just a string which stands alone in the colonist's data structure, a Job will be comprised of both a short string (mission statement) as well as a list of the tasks (actions) that the colonist who takes the job will have to add to. Colonists will have a separate type of action, 'go-to-work', that they will call to find the way to their assigned work module.

Exit Criteria:

- [DONE] The Population Screen displays a row for each Colonist, with space for several potential role-assignment buttons
- [DONE] Colonists can be assigned roles in the Population screen
- [DONE] Colonist role data is added to save game files
- [DONE] Legacy saves assign all colonists to 'explore' role when loaded
- [DONE] Colonist Inspect Display shows Role name (replacing 'current action')
- [DONE] [STRETCH] An aesthetic touch: give new colonists a randomly generated name, to give the game some personality!

1. Add the role field to the Colonist class. Role will be a tuple, consisting of role name (string) and module ID (number).

2. Add colonist role field to the Colonist Save data shape; add a default value to the constructor field so that it checks the load data for a role, and then defaults to ['explorer', 0].

3. Start working on the Population screen: Move or get rid of the current flavour text, and make a space for the Colonists roster. Update the Population screen's setup method to take the whole Colonists list from the Engine's Population class (this is passed to it in the Game component's view changing switch case) instead of just the population array's length.

4. Create a new Population class method, assignRoleToColonist, which will take a colonist ID (number), a role name (string) and a module ID (number) and assign a colonist to a role/module. Initially we'll have to use a made up number when determining the module ID, but eventually the true value for this field will be provided by the Industry component, which will also be fed to the Population screen's setup method. Unit test that this can find a colonist and assign them to a particular role.

5. Create a new class, PopulationRow, to be created by a loop in the Population screen. PopulationRow will need to have a parameter to accept the Population class's assignRoleToColonist method, so it can pass that to its various role-assigning buttons.

6. Create handler functions for the initial roles: farmer, explorer and miner in the PopulationView class.

7. Adjust the start position of the PopulationRows to push them down a little bit, and add column labels in the PopulationView class, corresponding with the locations of the different cells in the PopulationRows. Column labels are: Id, Name, Current Role, and Set Role. Id should be 10% of the total column width; Name should be 20%, Current Role can also be 20%, and the Role Selection area should be 50% of the total available space.

8. Next, add the actual Buttons to the PopulationRows, so they can display the different Role options in the Role Selection column.

9. Add a names property to the PopulationView class, to provide some initial names for your Colonists. Integrate the Colonist names into the Colonist save/load data system and test thoroughly.

10. Pass each Colonist's name to the PopulationRow as an additional parameter, and have it display the Colonist's name, ID and current role in the appropriate fields.

11. Update the handler functions for the PopulationView screen's various role setting buttons, so that they pass the new role info to the Population class, thus updating the Colonists.

12. Update the Colonist Inspect Display to show the colonist's name instead of their ID, and their current role instead of their current action.

## Chapter Thirty-Four: Module Resource Transfers

### Difficulty Estimate: 3 for development of resource sharing system and associated testing requirements

### November 1, 2022

The final ingredient to allowing Colonists to produce things in the production modules is to give those modules the resources they need as inputs. To get this feature up and running quickly, we will temporarily bypass the need for modules to be connected by members of the Connector class (although that will surely be added not long after implementing basic production). This chapter will be dedicated to implementing a module resource-sharing system, where each module has two new properties: 1) shareResources, which is a simple boolean switch that determines whether or not it is allowed to send resources to other modules (this does not affect Colonists' consume action however) and 2) resourcePar, which will be a number between 0 and 1, which determines the fraction of each (non-output) resource that a module will attempt to maintain, by sending requests to other modules. Eventually when the Connectors are brought into this picture, modules will only be able to send/request resources to/from other modules to which they are connected by the appropriate Connector type (so pipes will enable sharing water, ducts for air, wires for electricity, etc.). For now though, we will instead implement a global resource-sharing scheme wherein every module will submit its resource requests - one resource at a time - to a resource requests master-list, and then the Infra class will go through that list and match each request to a module that A) contains the needed resource and B) has its shareResources value set to true. An hourly update method will be added to the Infra class to routinely recompile resource requests, and all resource transfers will be executed immediately whenever possible. Doesn't make sense to start using flow rates before we even get the Connectors involved!

Exit Criteria:

- [DONE] Modules all have resourceShare and resourceGet policies
- [DONE] Infrastructure class has hourly update to distribute module resources
- [DONE] All possible resource requests are fulfilled instantly each hour
- [DONE] Production modules should only make requests for resources in their 'production inputs' list
- [DONE] [STRETCH] Production modules share resources from their 'production outputs' list even if resourceShare is false

Not Doing:

- Inspect Display updates
- Anything to do with Connectors, including resource transfer rates
- Any ability for the player to adjust modules' resource sharing/request policies
- Resource sharing policies in save game data
- Dealing with Production module resource overflows

1. Add the new fields, resourceShare (boolean) and resourceGet (number), to the Module class.

2. In the Module class's constructor function, add some logic that will set these policies based on the Module's type, so that 'Life Support' modules will not share, and will try to stay full (false, 1) and 'Production' modules will also not share, but seek only to maintain half fullness with regard to their input resources (false, 0.5). 'Storage' modules on the other hand SHOULD share and should not seek to replenish themselves (true, 0). All other modules' default setting should be (false, 0) - in other words, just stay out of the whole business. Add unit tests to the Module class to validate each of these cases.

3. Create a new Module method called createResourceRequests, which will determine which resources to request (if any) based on the module's resource sharing policies. Validate with unit tests before proceeding.

4. Create a corresponding Infrastructure method, handleHourlyUpdates, which will call each Module's resource resource request method.

5. Add a call to the Infra class's hourly updater to the Engine's clock.

6. Take a moment to extract all of the Engine's hourly updates into their own updater method, and put that in the clock, instead of all these individual update calls. Do the same for the minutely update method/s as well.

7. Isolate the Infra class's module resource request compiler into its own method, compileModuleResourceRequests, and have that return the resource requests master list. We will then pass that into yet another new method, processModuleResourceRequests, which will be tasked with the actual distribution of the requested resources. Put both of these method calls into the higher-level method, handleHourlyUpdates.

8. Create a unit test for the Infrastructure class's compileModuleResourceRequests method, to validate that it gets every module's requests into a single-level list.

9. Update the Module class's resource request determination method to only request the input needs for production modules. Update unit tests to reflect this.

10. Create the logic (and unit test cases) for the Infra class's resolveModuleResourceRequests method. It should go through the requests list one item at a time, looking for modules that have the resource present and have a resource sharing policy.

11. Update the logic for the Infra class's resolveModuleResourceRequests method to permit taking resources from production modules, in the event that the resource is part of their OUTPUTS list.

## Chapter Thirty-Five: The Industry Class

### Difficulty Estimate: 5 for lots of little things coming together, including updating/isolating parts of the Colonist's pathfinding logic, plus a new animation sequence

### November 6, 2022

Now that the production modules have been provisioned, it is time to start putting the colonists to work! This chapter will focus on creating a new Engine subclass, Industry, which will act as a repository for all productivity-related information in the colony. The purpose of this class, in its first increment, will be to determine what production jobs can be done for each type of Role that the Colonists can be assigned to. We will start with food production, which will be done in the Hydroponics module (so far the game's only production module) In time, the Industry class will encompass information about power generation and mining as well, but those will be added in later chapters. The idea is that for whatever type of Role a colonist can be assigned to, when they are deciding on a new (non-life-support) goal they will check in with the Industry class to be assigned to a particular module to carry out production work. The Industry class will have two initial methods: updateJobs, which will prepare a list of jobs for each role, and getJob, which will be exposed to the Colonist class when they are starting a new goal.

Exit Criteria:

- [DONE] Industry class creates a list of jobs for each type of occupation (role) every hour
- [DONE] Colonists can get a job assigned to them from the Industry class based on their role
- [DONE] Colonists go to the module specified by their job, and perform a 'work' action there
- [DONE] Once the Colonist's work action is completed, the module's inputs are converted into outputs
- [DONE] Once the work action is completed, modules immediately post another job, resource supplies permitting
- [DONE] Once work is completed, if the Colonist is not yet tired/hungry/thirsty, they begin another production round immediately
- [DONE] Production action (farm) has a basic animation
- [DONE] Production outputs are contained in the production module
- [DONE] [STRETCH] On the hourly module resource transfer phase, production modules will ship their resources to other modules

1. Create the Industry class, as well as a skeletal unit test file. The Industry class should have the following fields: roles (which is a list of objects that contain information about a role, including its name, and the resource it aims to produce) and jobs (which are actually ColonistActions, so we can import that type definition).

2. Create skeleton methods for the updateJobs and getJob methods, and prepare to create some unit tests for them. Don't make the actual tests just yet though. UpdateJobs should take the infra class as an argument in order to come up with a jobs list for every role, and getJob should take a string representing the role name, as well as a set of coordinates (so it can theoretically pick the production module of the appropriate type that is nearest to the Colonist's location).

3. Integrate the Industry class into the Engine, and call its updateJobs method every hour to see a console log message from it.

4. In addition to the updateJobs method, which will be a top-level updater, create a method called updateJobsForRole, which will take the name of the role as well as the infra class that gets passed to the top-level updater, so that it can be used to update the jobs for one particular role instead of doing it for all roles. Then we can call this method via a loop in the top-level updater, or we can call it for one role at a time, should the need arise.

5. Develop the unit tests for the updateJobsForRole method. When given a role name, it should search the Infra class for modules that produce that role's resourceProduced value. It should then be able to narrow down the list to only include modules that have enough of the requisite inputs to allow at least one round of production. It should then make a job (Colonist action) for every available slot in every module that is ready to produce, and return the list of those jobs. Test this by making a test Infra instance with three Hydroponics pods that have been modified to only require water (we'll reintroduce carbon to the equation later on). Fill two modules with enough water to allow food production to occur, and do not fill the other one.

6. Implement the code for the updateJobsForRole method. It should return a list of ColonistActions when it works properly, and an empty list when no jobs are found, or when there is an exception of some kind. Make sure to include graceful error/exception handling, and include that in the unit tests as well!

7. Create a new Infra method called findResourceProducers, that takes the string name of a resource and returns a list of all the modules that have that resource as one of their outputs. Unit test this function in the Infra base class unit tests file.

8. Also, create a new Module method (plus unit test) that returns a boolean when asked if it is provisioned (i.e. has enough input resources to carry out at least one round of production).

9. Update the Hydroponics module so that it only requires water as an input, to facilitate zero-carbon testing ;)

10. Add a new bit of logic to the Colonist Data class's updateGoal block, to check for jobs based on the Colonist's role.

11. Take this moment to extract the three sub-routines of the updateGoal method into their own distinct functions: checkForNeeds, and checkForJobs, which will be the new logic to be developed for getting a job from the Industry class, and preparing to create an action stack based on that job info. The default assignment to exploring can remain in the updateGoal method.

12. Create the unit tests and then the code for the Industry class's getJob method. Version 1.0 of this method will ignore the Colonist's location, and instead simply pop the last item from the jobs list and give that to the Colonist. If no jobs are available, or the role itself is not found, return a null instead.

13. Pass the Industry class to the Colonist's updateGoal method, down into the checkForJobs method, via the Population class's hourly updater method. Validate with a sanity check that the Colonist can get a job.

14. Add new cases to the ColonistData class's determineActionsForGoal method: "farm" and "mine." For now, they can both lead to the same outcome, which is to find a path to the coordinates in the job action.

15. Since job assignments from the Industry class give the Colonist the first (i.e. chronologically last) item for their action stack, add an optional job argument to the action stack determination (and setGoal) methods, so that the checkForJobs method can hand the job to the action stack determinator, rather than trying to add it to the stack before setting the new goal.

16. Next, open up the ColonistActionLogic file, and create the skeleton of a new function called createProductionActionStack.

17. In the ColonistActionLogic file, copy the action stack creation logic for the two different complete stacks (elevator to ground floor exists, and elevator to current floor exists) from the createConsumeActionStack method into their own functions, called climbLadderFromGroundActions and climbLadderFromFloorActions. Since replacing the code in the consume action sequence creator is not necessary at this moment, just use the new methods in the context of the production action stack creator (do a unit test run followed by manual sanity check before proceeding).

18. Plug the new action stack creation sub-functions into the new createProductionActionStack method, so that it adds the pathfinding steps on top of the job action and returns a complete stack. As with the consume action stack creator, if no additional actions are added to the stack after the initial job action (indicating that the job site is unreachable), return an empty list so that the colonist knows that the current goal is impossible (unless of course there is only one action because the colonist is already at the job site!). It will be an hour before the job is re-created by the Industry class if this happens, so there is no need for the colonist to 'remember' that a particular job site is unreachable; they will simply move onto the next job (or if no jobs remain for their role, they should simply revert to exploring until more jobs are created by the Industry class's hourly update).

19. Add a case to the checkActionStatus switch block for "farm" (we'll leave "mine" for another time) to have it resolve the current action once the target duration has been met.

20. Add two new skeleton methods to the Module class called punchIn and punchOut. They will take a number representing a colonist's ID as an argument, and simply console log that value for now.

21. Make a new Colonist method, produce, which will do a position check like the consume method does to ensure that the colonist is in the right position and then find the Module identified by the current action's building ID value. Once the module is found, call its punchIn method with the colonist's ID. Add a call to this method to the colonist's startAction switch block when the action is "farm."

22. Have the Module's punchIn method push the colonist's ID to the module's crewPresent list when it's called. Unit test that this works correctly.

23. Have the Module's punchOut method filter out the colonist's ID from the crewPresent list when it's called. If a colonist whose number is not on the list punches out this should not cause an error.

24. Add the Module's crewPresent field to the Module class's save data.

25. When loading a saved Module that does not have a crew Present list, have that field revert to being an empty list.

26. Next, add a case to the ColonistData's startMovement switch block for "farm", following essentially the same pattern as the "eat" and "drink" actions. In fact, since all three of these cases use the EXACT same pattern, combine them to drop into a single execution block, setting the movement type and duration based on the current action's type and duration values.

27. Create a simple ColonistAnimation to go with the "farm" action. Make the colonist reach over to touch each of the six plant containers.

28. Now, create the Module class's produce method: Reduce the amount of resources in stock for all input resources, and increase the stock for all output resources. Big unit tests needed here broh.

29. Have the Colonist call the Module's produce method and then its punchOut method in the checkActionStatus block for farming (we can potentially add other types of production action to the same switch case stack later on if they involve the same criteria).

30. Add a simple unit test for the Infrastructure class's new method, resolveModuleProduction, to make sure it's airtight.

31. Lastly, pass the Industry class down to the colonist's checkActionStatus method from its handleMinutelyUpdates method, so that the farm action resolution block can call the updateJobsForRole method for that role before resolving the action (but after resolving the module's production, in order to come after the Module's punchOut method call). This should allow the Industry class to re-create the jobs list for that role before the Colonist leaves the module, allowing them to simply take another shift there right away rather than having to wait for the hourly update to regenerate the job. Validate with manual sanity check (i.e. just watch to see if the colonists will do several back-to-back rounds of production before stopping).

## Chapter Thirty-Six: Say Goodnight (Bedtime for the Colonists)

### Difficulty Estimate: 3 for some tight refactoring and upgrades to the colonist movement logic system

### November 15, 2022

Now that the Colonists are able to put in a hard day's work at the farm module, it is time for them to finally be able to take a well-earned rest. The need for rest has been allowed to accumulate for some time now, but has been removed from relevance in the game by setting the threshold to an insanely high value. Now, to complete the Colonist's daily routine, the threshold will be lowered, and a mechanism put into place to allow Colonists to fulfill the need and get some rest. This routine will be similar to the way consumption and production operate, in that the Colonist will attempt to find their way to a particular module (in this case the Crew Quarters) and perform an action there (in this case, rest). Unlike the other two needs, the duration of the sleep action will not scale based on the Colonist's tiredness (need level), and the action will also take a much longer time to resolve than the other ones (colonists will sleep 8 hours per day to maintain their vigour). Also, since the duration of the sleep action will be long enough for both the food and water needs to go from zero to well over their thresholds, we should come up with a mechanism to limit the increase of these needs while the colonist is sleeping. Ideally they should be allowed to increase up to their thresholds but not beyond them, so that the Colonist always wakes up hungry and thirsty (and thus has breakfast before going off to work for the day).

Exit Criteria:

- [DONE] Colonists sleep for 8 hours every day
- [DONE] When they exceed their rest need threshold, Colonists go to the nearest Crew Quarters module and perform the rest action
- [DONE] Colonists' other needs do not grow beyond their thresholds while the colonist is sleeping
- [DONE] Colonists have a sleep animation and are sent to different positions in the sleeping module
- [DONE] Crew Quarters module respects its capacity limits in terms of allowing punching in and punching out
- [DONE] Add a third initial colonist to new games to see what happens when the sleeping module capacity is exceeded - ADDENDUM: They sleep in shifts!!!

1. Reduce the Colonist class's rest threshold from 2000 to 16, and see what happens. Expectation is that they will freeze up as soon as their current goal is completed.

2. Add a new case to the Colonist's DetermineActionsForGoal block for "get-rest", and have it do a simple console log for now.

3. Add a new function in the ColonistActionLogic file, called createRestActionStack, to find the path to the nearest available crew quarters for the colonist to sleep in. Again, just make it a console log for now, plus return an empty list. Call it from the Colonist's "get-rest" case.

4. Rename the Colonist's produce method to enterModule, and have the startAction case for "sleep" call this method as well (punching in to a production module is the same, from the module's point of view, as slouching into the sleeping quarters).

5. Add a case to the startMovement block to start the "sleep" move (which will not be much of a move at all, surprise).

6. Now, start to fill out the rest of the rest action (hahaha) stack determinator function, starting by adding the 'rest' action itself, which will take place in the crew quarters module.

7. Make a separate, reusable function for the ColonistActionLogic that can find the way to a module when given its ID and coordinates, as well as the ID of the surface the Colonist is standing on, plus their coordinates. Integrate this into the Rest Stack Creation function.

8. Add a simple animation for the 'rest' action so colonists don't disappear when they go to bed.

9. For the 'rest' action resolution, make ALL of the colonist's need for rest go away (reset to zero). ALSO, make sure the punch the colonist out from the crew quarters or it will appear to remain occupied after they leave, blocking future opportunities for sleeping.

10. Add some logic to the Colonist's updateNeeds method to only increase the need for food or water up to the threshold for these needs if the Colonist is currently performing the 'rest' action (so they do not wake up terribly hungry or dehydrated - but just hungry/thirsty enough to enjoy a good breakfast!).

11. Just when you thought you could get away with it: Write up a nice unit test to validate the 'rest' action stack creator, and try to think up some diverse use cases since it contains the first iteration of the reusable floor finder function.

12. Revise the Colonist's updateNeeds method to stop its forEach loop at the first need that crosses its threshold (and has not been declared unavailable). Unit test and sanity check that this works properly.

13. Update the Module's punchIn method to return a boolean representing the punchIn's success status. Have it reject punches when it is at is maximum capacity. Unit test.

14. For the Colonist's enterModule method, if it receives a false, end the current action (the colonist has just tried to punch into an occupied module). Unit test this as well. And try to catch it happening with a manual sanity check/temporary console log.

15. Find a way to allow Colonists to detect a module that is on the ground when they are on a non-ground floor. Validate with unit test for a consume action. You can never have too many unit tests -- WE NEED TOTAL COVERAGE!!!

16. Add one last ColonistActionLogic function, to be called by the consume, rest and produce action stack determinators in the event of an action stack being considered a failure (i.e. the path to the desired module/s was not found). Have this function check if the colonist is on a non-ground floor, and if so, tell them to simply find the nearest elevator and climb it to the ground (get off at elevator.bottom - 1 to avoid going underground, haha). This way, even if colonists get stuck on an upper floor (with no ground floor modules to tempt them this could still happen) they will eventually come down, at which point they'll phave an easier time finding what they need on the next attempt. Best of all, since they'll actually have an action stack when this routine finishes, they can immediately look again for the missing resource since they only get told that the resource is unavailable when the action stack comes back empty. Validate this with a unit test (naturally).

## Chapter Thirty-Seven: Smartian Immigration

### Difficulty Estimate: 5, for introducing new concepts such as colonist morale, pagination of the Population view, and the incoming colonist drop pod animation

### November 24, 2022

Now that our initial Smartian colonists have settled into their basic routine, it's time to let the good people of Earth know how wonderful it is on the New World, and to invite more people to join the colony! This chapter will focus on implementing a system for expanding the base's population (without diving into the more complicated question of Smartian reproduction) by adding new 'immigrants' from Earth every 26 Earth months - the interval between ideal Hohmann transfer opportunities. The number of immigrants will be small (between 1 and 3 per cycle) and will always be determined in advance, based on the current colonists' collective morale - which will be determined for each colonist based on how successfully their needs are being met. At the start of the game there will be a standing order to add two more colonists when the next launch date arrives, and at that time, a calculation will be made of the average morale of the original colonists to decide how many more will set out from Earth in the next wave. New colonists will arrive via a parachute-deployed drop-pod, which will look a little bit like the lander shown at the beginning of the game, and which will disappear after the landing animation sequence finishes. All of the colonists who land each (Smartian) year will emerge from the same pod, and their landing site will be randomly selected. Once landed, the new colonists can immediately be assigned roles in the colony, and can be viewed on the (now paginated) population view screen.

Exit Criteria:

- [DONE] Every 26 Earth months, a new batch of colonists will arrive from Earth to join the colony
- [DONE] New colonists arrive via a drop-pod, which will have a landing animation like the one at the beginning of the game
- [DONE] Drop pods land on a randomly chosen column towards either the right or left edge of the map
- [DONE] All maps are updated to only contain one zone, so that new arrivals do not get stuck (legacy saves need not be supported)
- [DONE] Colonists have a morale score, from 0 to 100, shown in the Colonist Inspect Tool display
- [DONE] Colonists gain one point of morale every time they satisfy a need
- [DONE] Colonists lose one point of morale every time a need exceeds its threshold by 2 or more (i.e. goes into the red)
- [DONE] Colonists' sleep need stops increasing once they begin to perform the 'rest' action
- [DONE] Population page's colonists roster is paginated, to allow for adding new rows without cluttering the page
- [DONE] Earth page displays the correct Earth date
- [DONE] Earth page also displays the Earth/SMARS date for the next anticipated colonist landing
- [DONE] Earth page also displays the projected launch date for the next batch of new colonists (not the same as the landing date)

1. Go through the maps in the game's database and delete all of the ones that have cliffs/multiple map zones, to prevent newly landed colonists from becoming stuck/isolated when they arrive.

2. For each map that was deleted, replace it with a new one that meets the desired specifications.

3. Add a new field to the Colonist class for morale, which will be a number from 0 to 100. In fact, add two fields, morale and maxMorale, to restrict the range of possible values (apparently TS does not have a built-in way to limit a number's value in the type declaration, as far as I can tell at least). Colonists start with 50 morale in their constructor function.

4. Add a new Colonist method, updateMorale, which takes a number as its only parameter, and adds this (the number can be negative) to the colonist's current morale value. Validate this method on its own with a very basic unit test.

5. Add another Colonist method, determineMoraleChangeForNeeds, which checks the colonist's current needs vs their thresholds, and then calls the updateMorale method to reduce morale by 1 for each need whose current value exceeds the threshold value by more than 1... or better yet, add a 'tolerance' variable to the Colonist Date clas, to allow customizability on the amount by which a need has to exceed its threshold before lowering morale. Validate this with a more thorough unit test.

6. Integrate the Colonist's morale updater method into the hourly updates handler, to be called after the needs updater has been called. Validate with in-game sanity check.

7. Move the new colonist unit tests off into their own file, called ColonistMorale.test.ts, to start differentiating between different types of tests (and to ensure a cleaner environment for new tests that don't need Infrastructure/map data).

8. Add a call to the updateMorale method to the action resolve case for eat, drink and rest, to add one morale whenever the colonist resolves one of these actions. Validate with unit test.

9. Update the Inspect Display for Colonists to show their morale below their needs chart, and have the font colour reflect the fullness of their morale.

10. Add the Colonist's morale to their save data, and in the constructor add some logic to either use the saved morale value or 50 as a default when loading a colonist. Validate with in-game sanity check.

11. Look at the Load Game screen to remember how to implement a pagination system, then apply that to the Population View. Make sure to test that the view opens/closes as expected, and resets the pagination for the Colonist rows each time the view is closed.

12. Add a list of ten adjectives, each of which will correspond to a 10-point section of the colony's average morale score.

13. Have the Population class add up the colonists' morale and find its average. Read that value in the PopulationView screen, and then map that to the corresponding adjective from the above-mentioned list, and display that instead of the flavour text ("plucky") that is currently shown for the colony's morale rating. Add a unit test to the Population class to validate the average morale is calculated correctly.

14. Reposition the Population View's message text to make it appear just below the 'Next' button, and have it show, as a default value, the current and total number of colonists in the base (e.g. 'showing records for colonists 1 - 4 out of 5').

15. Update the PopulationRow to display the colonist's morale in the second column, and their name in the first (eliminating the ID display).

16. In order to permit still wider unit test coverage, remove the P5 dependency from the View class constructor, and fix all 4 sub-classes (industryView, populationView, tech and earth).

17. Create a basic unit test file for each View screen, with a simple define <function> test for each.

18. Fix the Earth view's Earth date field so that it either starts at January 1st, 2030, or takes an argument to the a new loadSavedDate method to load a saved game date. Add the current Earth date as well as the remainder quantity to the save game data object, so that the date doesn't slip between saves.

19. To avoid floating point math issues when calculating the date remainder, change the value in the constants file from 7.15 to 715 and include instructions to divide the value by 100 and collect the remainder from that instead.

20. Add new values to the game's constants file for Hohmann transfer interval duration, interplanetary flight time, and pre-flight preparation time, all in terms of Earth days.

21. Using the newly added preflight prep time constant, have the Earth view calculate the initial value for both the next launch from Earth and the next landing in its constructor, and display these values on the Earth view. Validate with unit test.

22. Update the Earth dates save data field to include the next launch and landing dates. Validate with in-game sanity check. Only allow save data to replace the default values if all of the Earth date data (including launch and landing dates) are present.

23. Give the Earth view a new method called checkEventDatesForUpdate. Call it on each hourly update and have it console log when either the launch date or the landing date is passed by the current Earth date. Do a unit test of this basic functionality with the initial launch and landing dates created by the constructor.

24. When either the launch or the landing date is passed, replace it with a new date by adding the Hohmann transfer interval constant to it. Validate this with unit tests and a manual sanity check, as it (in tandem with the item below) represents the completion of the basic Earth launch/landing scheduling system.

25. Add a top-level updater to the Earth view to handle the full sequence of weekly events, starting with the Earth date update (Which also doesn't need any argument to execute since it just uses a game constant as its sole input).

26. Add another simple Earth view field called shipInTransit, which is set to true by the launch event and false by the landing event. Insert this method into the renderer to optionally show text about the next mission that has been sent from Earth.

27. Add a field to the Earth view to record the number of colonists on the current flight, once a launch is made. Give this a default value of 2 and display it on the Earth view only when a flight is en route to SMARS. Then add it to the game's save data and validate that it can be loaded from a save.

28. Change the Engine's new game parameters to start new games with 4 colonists. That'll be the magic number for the game's initial release.

29. On the Earth view, add a text field to display the anticipated / actual number of colonists on the next flight. Change the phrasing from 'anticipated' to '' based on the flightEnRoute variable.

30. Add a method to the Population class to determine how many new colonists should be sent from Earth based on the colony's current morale rating, so that if morale is below 25 no one gets sent, 25 - 49 = 1 colonist, 50 - 74 = 2 colonists, 75 - 99 = 3 colonists and 100 morale = 4 new colonists sent on the next rocket. Call this method from the Game component for every hourly update, and once a flight is en route, lock the value in by storing it on the Earth view component (so that the number of people being sent can't change once the flight is launched!)

31. When each flight arrives, notify the Engine of the number of colonists that will be landing. Do this by having the Earth view return a number, representing the amount of new colonists, from its weekly updater method whenever a landing occurs. The Game can read this value after each hourly update, and if there is a value, it tells the Engine to initiate a landing sequence (starting with a console log about the fact). Unit test that the Earth view only returns a number on the update in which a landing takes place.

32. Instead of checking for empty columns, just have the new colonists land 1 - 10 columns away from either the right or left edge of the map. For the moment we will not worry about the landing pod's footprint, as the landing area will only be one block wide (even if the animation for the pod looks larger this will not matter as the pod will disappear after touching down). Tell the Engine to console log the chosen landing column, as well as the vertical distance that needs to be covered for that column.

33. Factor P5 out of the Lander class, as preparation for extending it when creating the DropPod class.

34. Create the Drop Pod class, which can be an inheritance class based on the Lander. Its job will be to show the new Colonists descending to the planet's surface. Its sprite should be a simple trapezoid with a circular window in the middle and a large semi-circular arc as a parachute, with three line segments linking the edges of the parachute to the capsule. For bonus points, give the parachute a stripe down the middle. The key thing for the Lander to work properly is for it to have its render function call its advanceAnimation function to update its position every frame.

35. Update the Engine's animation field to include the Drop Pod as well as the Lander from the game's start sequence. Then, update the Engine's startNewColonistsLanding method to create a new animation for the drop pod when the landing sequence starts, and see what happens.

36. Add an event management system to the Engine so that it can hold the game in wait mode while various animations play.

37. Add some logic to the DropPod's animation so that the parachute continues to descend after the landing completes, like the dust cloud for the original lander does.

## Chapter Thirty-Eight: What's Mine is Mine

### Difficulty Estimate: 4 for moderate complexity of new mouse context rules integration, plus industry view basic layout and colonist animation system upgrade

### December 12, 2022

Now that more and more people are coming to SMARS, it is vital that the colony becomes self-sufficient. Currently the colonists can convert water into food, but their water supply is finite and cannot be replenished. Luckily there appear to be some ice patches nearby, which the colonists will soon be able to mine. Initially mining will be a highly simplified process, with the player being able to designate individual tiles as mining locations (for water only, at first). Mining jobs will then be made available by the Industry class, and will function very similarly to module-based production jobs - the colonist will walk to a set of coordinates, perform the mine action, and then repeat as necessary. There will be no carrying back and forth of mined materials/equipment at first, although these concepts may come into play in later patches as the game becomes more complex. For now though, any resources produced via mining will be instantly teleported into the nearest storage class module as soon as the colonist's mining action is completed.

Exit Criteria:

- [DONE] Colonists assigned to be miners will look for mining jobs from the Industry class
- [DONE] The Industry class will create a mining job for every designated mining block that is not currently occupied
- [DONE] The player can select surface level blocks containing the water resource as mining targets when in Resource mode
- [DONE] Blocks designated as mining locations have a little traffic cone placed on top of them, to indicate their status
- [DONE] The Industry view screen will display information about current mining locations and jobs
- [DONE] Colonists will have a new action animation for mining
- [DONE] When mining action is completed the mined resouce will be immediately added to the first available storage type module
- [DONE] [STRETCH] Colonist animation functions can optionally render a 'tool' animation to accompany their bodily movements

1. For starters, delete / comment out all of the console logs from the previous two chapters. Use comments for the colonist action logic as they'll be needed when we inevitably have to wade in there and debug things.

2. Add a rule to the mouse shadow for when the mouse context is 'resource' to draw a little jackhammer for the mouse cursor, similarly to how the inspect tool has a little magnifying glass. The tip, or point, of the jackhammer should be where the cursor is. Add the rules for rendering this to the MouseShadow class, and tell its constructor to accept a fourth, optional parameter called resource, to indicate that it should take on the appearance of a jackhammer.

3. Create a new field in the Industry class, called miningLocations. It should be a dictionary of resource types mapped to lists of Coordinates (e.g. { water: [{ x: 0, y: 0 }, { x: 2, y: 99 }, ... ]}).

4. Create a new Industry method, updateMiningJobs, to be called within the individual updateJobsForRole method when the role is 'miner.' Have it do a console log at first.

5. Now add the click-response functionality for the Engine when it's in the Resource mouse context: Find the block that was clicked on from the Map data, and console log if it A) is on the surface of its column, and B) contains water. Create a new Map class method to verify the surface status (we'll let the Engine figure out the resource situation, for now at least) and give it a nice unit test before integrating into the Engine's click handler.

6. If the clicked block has both of the above criteria, add it to the Industry class's water mining locations list, via a new Industry class method called addMiningLocation. This method should take a resource name and coordinates pair, and add the coordinates if they are not present in the list of mining locations for that resource. If the coordinates ARE already present, then they should be removed (so that clicking a tile twice toggles its mining zone status). Validate with unit test and manual check.

7. Add a render block to the Industry class so that it can highlight the locations of all tiles that are currently selected for mining when the mouse context is 'resource.'. Add it last to the Engine's render block so that it is guaranteed to be the top layer. Instead of highlighting the block, put little cones on top of it to indicate that the block is being designated for mining.

8. Add the Industry class's mining locations field to the SaveInfo structure, and add a loading method for the Industry class to receive mining locations all at once from the Engine when a save is loaded. Validate by making a new save, then loading it, as well as loading an older save to test the game's resiliency.

9. To keep track of which mining zones are available for new job creation by keeping a parallel list of miningCoordinatesInUse in the Industry class.

10. Now, fill in the updateMiningJobs method (and add a unit test) to create a new mining job for each unoccupied mining location. See if this starts giving the colonists mining jobs.

11. Add a new method to the Module class called getResourceAvailableCapacity, which takes the name of a resource as its only argument and returns the amount of space left for that resource (i.e. its max capacity - current quantity). If the module is full, or if the module does not have the capacity for the given resource return 0. Unit test before integrating with the method described below.

12. Add a new method to the Infrastructure class that finds all modules with available storage space for a resource, and then returns the first one with the 'Storage' type, if possible. The Colonists will call this method to deposit the resource that are produced by mining in a moment. Have it prioritize deposits into modules with the 'storage' type, but also have it fall back to any module that can hold the requested resource if no Storage modules are available. If no modules are available that can contain the requested resource (irregardless of type) return a null. Do a unit test before proceeding.

13. Create a new Industry method to punch in/out of a mining location for a given resource (parameters: resource name, coordinates, in/out (boolean)). Add unit test to ensure proper functioning before proceeding.

14. Create a simple colonist action logic function for finding the way to a mining site. Since mining sites can only be on the map (not on a floor) they should be simpler to find than a production module. Make sure Colonists can access mining sites from a floor or from the ground.

15. Add "mine" case to the ColonistData's determineActionsForGoal (it will ultimately have to be slightly different than the farm case since it will call a ColonistActionLogic function that just looks at sites on the ground instead of for modules), checkActionStatus, startAction, and finally startMovement.

16. Next, add a simple mining animation for the Colonist. Initially do not include the jackhammer.

17. Add mining locations in-use data to save games. Do a test save / restore to validate that the feature is working. On saving / loading the saved game, add a console log that states which mining locations are occupied, to ensure the value is preserved.

18. Update the Colonist class to include a new method for rendering the miner's jackhammer. Initially this can just be a hardwired method that takes the jackhammer animation from the mouse shadow class, and puts all of that functionality into a colonist method called renderJackhammer. Then the main render method displays that animation if the current action is 'mine.'

19. Add some basic info about the number of mining locations/ active locations to the Industry page, as well as the number of production modules (hydroponics pods) existing/in use, and a breakdown of the colony's labour force.

20. Ensure that multiple colonists cannot pile into the same mining zone.

## Chapter Thirty-Nine: Power to the People

### Difficulty Estimate: 3 For new Module and Infrastructure methods for handling power generation

### December 25, 2022

For the final non-UX pre-launch feature, the colony will be given the ability to use and produce electricity. Initially electricity will only be needed for production at the hydroponics module, essentially acting as a second input resource. Electricity will be produced by a new class of "power" modules, whose first instance will be the trusty solar panel: a new, non-stackable module that will passively generate power with every hourly update. A number of the game's modules will be given some power storage capacity, and the Small Node modules underneath the base will be replaced by a new Small Battery module to store the base's initial power supply. Also, to avoid having to introduce pagination to the build menu (it will be added eventually, but after the game's initial release) the Communications Dish module's type will be changed from 'communications' to 'test' so that it does not appear in the in-game build menu. The space that this saves in the module types menu can then be used to add the first 'power' module (solar panel), and the small battery can be added as the final initial storage structure.

Exit Criteria:

- [DONE] Game starts with 4 Small Battery modules instead of the now-defunct Small Nodes at the base of the colony structure
- [DONE] Hydroponics module requires power to produce food and air
- [DONE] Economy class displays the base's power supply at the top of the screen
- [DONE] Solar panels (as the first power modules) produce power every hour without any input resources/colonist labour action
- [DONE] Power generated by solar panels is transferred to available storage modules every hour to prevent waste

1. Update the Communications module to change its type to 'test' so that it does not appear as a build option in the game. Verify that the Engine's new game sequence is still able to find it to add to the starting modules placement.

2. Make a new storage-class module called Small Battery, which will be 2 tiles wide and 1 tile tall. Replace the 8 small nodes under the base's initial structures with 4 of these, lined up end to end to make a 8 x 1 tile formation. Again, test the Engine's start-game sequence to verify that everything works properly.

3. Expand the screen width and world view by increasing the value of the SCREEN_WIDTH and WORLD_VIEW_WIDTH constants, to allow space to display the colony's power levels as a fifth main resource.

4. Adjust the positioning of the Login / New User buttons in the game's login page, as well as the Start New Game / Back To Menu buttons on the NewGame page, and the Load Game / Return to Main Menu buttons in the LoadGame screen, as well as the buttons in the In-Game Menu.

5. Update the Engine's new game sequence to provision the starting batteries with power.

6. Add the Solar Panel module as a new module type, "Power", to the game's database.

7. Add a new Module method, generatePower, that simply takes a module's outputs list and adds them to the module's stored resources (this method will only be called for modules with the "Power" class, so it can be a simplified version of the produce method). Unit test this method before proceeding.

8. Add a new Infrastructure method, resolveModulePowerGeneration, to call the generatePower method for all modules whose type is "power." Unit test this method before proceeding.

9. Add power to the Hydroponics Module's list of inputs, along with water. Validate that this works in-game before proceeding.

10. Add the Infrastructure class's power generation method to its hourly updates, and validate in-game that the solar panel modules produce power ever hour - hey that rhymes!

11. Add an Infrastructure method, to be called every hour, that locates production modules that are storing their output resources, and attempts to find Storage class modules to hold these resources so that they don't build up and eventually overflow in the Power / Production class modules that have generated them. You better believe that's gonna need a unit test!

12. Add the current power supply and rate of change to the Economy class, to display at the top of the screen.

## Chapter Forty: Day and Night Cycle

### Difficulty Estimate: 3 for integration with power production system and aesthetic upgrades

### Date: December 29, 2022

Once the basic rules for power use/creation have been set up, a few additional finishing touches will be implemented to round out the game's initial features for its first release. The first of these final improvements will be to add a simple day/night cycle to improve the game's aesthetics and also to add complexity to the solar power generation process (no power will be produced at night time). This chapter will focus exclusively on implementing the day/night cycle and its ramifications for power generation, as well as the accompanying night/day animation for the game's sky.

Exit Criteria:

- [DONE] The game's background colour changes depending on the time of day, and stars are visible at night time
- [DONE] Solar power is available only when the sun is up, which is from 6 AM to 6 PM every day (no seasons to be added just yet)
- [DONE] Solar power availability peaks at mid-day, and wanes when within 3 hours of dawn or dusk

1. Add a simple boolean flag to the Engine class, day, to tell if it's day or night in the game.

2. Add a simple method, updateDayNightCycle to the Engine's time keeping section to update the day/night value every hour, switching it to day at 6 AM and to night at 6 PM. Call this method on the Engine's setup to ensure the value is calculated right away when a saved game is loaded. Remember also that clocks have 12 instead of 0 as the first number in every cycle...

3. Add another new Engine field for skyColour, to keep track of which colour the sky is based on whether it is day or night. Have the updateDayNightCycle method set it to one colour for day time, and another for when it changes to night time.

4. Create a new Sky component to avoid cluttering the Engine up with too much new code. Add all of the existing code for updating the Engine's background colour to this component and add it to the Engine's renderer to take care of all future atmospheric effects going forward.

5. Make the render for the new sky component show some stars in the night sky.

6. Have the new sky component use a gradient colour for the sky during the daytime. If this succeeds, add a gradient to the night sky as well.

7. Create a simple unit test file for the Sky component.

8. Pass the sunlight level to the hourly updater to make the solar panel's output dependent on the time of day.

9. Now for the complicated bit: Based on the time of day vis-a-vis the day/night cycle, calculate another Engine property, sunlightLevel, as a value from 0 to 100, where 100 is the value for when the sun is high, and 0 is the value for night time. Since there might be some asymmetry from night and day (night is always 0% whereas the value will be between 1 - 100% during the day) the method for calculating this will have to have different equation depending on whether it is currently night or day. This should be done by a new Engine method, updateSunlightLevel, that gets called only during the daytime block of the updateDayNightCycle method.

10. The other half of the complicated bit: Add a hexadecimal decoder to the Sky class to allow it to alter the hex value of its current colour code to reduce the brightness of the SECONDARY colour as night approaches. Pass the Engine's sunlight value to the setSkyColour method with each minutely update to see it change smoothly!

## Chapter Forty-One: Basic Module Maintenance

### Difficulty Estimate: 5 for implementing new maintenance cost system, updating unit tests, and adding module status display

### Date: December 31, 2022

Once the day/night cycle is established, an hourly maintenance cost for some modules will be introduced to add difficulty to the game in terms of resource management. Initial costs will come in two forms: resource usage, as in electricity to power the lights and heaters and so forth, and air loss due to leakage. All pressurized modules will lose a small amount of air every hour, and some modules like the Crew Quarters will need to consume power as well. Modules that have not gotten their maintenance resources will not be usable by the colonists for production/eating/drinking/sleeping, so it is imperative that resources are kept flowing. A module will need just a simple boolean to keep track of whether or not it is useable due to maintenance (or lack thereof). This chapter will explore various simple techniques for illustrating if a module has been rendered unusable due to a lack of maintenance resources.

Exit Criteria:

- [DONE] All existing modules in the database have their maintenance costs and storage capacities updated to 'real' values
- [DONE] Hydroponics modules produce more air as a production output
- [DONE] Infrastructure class calculates and docks resources for module maintenance every hour:
  - All pressurized modules leak 0.01 units of air per unit of volume per hour (more sophisticated rules to follow)
  - All maintenance costs are subtracted, when possible, every hour
- [DONE] When a module has missed its latest hourly maintenance check (i.e. come up short) it is unusable for colonists
- [DONE] When a module is unusable due to missed maintenance resources, its appearance is altered to display this fact
- [DONE] When a module is unusable due to missed maintenance, it is passed over by the Industry class for jobs creation
- [DONE] When a module regains its maintenance resources and passes its maintenance check its usability is restored
- [DONE] Module maintenance status boolean is added to save game data
- [DONE] Module maintenance costs are shown on the buildingChip component
- [DONE] Module maintenance costs are shown on the Module Inspect display area
- [DONE] Module current pressurization status is shown on the Module Inspect display area when relevant
- [DONE] If a module is missing one or more maintenance resources, those resources are shown in red in its Inspect Display chart
- [DONE] During the inter-module resource distribution phase, oxygen is distributed equitably and optimally

### New metric: How many seconds does a (game) hour last on 'fast' speed? 20-21 seconds over a 4-hour period.

1. Go through those modules and update their maintenance and/or storage capacities. Ensure that any resource needed for a module's maintenance is represented in its storable resources list (although not necessarily the other way around). Also, for simplicity's sake, make all storage modules require no maintenance (no costs and not pressurized - except for the oxygen tank, which can be pressurized since it already stores oxygen).

2. Add a new Module field, isMaintained, which will be a boolean that indicates whether the module's maintenance needs are met. This means, in the case of modules that are pressurized, that they have oxygen, and in general that all of the module's maintenance needs (if any) have been met. If a module has no needs (such as a battery or a solar panel) its isMaintained status will always be true, since it has no needs that are not being met.

3. Add a new Module method, handleOxygenLeakage, to reduce oxygen by a fixed amount (for now) if the module is pressurized. If the module has an insufficient amount of oxygen present, have this function return false (a top level method will determine the overall maintenance status of the module). Unit test this before proceeding.

4. Add another new Module method, handleResourceUse, which will go through the list of the module's maintenance needs and try to reduce the supply of each one. If it encounters any shortages, it should return false. Unit test this before proceeding.

5. Add a top-level Module maintenance method, handleMaintenance, that will take care of calling both the handleOxygenLeakage method and the handleResourceUse method and set the module's isMaintained status to true of both methods return true, and false if either of them is false. Unit test before proceeding.

6. Add a maintenance method to the Infrastructure class, called handleHourlyMaintenance, that will call each module's handleMaintenance method. Add just a very simple unit test here.

7. Add the hourly maintenance method to the Infrastructure's general hourly updater method, to be called at the end of the sequence (after all resource transfers have been completed) and verify that it works in-game.

8. Add a simple rectangular shadow to render on top of any module that has missed its latest maintenance check. Addendum: Nailed it right off the bat!

9. Update the Industry class's job creation logic to ignore modules that have a false value for isMaintained. Validate in-game and also add a unit test before proceeding.

10. Get crew to punch in and out of modules for eating and sleeping actions (this is already implemented for resting). Validate in-game and add a new colonist data class unit test before proceeding.

11. Update the logic for the module's punchIn method, to not allow punching in if the module is in a non-maintained state. Update unit tests if this breaks if any, and add a new one for the module class and colonist data class to verify this works.

12. Update the BuildingInfo component to display the maintenance costs (if any) of new building options.

13. Add the 'show more info' button to non-production modules, and add maintenance costs to the secondary display.

14. Add a new Module method, listMaintenanceResources, which returns just the list of resource names that are needed for maintenance. Include 'oxygen' if the modue is pressurized. Unit test before proceeding.

15. If a module is not maintained, either because of lack of oxygen or other resources, display this fact in its primary inspect display page, replacing the integrity value (which is not currently meaningful). If the module is not maintained, use red text instead of green. Also, differentiate between being depressurized (lacking a needed oxygen supply) and unpressurized (not requiring oxygen, like solar panels/batteries/etc).

16. Add each module's maintenance status to its save data, so that disabled modules are not momentarily revived when a saved game is loaded. Verify in-game by saving and then re-loading a game in which at least one module is not maintained, and verifying that it is loaded with the correct status (i.e. it doesn't have to wait an hour to be pronounced unusable).

17. Implement a 'rationalized' system for resource distribution, by isolating each component of the resource transfer phase into its own method and ensuring that each one just does its job and nothing else. Production and power modules push on the push phase, and request resources in the request phase; other than during the push phase production modules should not give away their resources (to avoid bouncing supplies back and forth and causing needless outages).

18. Clean up console logs from this and previous chapters before proceeding to the final game optimization and UX polishing chapter/s.

## Chapter Forty-Two: Pre-Release Colonist Pathfinding Improvements

### Difficulty Estimate: 3 for basic tweaks to the logic, and extensive unit tests

### Date: January 11, 2023

In the last pre-release feature update, a slight adjustment will be made to the colonists' pathfinding logic to make use of their current position when determining a destination module for consumption/production, or when finding a mining site. And that's all, I swear!

Exit Criteria:

- [DONE] When presented with two or more modules at which to get a resource, a colonist will choose the nearest module
- [DONE] When presented with two or more modules at which to rest, a colonist will chose the nearest module
- [DONE] When presented with two or more modules at which to do work, a colonist will choose the nearest module
- [DONE] When presented with two ore more mining locations, other things being equal, a colonist will choose the nearest location

1. Let's start with production modules: update the Industry class's getJob method to take the Colonist's coordinates into account. Update the unit test/s for this method and then try it out in game!

2. Add a proximity consideration for the Colonist's rest action so that they will always choose to go to the nearer of two different crew quarters to sleep. Again, fix / update the unit tests for this action in addition to validating in-game that the solution works.

3. Add a proximity consideration for the Colonist's consume action, using the same technique as the one deployed for resting and working. Add a final unit test, then validate in game.

## Chapter Forty-Three: UX Cleanup Part I - Out-of-Service Screen Cleanup (UX Needs Addressed At Last!!!)

### Difficulty Estimate: 1 for relatively simple reformatting / closing off of loose ends

### Date: January 19, 2023

The first and (hopefully) simplest component of the pre-release UX cleanup will be to disable/remove all of the buttons that are currently in the game's interface despite having no actual functionality. The first and most egregious item on this list is the pre-game menu 's "preferences" option, which currently leads to a green screen of death, forcing the player to refresh the browser. Yuck! Speaking of having to refresh the browser, the player currently has no way to quit out of their current game, so let's fix that by adding a 'quit to main menu' button to allow the player to go from a game in progress to the main menu, and from there either load a save file or start a new game without ever needing to hit that 'F5' key. Finally, we'll add a quick funny 'coming-soon' message to the in-game Science screen (formerly the 'technology' screen) and add a simple disabled look and response to the in-game Overlays button.

Exit Criteria:

- [DONE] Preferences screen is disabled/no longer leads to the inescapable green screen of death
- [DONE] Player can quit to the main menu from the in-game menu, effectively ending the game without having to refresh the browser
- [DONE] In-game science screen has an attempt at a humorous 'coming soon' message when viewed.
- [DONE] Sidebar 'Overlays' button is greyed out and does not respond to clicking (Aside from a humorous 'out-of-order' message)

1. Preferences Screen: REMOVE IT! Version 1.0 of the Main Menu will have just three options: New Game, Load Game and Back to Login.

2. The In-game menu should have a 'Quit to Main Menu' button that will simply return to the Main Menu, scrapping the current game's data. Ensure that it wipes that data completely, so that other saved files can be loaded, or a new game begun cleanly. Autosave feature can be added at a later date.

3. The Sidebar's Science view button should be grayed out and the handler function should not do anything (or maybe it can console log an amusing 'coming soon' message). Take this moment to rename it to 'science' instead of 'tech' / 'technology.'

4. The Sidebar's Overlays button should also be grayed out and unavailable.

5. Final thing, unrelated but important: Increase the oxygen generated by the hydroponics pod production to 60 oxygen units instead of 30.

## Chapter Forty-Four: Selection Highlighting

### Difficulty Estimate: 2 (for slightly different conditions for each category of highlightable object)

### Date: January 20, 2023

In the second pre-release UX chapter, we have another relatively simple (hopefully) mission: To ensure that all buttons have the correct "activation highlighting" at all times, to indicate what the current settings are, and to extend the principle of highlighting the current selected object into the game world as well - highlighting whichever module, colonist or bit of terrain is currently under the scrutiny of the Inspect Tool. For the initial implementation, a simple bright box/ellipse will be used to indicate which in-game object is currently selected.

Exit Criteria:

- [DONE] Sidebar button for current game speed is always highlighted correctly
- [DONE] Inspect / Resource buttons are highlighted correctly at all times
- [DONE] In the Population View Screen, each colonist's current role is highlighted
- [DONE] 87When the Inspect Tool is used to select a Colonist, the Colonist is displayed with a green ellipse around their body
- [DONE] When the Inspect Tool is used to select a Module, the module is displayed with a green rectangle around it
- [DONE] When the Inspect Tool is used to select a terrain Block, the block is displayed with a green rectangle around it
- [DONE] When the Inspect Tool is used to select a Connector, the whole segment is displayed with a green rectangle around it
- [DONE] In the Load Game screen, the selected save remains highlighted when the player changes the current 'page'
- [DONE] Whenever the player arrives at the Load Game screen it should always have the same user experience as the first time

1. Gamespeed buttons: Add a new Engine method, setGameOn, to handle every change to the gameOn variable (in other words, don't set it directly inside other methods).

2. In addition to setting the game to 'on,' make the setGameOn method update the sidebar's gamespeed buttons to indicate the correct time speed setting, using the switch case logic that currently sits, unused, in the setup method.

3. Add a new Engine method called setSidebarSelectedButton, in the mouse click handlers section to set the Sidebar selected button to one of two different index positions (5 and 6). This method will use a switch case where if the current mouse context is 'resource' it returns the number 5, and if the context is 'inspect' it returns a 6. This number is then passed to the Sidebar...

4. The Sidebar will get a new method called setSelectedButton, which calls the resetSelectedButton method, and also takes an argument that sets the current button selection to highlight either the industry button or the resource button...

5. Have the Engine call the setSidebarSelectedButton as part of the setup routine. Verify in-game that this ensures that the correct button is always highlighted for the Engine's mouse context.

6. Add a new method to the Population view screen to highlight the role button for each colonist's current role when their Population Row is created. Validate in-game before proceeding.

7. Add a new property to the Colonist Class, highlighted, which will be a boolean value. Also add a simple setter function to control this setting.

8. Add a new Population Class method, highlightColonist, which takes a colonist's ID as its only argument, then resets every colonist's highlighted value to false, and finally sets the given Colonist's highlighted value to true.

9. Update the Colonist's renderer to check if they are highlighted, and display a rounded green rectangle around the Colonist's body if they are. Later on we can consider more advance highlighting that follows the Colonist during movement, changes shape based on what they're doing, etc.

10. Now add highlighting to the Infrastructure class. This will be done differently than the way it's handled for Colonists, since structures (especially modules) are rendered much earlier than colonists, and also tend to be closely clustered together, making their highlight outlines much more likely to be eclipsed by objects that are rendered on a 'higher' P5 draw layer. To overcome this issue, add two new fields to the Infrastructure class, highlightedModule and highlightedConnector. Then, when the Engine's handleInspect method detects that a module/connector has been highlighted, call the Infra class's new highlightStructure method, and have the Infrastructure class itself take care of the rendering so it can paint the outline at the end of its render block - AFTER all of the individual modules/connectors are rendered.

11. Finally, add this highlightStructure method to the Engine's clearInspectSelection method (called with a zero to indicate that a deselect is being requested) and also to the Engine's handleInspect case for Modules and Connectors.

12. Now add highlighting for terrain blocks. Since the Map is the lowest level on the render stack, add the render rules for map tiles to the Engine's render block (but keep track of which block is highlighted in the Map class). Blocks should have no idea if they are highlighted or not.

13. Ensure that no 'sticky clicks' are registered when the player returns to the Load Game page (this seems to only happen when the player returns to the Load Game screen after quitting a game in progress and returning through the main menu).

14. Fix the logic for the LoadGame setup to ensure that its pagination setting and selected game data is always reset when the screen is opened (so that, if the player is browsing through older saves, then leaves the page, then comes back, they start on the first page with the most recent saves again). In other words, reset all of the data that can be set by the player for the Load Game screen as soon as the player exits it.

# Volume II: Deployment to the Web (SMARS 1.0.0)

### Date Started: February 16, 2023

The volume (I'll be damned if I use Jira's terminology, even if 'epic' does have a nicer ring to it!) dedicated to SMARS' first deployment to the internet will be about delving into DevOps technology, and making a respectable effort at deploying an application that is not only reliable, but also secure, and well monitored. There will be a good amount of new technology involved, nearly all of which is outside of the currently familiar realms of the 'web stack.' First and foremost on the list of new technologies is Docker, whose mastery is considered an essential part of the DevOps toolkit. After that, the game will be deployed using various resources and services on AWS, with security provided by OpenSSL and Certbot, and we will prototype the whole deployment effort as much as possible using an Ubuntu server running on a Vagrant/Virtualbox virtual machine.

The purpose of this initiative is twofold: Firstly, to get SMARS to the point where, theoretically at least, it can be seen and played by anyone in the world; and secondly, to put into practice many of the core DevOps skills that have hitherto only been partially developed, or developed in the context of doing a small part of a larger job.

Unlike previous efforts, there is a financial cost involved in this stage of the game's development, as putting things on the cloud isn't free, especially if you're registering a domain name and getting a Certificate Authority (CA) to endorse your website's authenticity. While it is impossible to put a price on learning, one of the minor goals for this effort must nevertheless be to ensure that the game uses resources as efficiently as possible, and runs on the slimmest budget possible, while providing the best quality of service possible.

Volume Exit Criteria:

- [DONE] The game has a fixed domain name that is at least somewhat catchy, as well as pithy.
- [DONE] The game can be visited in a web browser using https protocol, with no warnings/suspicion alerts by the browser
- [TBD] The game is constantly available (production server has high availability)
- [DONE] The game's production database, including save game data, user profiles, etc. is reliably saved/backed up
- [TBD] The game can be updated, via a partly or wholly automated process, with minimal downtime in the production environment
- [DONE] It is possible to test deployments/updates on a staging server before pushing to production
- [NOT-DONE] The game's cloud presence has alerts built in regarding billing thresholds
- [NOT-DONE] The game's cloud presence has alerts built in regarding performance issues
- [PARTIALLY-DONE] The game's docker containers have health checks and can reboot if they crash
- [DONE] The game's docker containers' logs are saved to an external backup system
- [DONE] The game can be deployed, in whole or in part, as code (i.e. with Terraform or similar service)
- [STRETCH] [PARTIALLY-DONE] The game's Docker resources are slimmed down to use as few resources as possible

## Chapter One: Virtualization and Containerization Prototyping

### Difficulty Estimate: 5 for navigating the uncharted waters of Docker container building and deployment

### Date: February 16, 2023

In the first installment of the game's deployment epic, we will work on deploying Docker images of the SMARS stack on a virtual host machine, and sorting out the manual steps and alterations to the game's source code needed to set up these containers.

Phase one of this first chapter will be to start by spinning up a new Virtual Machine with an Ubuntu Jammy vagrantfile, installing the game's files on that virtual host, and running the full SMARS stack - frontend, backend and database service - from the root of the VM (hereafter referred to as the 'Docker Host'). Replicating the development environment on the Docker Host VM - sans containers at this point - will allow us to practice the steps for deploying SMARS on a machine other than the one it was created on, before going any further.

Once the game's full stack has been deployed successfully on the Docker Host machine, the second phase of this chapter will be to run a Docker container for each service in the stack (frontend, backend, mongo db) by spinning up the latest Docker Mongo image, and then running two blank Ubuntu containers in terminal mode (visiting them in separate Powershell sessions) and provisioning them with the game's code, npm packages, and custom environment values files (not included in source control for... reasons!). The chapter will be complete when the user can launch a game from the hosting laptop's internet browser, and play the game entirely on Docker-hosted containers.

Exit Criteria:

- [DONE] Server test endpoint can be accessed via a web browser at localhost:8080
- [DONE] Server (backend) runs in a Docker container
- [DONE] Frontend runs in another Docker container
- [DONE] MongoDB docker image is used as a third container (although it is the first to be mounted)
- [DONE] All three containers run on the Docker host as their own independent stack
- [DONE] The Docker-hosted game is playable in the host's browser on port 2345, with all features working properly
- [DONE] All `docker run` commands and .env file contents are recorded, for reference to help create the project's Dockerfiles
- [DONE] All commands used on the Frontend and Backend containers are recorded in text files, for reference to help create the project's Dockerfiles

1. Create a new Virtual machine for the SMARS project, with a fresh Vagrantfile using the Ubuntu-jammy OS in its own folder in the VirtualMachines directory. This machine will be the SMARS Development Docker Host. Adjust its Vagrant file to map port 8080 on the host machine (i.e. your laptop) to port 7000 on the Docker Host, and map port 2345 on the host machine to port 1234 on the Docker host. Then boot up a virtual box machine with `vagrant up`.

2. On the Dev Docker Host VM, install the following programs with the apt-get installation method (visiting the individual services' websites for installation instructions in the case of docker, mongodb):

- docker
- git
- npm
- mongodb

3. Start the mongodb service and ensure it is running.

4. Clone the SMARS git repo into a folder on the Docker Host, and install only the backend's packages.

5. In the root of the backend directory, create a .env file with the line PORT=7000.

6. Next, start the backend server and see if it is accessible from port 8080 on your laptop.

7. Now, in a second Powershell terminal, login to the Docker Host a second time, and this time go into the frontend directory, and install its packages. Although it will present you with a warning that several packages have high/critical vulnerabilities, ignore that for now, as attempting to fix them will break the parcel server's ability to build the game.

8. Then run the frontend using the `npm run start` command, and see if it is accessible from port 2345 on your laptop.

9. On the current development branch, add a new function called validateDB, that the server will call just once when it boots up. Validate that this function is called, just once, with a console log declaring that the function has just run.

10. Next, make this function call the Mongo Database, and print a success message to the console if it is able to start a client session (and close it) with the database. If the database is not found, have it print an error message to the console instead. Addendum: should it also close down the server? A worthy question, but for now we will just have a warning message, since exiting the program cleanly with an unresolved promise (from the async await function) is more trouble than it's worth right now.

11. Next, instead of just checking that the database service is running, have the validateDB function check how many maps there are in the database. If there are at least 3 maps in the database return a message saying the database has been populated, otherwise print that the database needs to be populated.

12. Using async/await, have the validateDB function check the modules and connectors collections too, and log a message if either of them is empty.

13. Add a new asynchronous function, seedDB, which will console log a simple message saying 'seeding such-and-such collection.' Have this function get called by the validateDB function for any collection that is empty.

14. Update the backend's .env file to include new lines for: ENVIRONMENT=dev and DB_NAME=smars_test. Then, plug the DB_NAME variable into the validateDB function so you can work on the test database for the remainder of this chapter's development without worrying about corrupting the game's normal database.

15. Update the validate_database module to import the dotenv package to read the new environment variables, and then test that they work by adding a new file to the maps collection in the smars_test database.

16. Now delete the smars_test database and see what happens when the server is booted up. If it detects that the smars_test db doesn't exist, what does it do? Addendum: Not only does it not crash, but if you want to then run some functions that seed the database, it will create the db as well as any collections you refer to that don't yet exist, no problemo. Excellent!

17. Write a new file called databaseSeed.json which will contain all of the game's initial maps, modules and connectors. Attempt to read this file's contents in the validateDB function.

18. Update the backend's tsconfig file to allow it to load JSON files by uncommenting the line "resolveJsonModule": true.

19. Next, import the seed data into the validateDB function, and give it a try on the old console log, just to be sure we read it alright.

20. For each collection being checked (maps, modules and connectors), if the collection is not found/empty, call the seedDB function and tell it add the items from that section of the seed data file to the empty collection in the database. Reboot the server after running this once to verify that the files are in place when the server is booted up a second time. Then wipe the test database and run through this workflow again just to be super sure it's working. Then commit and push to Github, still on the development branch...

21. Next, go back to the version of the game server that's running on our putative Docker Host machine, and shut it down. Then use the git service on the virtual machine to checkout this game's development branch, to get the new server/database code that we just pushed to gitHub.

22. Then, update the .env file on the Docker Host to include the ENVIRONMENT and DB_NAME values. This time though, use 'smars' as the DB_NAME, since this is the value all of the server modules are expecting right now.

23. Finally, boot up the game's server again on the Docker Host and check that it has populated the database and can now RUN A NEW GAME! If so, it's time to get Dockerizing!!!

24. On the Docker Host, stop the frontend and backend servers, and then download the latest docker image for mongodb.

25. Run the mongodb container, in detached mode, with its port 27017 mapped to that same port on the Docker host (you will need to deactivate the mongodb service running on the Docker host first, to free up port 27017) and its /data/db internal volume (from the container, that is) mapped to the location /var/lib/docker/volumes/mongo (a directory you may or may not need to create yourself), and name it 'db' with the following command:

`docker run --mount type=bind,source=/var/lib/docker/volumes/mongo,target=/data/db -d --name=db -p 27017:27017 mongo`

26. Validate that the database is working and accessible by mounting the (non-containerized) SMARS server and have it communicate with the database (which is in a container).

27. Next, validate that the containerized DB's data persists by stopping and deleting the mongo container, and then booting up another one, followed by restarting the server. If the data is persisted, the server should pick up the maps, modules and connectors that it loaded to the previous database container instance, without having to seed them again.

28. Once database validation is completed, start working on containerizing the backend. Don't worry about the weight of the images for now, we can always streamline that later. For now, start with the Ubuntu Kinetic image that's already downloaded on the Docker Host, and boot it up with the Docker Host's /smars/backend directory mapped to a directory on the Ubuntu container, if that's possible. If not we can just get git on the container for this first pass, and then use the COPY command when we make the backend's Dockerfile, which is pretty much one step after the next one. Make certain to boot up the container with the correct PORT MAPPING: We want the container's port 7000 to be mapped to port 8080 on the Docker Host (-p 8080:7000).

29. Once the SMARS backend's code has been copied onto the Ubuntu Kinetic container, install its node modules with npm, add a .env file which tells the server to listen on PORT=7000, and has the DB_NAME=smars and ENVIROMENT=dev configuration, and then spin up the server.

30. In the local dev environment (your laptop) add another environment variable to the .env file, called DB_IP_ADDRESS, and set its value to localhost (or for fancy bonus points, make it equal to 127.0.0.1 - localhost's technical address).

31. Then, in all of the backend's server functions that call the DB, replace the localhost part of the Mongo host's URL with the environment variable DB_IP_ADDRESS, so that your server will be able to send its DB traffic to other IP addresses when mounted on a different environment. This might be unnecessary depending on how the Dockerization process manages inter-container traffic (i.e. you probably won't need to manually point your backend container to the DB's address once we're using Dockerfiles) but it's a useful intermediary step and will maybe teach us more about how IP addresses work... or something.

32. Do the same thing with the frontend's constants file - add a .env variable at the root of the frontend's directory (by hand) with a single value: SERVER_IP=127.0.0.1 (for your workstation AKA laptop), and then read that in the constants file for the URL_PREFIX value, so that the containerized version of the frontend can be run in a pseudo-containerized environment (i.e. with shifting IP addresses for the apps' different services).

33. Now, in a new Powershell terminal, spin up another container with the Ubuntu Kinetic image, and this time put the frontend's code on it, using the same techniques as for the previous image (once we Dockerize this it will be much more efficient). Make sure to map port 1234 to port 1234, since the Docker Host machine listens to its port 2345 but sends that to its internal port 1234. Proceed to install Git, NPM, and then the node modules after checking out the BRANCH of the GitHub repo. Don't forget the .env file which will have the values ENVIRONMENT="Dev", SERVER_URL="172.17.0.3" (the backend container's URL, as seen with the `docker inspect backend` command), SERVER_PORT="8080" (the docker host's port that is mapped to the backend container... that's how this works, right?).

34. Run the Frontend container and then attempt to visit it in the browser on the host host machine (your PC). Fix any configuration issues that are encountered and take note of them, and the set of steps that finally leads to a fully functioning stack. The next step will be to write them into a list, which will then become the project's first Dockerfiles.

35. Back on the development workstation (your PC) update the remainder of the server functions to use the DB_NAME environment variable so that they're harmonized to point to the same database (and also add the default value so that if there is no environment variable then they all point to that value instead).

36. In your original dev environment's .env file, reset the DB_NAME to 'smars' to regain access to your old development data.

37. Once you've ensured your workstation's development environment is fully back to normal, do any last pushes to GitHub and then merge this branch into the master branch, and get ready to start automating all of the steps you've just done.

## Chapter Two: The Dockerfiles

### Difficulty Estimate: 4 for pioneering new technology but with decent preparation and theoretical knowledge

### Date: March 5, 2023

Now that the game has been made to run on some hand-made Docker containers, it's time to script the generation of those containers and create the project's first Docker Images. In this chapter, we will create the Docker files for the frontend and backend applications, and then use the images produced by said Dockerfiles to mount the application's containers. The chapter will be complete when the application is running on a set of containers that use images generated by the project's Dockerfiles. We will develop ways of updating the images when the game's source code is updated in a future chapter dedicated to Continuous Improvement.

Exit Criteria:

- [DONE] The game's server/backend runs in a container generated by a Dockerfile
- [DONE] The game's frontend runs in a container generated by a Dockerfile
- [DONE] When run with a mongo db container (generated with a `docker run` command), the game functions normally
- [DONE] The backend container must be able to communicate with the database container
- [DONE] The frontend container must be able to communicate with the backend container
- [DONE] All `docker run` commands are documented, here and on paper, as they were with deployment chapter one

### Docker Run Commands:

- Frontend: `docker run -d --name=frontend -p 1234:1234 frontend`

- Backend: `docker run -d --name=backend -p 7000:7000 backend`

- Database: `docker run --mount type=bind,source=/var/lib/docker/volumes/mongo,target=/data/db -d --name=db -p 27017:27017 mongo`

### Docker Host Vagrantfile port mapping:

- Guest: 7000, Host: 8080

- Guest: 1234, Host: 2345

1. Make a Dockerfile for the backend, that installs the necessary packages and so forth on the Ubuntu OS, and then runs an instance of the server.

2. Verify the backend's Dockerfile by running the `docker build` command on it, then doing a `docker run` on the resulting image, and finally visiting its API test endpoint in a web browser.

3. Spin up a container with a mongodb image, mapped to the mongo storage location on the Docker Host like we did for the previous chapter.

4. If necessary, alter the backend container by entering it (using `docker attach` to reach its terminal) and updating its environment variables to point to the mongodb container.

5. Make a Dockerfile for the frontend, that installs the necessary packages and so forth on the Ubuntu OS, and then runs the game's Parcel development server (we can try to optimize the images that are built for both the front and back ends of the app in a later chapter).

6. Copy the Docker files for both the front and back end into the this development branch, and commit and push them to the main repo.

7. Record, here and on paper, the `docker run` commands for all three containers, (frontend, backend and DB) that were used to create the stack for this chapter (you may record them in the space immediately below the chapter's Exit Criteria).

## Chapter Three: Docker Compose Yourself!

### Difficulty Estimate: 4 for pioneering new technology and workflow, basic theoretical knowledge notwithstanding

### Date: March 25, 2023

Now that the game's first Dockerfiles have been produced, we can perform the final pre-deployment work: the creation of the docker-compose file that will deploy the game's full stack with a single command. From the preliminary readings of the Docker compose literature, we might have to slightly modify our use of environment variables to point the various services towards one another, although it appears that the general principle of doing things that way (i.e. with env variables) is fundamentally solid. Updating the specific way this is done to accomodate the docker compose workflow will undoubtedly strengthen the game's stack, and make it readier for deployment. Once the full stack is running with this new architecture in place, we will be ready to put this bad boy on the web!!!

Exit Criteria:

- Docker-compose file allows the game's stack to be deployed on the Virtual machine with one command
- Game is fully playable with resources created by the Docker-compose command
- Game data persists between multiple runs of docker compose up/down

1. Create a new docker-compose file at the root of the project's directory. Use version 3 of docker compose, and create a single 'network' for the project's three services. Create this file in your Windows development environment, and use the git push/pull flow to get it to your VM instance. Run it from there with `docker compose up`.

2. Adjust the environment variable used by the backend to set the IP address for calls to the MongoDB container. Change it to be called DB_CONTAINER_NAME instead, and then instead of giving the DB's numeric IP address, use its alias from the Dockerfile - in this case, db.

3. Push this update to the VM and rebuild the backend's image there. Then try running the docker compose command again and see what happens. Addendum: Success! Connecting the backend to the database actually made the whole stack run, since the frontend is actually being directed to the backend through the host machine's localhost (i.e. via the exposed port on the hosting PC).

4. Since the arrangement that was garbledly described in the previous step technically makes the game playable, we should prefer that the frontend communicates with the backend through the same internal (docker compose created) network that the backend uses to speak with the db. Update the frontend Dockerfile's SERVER_URL value to be called SERVER_NAME, and change the value from the number sequence to 'backend,' to match the name of the backend container in the docker-compose file. ADDENDUM: Apparently we actually lucked out with the initial configuration used for the above step; localhost is in fact the correct name to use in the frontend's URL prefix variable, not 'backend.' Found that out the hard way, oh yessir.

5. Don't forget to also change the names of the environment variables in the local .env files in the game's original development environment (your laptop).

6. Update the port number that the frontend's Dockerfile uses to contact the server, from 8080 to 7000 (since they're in the same network now the frontend can signal the backend directly).

## Chapter Four: Deployment on AWS (Staging Environment)

### Difficulty Estimate: 5 for the final hurdles, armed though we are with a nice docker-compose file

### Date: March 26, 2023

Now that all of the Docker resources have been produced, the time has come to attempt to mount this thing on the internet! The first deployment attempt will be a very temporary thing in all likelihood, as it is primarily a proof-of-concept exercise. This chapter's main focus will simply be on achieving that milestone, and accessing the game from an internet browser. Other steps that are likely to be needed are: setting up a repo on Dockerhub / Amazon ECR to store the game's images, and setting up the AWS CLI on the development workstation's VM. The initial deployment environment will be called 'Staging,' since this is a pre-production deployment test operation. After the first deployment is confirmed we will turn towards optimizing the game's images, and then automating the development/deployment workflow, to prepare for a permanent Production environment release, which will take place a few chapters hence...

Exit Criteria:

- [DONE] While the deployment is active, the game is accessible at a given URL
- [DONE] The game can be visited at this URL from several different devices
- [DONE] The game's containers can be stopped, and then redeployed reliably in the cloud environment
- [DONE] AWS setup/deployment operations are documented to support future automation efforts

Not doing (but keeping in mind for future chapters):

- Long-term data persistence
- Docker container communication troubleshooting
- HTTPS support/security considerations
- Docker image weight optimization (he ain't heavy, he's my server)
- AWS metrics (cost optimization, usage stats, etc.)
- IAM roles/permissions management (actually did end up doing a bit of that)
- Infrastructure as code (Terraform)

Steps used to launch the SMARS stack on the web:

1. Make and/or log in to your root account in AWS.

2. Create an administrative user account using the AWS Identity Management Console; use this account for all subsequent actions, as they are beneath the dignity of being done by the root account.

3. Create a key pair, and save it to your local computer as a .ppk file.

4. In the AWS EC2 console, create a security group with the following inbound traffic rules:

- Allow all inbound HTTP traffic on port 80
- Allow all inbound HTTPS traffic on port 443
- Allow inbound SSH traffic only from your computer's IP address
- Allow inbound TCP traffic on port 7000

5. Spin up an EC2 instance with the following properties:

- Ubuntu 22.04 Jammy OS
- t2.Small EC2 profile
- 1 x 8GB root volume
- use the key pair created in step 3
- attach to the security group created in step 4

6. Open a Putty terminal session and configure it with your .ppk key from step 3. See https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/putty.html for a walkthrough of how to set this up.

7. Log in to your EC2 instance via the Putty terminal as the root user.

8. Install Docker and its sub-components on the EC2, following the steps described here: https://docs.docker.com/engine/install/ubuntu/

9. Check that you have git installed, just to be sure. Install it if it's missing.

10. Create a folder at the location /usr/smars, and checkout the master branch of the smars git repo ( https://github.com/dan-atack/SMARS.git ) in that location.

11. Go to the frontend's Dockerfile, and change its SERVER_NAME ENV variable to the EC2's public IPv4 address (e.g. 3.14.149.201 ).

12. From the root of the smars directory, run `docker compose up` to bring up the stack.

13. Once the stack reports that it is up and running, try visiting the public IP address of the EC2 in a browser. Make sure the URL address doesn't have an 'https' prefix, as many browsers initially won't take you to a regular 'http' address anymore unless you specify it. The full IP address to reach the game would thus be along the lines of http://3.14.149.201/ at least until we get some SSL certificates up in here!

## Chapter Five: A Place on the Web - Adding an Elastic IP and Domain Name to the AWS Instance

### Difficulty Estimate: 5 for new tech to be added to the stack, plus the 'difficulty' of having to pay more money to host a domain name!

### Date: May 5, 2023

Having made a first successful deployment on the web, it is now time to make SMARS' online presence more respectable, before announcing its existence to the general public. The first step towards this goal will be to anchor SMARS' address in place, so that would-be players can be easily guided to the game. Currently the game is hosted on an IPv4 address generated by Amazon, but it is not stable: whenever the EC2 instance hosting the game is shut down (let alone terminated) its IP address changes, making it very inconvenient for would-be users to actually find it! To solve this problem, and to give it a human-readable URL address, we will need to first attach an AWS Elastic IP address to the EC2 instance, and then register a domain name for the site, using AWS' Route 53 DNS service. This chapter will be complete when the game can be visited by going to the (human-readable) domain name in a web browser, and the player can load a saved game file through multiple restarts of the EC2 instance without needing to change the URL address each time.

Exit Criteria:

- [DONE] SMARS staging instance can be reached by going to the domain name registered with AWS Route 53: freesmars.com
- [DONE] Restarting the staging instance multiple times does not affect the game's URL address
- [DONE] The game is accessible without requiring any manual intervention on the EC2 instance, other than running 'docker compose up'

1. Shut down the SMARS_Staging_01 EC2 instance to save money, and to allow it to be attached to an Elastic IP address.

2. Get ('allocate') an elastic IP address from AWS, using the AWS console as smars-admin user, following the instructions on this page: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html#using-instance-addressing-eips-allocating

3. Associate the new Elastic IP to the SMARS_Staging_01 instance, for both its public and private IP addresses, following the instructions on this page: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html#using-instance-addressing-eips-associating

4. Start up the Staging instance, and update the frontend's Dockerfile to point to the Elastic IP address. Validate that the game runs as expected when visting that address.

5. Stop, and then start the instance, and attempt to login via PuTTY without changing its IP address.

6. From the PuTTY terminal, run `docker compose up` without re-creating the frontend's Docker image, and see if the game is playable from the same IP address as the one used previously.

7. When finished testing, drop the Elastic IP address until it is needed again, to save on costs. Follow the instructions on these pages to disassociate, and then release (drop) your elastic IP: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html#using-instance-addressing-eips-associating-different https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html#using-instance-addressing-eips-releasing

8. Document the procedure for acquiring a new Elastic IP and associating it to an instance in the space below:

- First, to avoid unexpected behavior, stop your EC2 instance before beginning this process
- In the AWS EC2 console sidebar, under the Network & Security section, select 'Elastic IPs'
- In the upper right-hand corner, select 'Allocate Elastic IP address'
- Select the default option, which is to take an IPv4 address from Amazon's pool of IPv4 addresses
- Add a tag to identify your elastic IP, such as smars-staging-01 or something like that
- Hit the 'Allocate' button to get your Elastic IP
- Next, on the Elastic IP Addresses page, select your new Elastic IP, and under the 'Actions' dropdown menu, select 'Associate Elastic IP address'
- Select the resource type (Instance) and then give the ID and Private IP Address of the instance you're associating to (in this case, the SMARS_Staging_01 EC2) from the dropdown list of options
- Hit the 'Associate' button when you're done
- Next, update the public IPv4 DNS used by your PuTTY terminal to reach the instance, then SSH into the terminal
- Update the frontend's Dockerfile to use the Elastic IP address
- If necessary, delete the docker container AND the docker image for the frontend, to clear out any previous IP address that was in use
- Run `docker compose up` to create a new frontend image with the elastic IP, and boot up the stack
- Visit the new IP address in your web browser
- You should now be able to turn your instance off and on again and no longer need to update its address either in the browser or for your PuTTY session (although for the moment you will still need to log into the PuTTY shell to run the docker compose command... more on that later!)

9. Register SMARS's domain name with AWS Route 53. Unfortunately, 'smars.com' was already taken by some corporatist fat cat obstructionist, but we got 'freesmars.com' which is kind of better in a way - as in, "Quaaaaiiid... Start the reactor. Free SMARS!!!" The documentation for setting up a domain with Route 53 can be found at https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html although hopefully we won't need to reproduce this, since we now own freesmars.com until at least May of 2025!

10. Next, create a record, which is a type of data object that contains information about how to resolve traffic to a domain. Essentially, in our case (which is very simple) we want to tell the DNS to route all traffic to freesmars.com to the (static, elastic) IP of the SMARS_Staging_01 server. See https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/rrsets-working-with.html and https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-creating.html for more information on how this was done.

11. Document the procedure for creating a new record for the freesmars.com domain:

- First, follow the instructions laid out in step 8 to create an elastic IP and launch the server
- In the AWS Route 53 console sidebar, go to the 'Hosted Zones' page
- Select the freesmars.com zone by clicking on the 'freesmars.com' URL link (as opposed to selecting this zone with the radio button)
- Hit the 'Create record' button
- Leave the 'Record name' field blank, so that users simply enter the domain name to visit the game (e.g. http://freesmars.com)
- For the Record Type, select "A - Routes traffic to an IPv4 address and some AWS resources"
- For 'value,' enter the elastic IPv4 address you assigned to the server
- If you're planning on making more changes in the near future, leave the 'TTL' value as a low number; if you're making this record for a production server which you expect to remain up for a long time, you can choose a larger value, as this represents the length of time that DNS servers should cache info about this record. Using a larger value basically means that you're confident that the IP address won't change any time soon, and this apparently helps to reduce costs since there are less calls to the DNS recursive servers that act as an interchange between a DNS resolver and the name servers which map your domain name to the IP address of the machine hosting the game.

12. Document the procedure for updating the record for the freesmars.com domain in case the elastic IP address for our server changes:

- First, follow the instructions laid out in step 8 to update the elastic IP and re-launch the server
- In the AWS Route 53 console sidebar, go to the 'Hosted Zones' page
- Select the freesmars.com zone by clicking on the 'freesmars.com' URL link (as opposed to selecting this zone with the radio button)
- Select the record of type A (which refers to a record that points to an AWS resource, in this case the staging server)
- Select 'edit record'
- In the 'value' field, replace the IP address with your new elastic IP
- Hit the 'save' button
- Wait for the Record to update successfully, then visit freesmars.com in the browser to verify that it's able to direct you to the new IP address for the EC2 instance (you should see the login page, in other words)

13. Lastly, shut down the server and drop the elastic IP once again to reduce costs during the staging/prototyping operations phase (once we have resolved a few more deployment issues we'll launch a 'production' server that will remain up permanently).

## Chapter Six: TLS Certificates - Putting the 'S' in HTTPS!

### Difficulty Estimate: 8 for wholly new technology (OpenSSL, Certbot, and advanced Express modules for HTTPS) as well as uncertainty about what is required vis-a-vis the frontend server

### Date: May 7, 2023

The next major hurdle in presenting a respectable web application to the general public will be adding encryption to the server, so that visitors to the site can see a nice, safe 'https' URL prefix when they visit the site. Also because it's safer, of course. Ideally, we would also like to have users' internet browsers view the site without suspicion, so it will eventually be necessary to get a third party Certificate Authority to validate the SSL/TLS certificates that will be used to provide encryption. Since this is somewhat uncharted territory we will attempt to take a gradual approach, by first setting up a free self-signed certificate using OpenSSL, to get the basic 'https' and then once that is successful, proceed to get the certificate signed by a 3rd party authority, to grant legitimacy to freesmars.com!

Quick addendum: Since certificate technology is very tricky and making any progress at all is not a guarantee, and since the full implementation of this initiative (i.e. to have the game be playable at an https URL address) will indeed require the use of the "built" frontend code, the chapter was ended early and bisected in order to keep things relatively neat and tidy. We have the HTTPS capability, but the frontend now needs to be re-engineered, which is technologically an entirely different issue.

Exit Criteria:

- The game's backend can be secured with HTTPS when in a 'staging' or 'production' environment
- Backend API functionality can be tested in a browser with no warnings or suspicion on HTTPS URL address

1. Since this will be a highly experimental endeavour, the first thing to do will be to fire up the Ubuntu virtual machine on the home computer and rig that up with OpenSSL to make a prototype. Addendum: Most modern Ubuntu distributions already include a version of OpenSSL - it's like they were expecting us to want to build web servers!

2. Next, use OpenSSL it to generate a key, a CSR (Certificate Signing Request), and a certificate file, in a new directory called 'certificates' which is created at the root of the smars repo:

Create key: `openssl genrsa -out key.pem`
Create Certificate Signing Request: `openssl req -new -key key.pem -out csr.pem`
Create self-signed certificate: `openssl x509 -req -days 999 -in csr.pem -signkey key.pem -out cert.pem`

3. Next, delete the Docker container and Dockerfile for the backend, if they exist.

4. Open a development branch for this chapter on the main computer and use Visual Studio to update the backend's index.ts file code to import https and create an https server ONLY IF the environment is not 'Dev.' Have this HTTPS server listen on Port 443 if it is created, and have it incorporate the server called 'app' by passing that to the HTTPS server as an argument at its creation. This code will be used in the local prototype build on the Virtualbox Docker Host machine.

5. Update the docker-compose file for the backend service to map the volume ./certificates on the Docker host to the location /usr/src/app/certificates on the backend container, so that the container can access the certificates that are created on the Docker Host machine (initially the Virtualbox VM but eventually the EC2 instance). The whole line looks like this: './certificates:/usr/src/app/certificates'

6. Update the Frontend's Dockerfile to add an additional ENV variable: HTTPS_PORT, which will be set to 443.

7. Next, update the Frontend's constants.ts file to import both the ENVIRONMENT and HTTPS_PORT variables, and then set the URL prefix constant to either HTTP (for the development environment only) or HTTPS for all non-development environments. When the HTTPS prefix is in effect, use the HTTPS port variable as well.

8. Test this in the Virtualbox test environment. If the frontend can connect to the (HTTPS secured) backend then we're on the right track!

9. Synchronize the files in the Virtualbox machine with the files in the main development environment and commit them to the official repo, so that there is no 'code drift' between environments. Also, standardize the use of the 'staging' environment in all of the project's Dockerfiles, as the original development environment (on your Windows laptop) does not use docker to run the game, and thus the 'dev' environment variable is never needed in a Docker file. This will save us from having to update that value in either of our other environments (the Virtualbox or the EC2).

10. Next, fire up the EC2 instance and run through the update procedure thus far to get a self-signed certificate working for the backend container:

- Acquire new elastic IP address
- Bind elastic IP to EC2 instance
- Bind smars domain name to elastic IP
- Start the EC2 instance and log in
- Pull updated code from this branch
- Create 'certificates' folder at root of smars repo and create the key, csr and certificate files within
- Run `docker compose up`
- Visit site in the browser to verify that it's still working; ADDENDUM: If not, switch the environment for both containers back to 'dev' and try again
- When finished, decommission server and release the elastic IP

11. Final part of phase one of this exercise: Since the browser refuses to cooperate with an unsigned certificate (self-signed counts for nothing on the big bad interwebs), try using the Certbot procedure to get a certificate that's been signed by their LetsEncrypt authority, and see if that helps with the security warnings currently blocking progress with the self-signed certificates we got with OpenSSL. The certificates and key files created by certbot are inside the /etc/letsencrypt/archive/freesmars.com file on the Docker HOST machine, and their names are different from the ones we created with OpenSSL, so update the backend's index.ts to use the file names for that directory (privkey1 for the key and fullchain1 for the certificate).

12. Update the frontend's ENV value for SERVER_NAME for the last time. It's name is freesmars.com. Get your ass to Smars.

13. It turns out that by enabling HTTPS for a domain name is very confusing to the browser if you want to also use if for HTTP requests, as the browser decides to only associate that domain name with HTTPS and in any case sends all traffic to it to your (backend) server port, 443, rendering the frontend inaccessible. A high price for security, you might say, but undoubtedly a fair one. To get around this, we'll need to dedicate a new chapter to the task of converting the frontend's 'build' output code into some sort of public folder, and then hosting that with an Express server of its own, as a prelude to hosting it under the HTTPS umbrella that currently only extends to the backend's API.

## Chapter Seven: Building the Frontend - Using an Express Server to Host the Built Code from Parcel

### Difficulty Estimate: 7 for a somewhat dreaded reckoning with the intricacies of using P5, and integrating the dist folder to work without the Parcel server as an Express App - Addendum: Turns out it was super easy, barely an inconvenience!

### Date: May 14, 2023

Since it has now been demonstrated that it is possible to secure the game's server, the only thing that remains to do is to include the game's frontend under that same security umbrella. Since the frontend currently runs on an insecure Parcel development server, there is no way of integrating a TLS/SSL certificate to run with it in that configuration. To provide a fully secure experience, not to mention a much more efficient package for deployment, the time has come to clean up the frontend, and actually use the build output code and host that without the aid of the Parcel development server. The theory here is that if the frontend truly is, in essence, a static webpage that just runs the p5 code and communicates with the backend's API, then it could be served up by an Express server. If this is possible, then in fact the best course of action would be to package it with the backend when producing Docker images for the game, since the backend already runs on an Express server! Essentially this would entail taking the output of the parcel build, and then importing it into the backend server and hosting it directly from there, as the server's public folder. This chapter will be complete when the game can be played in the local development environment, with the frontend files served by the backend's Express app.

Exit Criteria:

- [DONE] The frontend application runs on its own Express server, instead of being hosted by the Parcel dev server
- [DONE] The game can can be played at http://localhost:7000, with only a single terminal running the backend server

1. Create a new folder, STAGE, at the root of the project's directory, and add it to gitignore.

2. Inside STAGE, do a git init and create an Express app.

3. Look on the internet or in your files to see an example of a very basic setup for an Express app that serves a single-page website from a public folder, then replicate and run that.

4. Copy all of the files from the frontend's dist folder into the STAGE app's public directory, to see what happens if we just try running the Express server with everything dumped in there.

5. It appears that the 'dist' folder contents really are it, and the basic STAGE server was able to show the game's login page. Unfortunately, it was not possible to progress further in the game as the backend refused to respond to the frontend's requests to its API, possibly because it has a security policy that blocks requests from its own IP address under certain circumstances. So the solution now will be to attempt to mount the whole game from the backend server, by copying over its public folder and then adding the static folder to the server's index.ts file, simply by adding these two lines:

const publicPath = path.join(\_\_dirname, '../public'); // Since this file is in /src, which is one level above the project's root

app.use(express.static(publicPath));

6. It works!!! Now that this has been validated in Development, we must replicate the effort on the EC2 server, which will form the first phase of the next chapter...

## Chapter Eight: Securing the Frontend - Staging Deployment of the Full Game With HTTPS

### Difficulty Estimate: 5 for Rewriting the project's Docker and compose files to work without a frontend container!

### Date: May 17, 2023

In a rare, pleasant surprise, the `parcel build` output really provided everything that I could have hoped for, and the frontend ran like a dream with the existing backend server. Hardly even had to add any code changes to the old girl. So, for a followup, let's now attempt to put the whole application on the EC2 site, and finally play the game at https://freesmars.com! Initially it will be necessary to use a somewhat unorthodox method to build the frontend's code on the cloud in order to package it with the backend, since the Dockerhost itself is very low on available filespace, and it doesn't have Parcel installed. This means we'll need to modify the frontend's Dockerfile to run the `npm run build` command on entry instead of starting the development server, then mapping the files from the 'dist' folder to a volume on the EC2 (host) machine. From there, it should be possible to use the code developed in the previous chapter to run the whole game in HTTPS in the browser. Since this process is quite convoluted, it will need to be documented in at least slightly greater detail below, once a successful strategy has been devised.

Exit Criteria:

- [DONE] The game can can be played at https://freesmars.com rather than http://freesmars.com
- [DONE] The game can be visited in a web browser without receiving any warnings about the site being suspicious in any way
- [DONE] Full frontend build / integration with backend / final backend image creation process is thoroughly documented
- [STRETCH] [DONE] New versions of the game's backend image (now the game's only image) are built automatically with a multi-stage Dockerfile

1. Fire up the EC2, connect static IP, Route 53, etc... how can you not wait to automate all of this, by the way?!

2. SSH in to the EC2, and delete the containers and images for the frontend and backend.

3. Alter the frontend's Dockerfile to run the build command instead of the start command for the Parcel server. This will cause the image to produce the html/css files for the Smars static homepage, and then stop running.

4. Next, alter the docker-compose file to create a bind-mount that maps the frontend to a location on the host file system. A bind mount is similar to a regular volume except that it allows the Docker container to create files on the host system OUTSIDE of the docker zone (e.g /srv/frontend - a directory we will need to create, by the way). In hindsight, we could have actually just mapped the frontend files directly into the /smars/backend/public directory and saved the trouble of having to copy them over with an additional command... but we're not going to be keeping this workflow for long so it's not a big deal either way.

5. Run `docker compose up` to bring the stack to life, and generate the frontend files. If successful, the frontend container will stop after the build job completes, leaving only the backend and the database containers running. In any case, we will shut down the entire stack since the backend's image will now need to be rebuilt once we add the frontend files to the public folder on the host machine.

6. Once the stack has been shut down again, delete both frontend and backend containers and images, then copy the frontend's files into the backend's public directory, and then comment out the entire frontend service in the docker-compose file - it has served its purpose and is no longer needed for deploying the game!

7. Rerun `docker compose up` to rebuild the backend's image, which will now contain the frontend's files in the public directory.

8. Try reaching the game at https://freesmars.com - if you are able to reach the frontend that's the first milestone. If you can also successfully log in and play the game (addendum: you can!!!) then that's a wrap for the experimental/tinkering portion of this chapter. Hurray!!!

9. Next, it's time to start automating some of the assembly process for creating these images, so that we can reduce the massive number of manual steps required for a theoretical update to the game in production. Let's attempt to do this by updating the source code in development to remove the frontend from the docker-compose file, and pushing that to the production environment and trying to build the game's images on the EC2. In a subsequent chapter we can look into building the images somewhere else and pulling them to the EC2 so that it can be as streamlined as possible.

10. Now the time has come to experiment with the game's first multi-stage build, which will combine the frontend and backend into a single image without requiring all of the manual steps described above. Or at least not so many of them. Since it will be the backend's Dockerfile that ultimately produces this image, this is where we will start our modifications. The goal of this effort will be to verify that we can modify the frontend code and then integrate that into the deployed version of the game by simply stopping the docker stack, rebuilding the backend image, and re-launching the application. No fussing about with copying and pasting files or manually running the frontend container just to get its build files.

11. After a significant amount of fussing around with the mult-stage Dockerfile we've finally got something that works - a Dockerfile at the root of the project which combines the package installation, environment variable settings and finally the build command for the frontend into a first stage, followed by a new stage which runs through the steps in the backend's Dockerfile, and then adds the contents of the frontend build's 'dist' folder to the backend's public directory before launching the backend. It should be noted that the backend still runs with the 'dev' command, and thus still has all of its development dependencies installed, making it an unnecessarily fat image, but hey one step at a time.

12. In order to do all of this building it was necessary to learn some handy commands to clear out the Docker cache, as there were a ton of old images/layers built up, eventually to the point that they were impeding further development on the EC2 (which only has a very limited amount of space in its filesystem). The following commands can be used to clear out some much needed space:

- docker image prune -a -f (the -A means 'all' i.e. it includes unused layers; the -f is to 'force' it meaning do not ask for confirmation, do not implore for forgiveness)

- docker builder prune (removes the entire build cache)

(Eventually of course the solution will be to stop building on the EC2 host at all, and to use an image that is as streamlined as possible for the backend component, as we have now done for the frontend, whose size has effectively gone from over 1 GB to just a few dozen MB).

13. Finally, validate that the build process works by adding a trivial change to the frontend's source code and then rebuilding and testing the deployment on the cloud. Note any manual steps still required to implement an update in this way:

- Pull updated source code from git remote repo
- Delete existing smars-backend container
- Delete smars-backend image <--- NOTE: Since there is no longer a frontend container/image in the stack, should we rename this to smars-server?
- Run `docker compose up`

14. Clean up the repo: Delete the frontend and backend Dockerfiles, and update the docker-compose file to eliminate the commented-out code for the no-longer-used frontend service.

## Chapter Nine: Terraform Initiated - Using Infrastructure As Code to Prepare the Production Environment

### Difficulty Estimate: 7 for using unfamiliar technology (we have used Terraform before but not very much, and never in the driver's seat)

### Date: May 20, 2023

Although the infrastructure for SMARS's online presence is only fledgling, the time has come to put it in code so that it can be reliably reproduced, maintained and when needed, destroyed. Terraform has been chosen as the Infrastructure-as-Code (IaC) framework that will be used for this endeavour, as I already have some limited experience using it. Since the creation of the staging server gave the opportunity to prototype the architecture that will be needed, now we can focus on replicating this setup using Terraform to generate the necessary resources on AWS. Once this is accomplished it will be much easier to deploy the app, maintain availability during updates, recover from crashes should they occur, and dismantle unnecessary infrastructure to control costs. It will also make it easier to prototype new additions to the cloud's infrastructure and keep a history of all of the changes that are made over the course of time. This chapter will be complete when we can use Terraform to launch an EC2 within a 'production' security group, attached to a static IP address / DNS record, install the project's Docker images and Docker engine on the machine that is produce in this way. Additional objectives to be researched include SSL/TLS certificate installation, and getting the projects images (now for the backend only) from an ECR that may also be made with Terraform.

Exit Criteria:

- With the `terraform apply` command the following resources are made on the AWS cloud:
  - [DONE] Security group
  - [DONE] EC2 instance
  - [DONE] Elastic IP
  - [DONE] Elastic IP is connected to DNS address
  - [DONE] Docker images for SMARS installed on EC2
  - [DONE] Docker engine installed on EC2
  - [DONE] TLS/SSL certificates installed on EC2
  - [DONE] Game can be played at its URL address on infra deployed entirely by the `terraform apply` command
  - [DONE] [STRETCH] Game can be deployed to either a 'staging' or 'production' environment by launching the Terraform commands from separately labeled workspaces on the local development VM (each has distinct .env files to differentiate them)

1. Install the Terraform CLI on the game's virtual development machine, following the instructions found at https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli

2. Ensure the AWS CLI is also installed and available in this environment.

3. Create a new AWS root user access key to allow Terraform development from the CLI (they say you shouldn't do that, but as a one-man operating team I am authorizing it!).

4. Create a Terraform script, main.ts, that creates an EC2 instance called smars_prod_server with the same specs as the staging machine has. Plan, apply, verify, and then destroy.

5. We'll always need to be able to log into our instances, so find out how to attach a key-pair to the production server instance and verify that it works by logging in with PuTTY. NOTE: This may not be PuTTY's fault, as the new instance is likely going into the 'default' Security Group, which has no access rules enabled for port 22 (or any other ports for that matter - try adding the security group and then revisit this item).

6. Expand the Terraform script to create a Security Group for your production server, called SMARS-Prod-SG, again with the same settings as the staging server. Once again, plan, apply, verify and then destroy.

7. Add an elastic IP address to your TF script, and once again, plan, apply, verify and destroy.

8. Next, have Terraform create a DNS record to direct incoming traffic to the production server via its Elastic IP. As usual, plan, apply, verify and destroy. NOTE: for this to work properly you need to assign the EIP to the instance within its block, and then in the Route53_record resource, take the public_ip value from the EIP resource, NOT from the EC2 (otherwise you're liable to end up with a record that uses the EC2's original IP address, and not the EIP).

9. Modify the existing DNS record used by the staging server to route traffic from staging.freesmars.com instead of the from the root address, so we can reserve that URL for future staging deployments/tests... This will actually require the creation of a new certificate for the staging machine, since the existing one is strictly for freesmars.com, not staging.freesmars.com, so that will be a good opportunity to rehearse the steps needed to create a certificate.

10. Now for a slightly trickier bit: Add a script resource to your Terraform file (or possibly in its own file - we'll ask Chat GPT what's a best practice for this kind of thing) that installs the Docker Engine on the EC2 host once it's booted up. As before, plan, apply, verify, and then destroy. ADDENDUM: After a lot of trial and error, this was achieved by inserting a user_data block, which contains an inline bash script into the AWS instance resource definition.

11. Next, it's time to start thinking about getting the game's Docker images installed. Since we still have not developed a method for building the game's images elsewhere, and since we will be faithfully copying the deployment on the staging machine, for now the procedure should be to clone the project's git repository to the /smars directory, and run `docker compose up` to create the game's images and launch the stack (all of this should be done in the context of the EC2's startup script file). ADDENDUM: This method works, but it's critical to note that you mustn't SSH in to the instance for a good couple of minutes after Terraform declares it to be up and running, as it has to assemble the SMARS images via docker compose and if interrupted it will fail in a messy way that doesn't permit a simple re-run of the compose command. You must instead destroy the instance and then re-run the TF apply, and wait again (I'd say give it 10 minutes just to be really safe). After that you can SSH in and check that it's running with `docker ps` and both containers (DB and backend) should be there.

12. Finally, the last components we need to get this thing running are the certificate and key files. The way I see it there are two possible methods to get them on the server computer: Either we can add to the post-launch script (user_data) to install Certbot and use it in non-interactive mode to generate a new certificate, OR we can set about creating a permanent volume with EBS, create the certificates by hand, and then keep them on this volume, and ensure it's mapped to the correct location in the EC2's file system. We'll try the former approach first, and if it doesn't work we can try the latter. If this works, we should be able to visit the game and play it at freesmars.com, on our brand-new pre-production server!

13. Create a terraform variables file, and extract the values for environment, domain name, and zone ID (related to the domain) from the main.tf script, and set them with environment variables instead. Validate this works by setting a test environment variable in the VM workspace, and then launching a build that, within the user_data script, creates a file named after this variable, to ensure it was integrated successfully. Once done, extract all the above-mentioned variables and replace them with terraform variables, then create the values for each of these variables in the environment of the smars directory on the dev VM. Remember to prefix every variable's name from the variables.tf file with "TF_VAR" plus another underscore when defining the values in the local environment (e.g. the variable smars_environment is set by entering the command `export TF_VAR_smars_environment=staging`). Validate, plan, apply, verify and destroy.

14. Create a second SMARS directory on the local Dev VM, and call it smars_prod. In there, set all of the environment variables for the production environment. Rename the original smars directory smars_staging, and do the same with its environment variables.

15. List the environment variables and their options in the game's README file.

16. Create a pair of short shell scripts, startPlan and startDeploy, that can be used to export the variables from the local .env file to be used by Terraform, and then call the terraform init, validate and plan commands (for startPlan) and terraform init and apply for startDeploy. Test these in a pre-production environment and then destroy the result once satisfied.

17. Update the project's Dockerfile to also read the same environment variables introduced on step 13. Ensure that the environment variables are created in a .env file by the Terraform main script AFTER the git repo is cloned, but BEFORE the 'docker compose' command (duh). Also ensure that the environment variables are imported by each stage individually, using the ARG statement for each variable to be used (ENVIRONMENT and DOMAIN_NAME are needed by both the frontend and backend stages, and ARG statements are limited in their scope, hence the need to declare them twice). Again, verify by doing the standard plan, apply, verify and then hold off on the destroy, as we will keep the current stack for testing in the next chapter...

## Chapter Ten: Persistent Database Volume on the Cloud

### Difficulty Estimate: 5 for new technology (looking at AWS EBS for a first iteration)

### Date: June 6, 2023

Now that the game has fully reproducible infrastructure and can be deployed with minimal manual steps in either a Staging or Production environment, the time has come to investigate database volume persistence in the cloud environment. Preliminary investigation shows that it may be possible to detach the volume block from a stopped EC2 instance, and therefore it should be possible to transfer volume blocks from instance to instance (provided they are in the same availability zone). However, this is almost certainly not a recommended strategy for ensuring long-term database preservation and stability, and so a different method will be used in this chapter. The goal now will be to do a database 'dump' into an S3 bucket, and then attempt to manually re-mount a backed-up database file into a new container instance. The presence of manual steps is acceptable, at least for now, given that this is a form of 'disaster recovery' and should not be part of the normal development workflow. Having said that, it will be important to fully document the steps taken to successfully remount a backed up database file, and to the extent possible, at least partially automate some of the steps involved.

Exit Criteria:

- [DONE] An S3 bucket for database backups in each of the dev and staging environments is created, manually for now
- [DONE] The server instance's database container can create a backup (archive) file of the game's database
- [DONE] The server instance's database container can be given a backup (archive) file and use it to restore the game's database
- [DONE] The backup file/s can be pushed from the server instance to the S3 bucket and viewed there
- [DONE] Following the destruction of the originating instance/volume, the backed up data can be mounted on a brand new instance/volume
- [DONE] Procedure for restoring a saved database from the S3 bucket is fully documented - (First in a series of SMARS Admin how-to guides?!)
- [DONE] Database backups are created on a scheduled basis (say once per day) with the help of a Cron schedule
- [PENDING] [STRETCH] Database backups that are greater than 28 days old are automatically deleted from the S3 bucket to lower costs

1. Cleanup from the previous chapter: create a terraform destroy script called destroyInfra.sh that loads the local environment variables and then runs 'terraform destroy.' In hindsight, this is really the absolute LEAST you can do to protect the production environment from being accidentally deleted... just sayin!

2. Temporarily comment out the certificate creation steps for the user_data script, and then launch a new server from the staging environment. Test its destruction with the new destroyInfra script.

3. Create a new dev/test environment, which will use the URL test.freesmars.com instead of using staging for development work. Unfortunately the frontend no longer wants to show itself without an HTTPS certificate, so we'll have to create certificates for this URL just as we do for staging and production; try to use them judiciously as we expand our setup.

4. Create a new user account, Danzel-dev, and make a quick save file on the dev server. We will use this to practice the archive/restore procedure for the database container.

5. Manually create an S3 bucket and add it to the test environment's security group... ADDENDUM: It appears that S3 buckets are global, as opposed to anchored to a particular region/security group, so there's no need for the SG component.

6. SSH into the dev server instance and, from outside the database container, run the database 'mongodump' command to create a copy of the smars database on the host machine's volume (i.e. not inside the db container). This is the command used to create a mongo dump archive called all-collections.archive at the location ~/mongodump (IMPORTANT: The ~/mongodump directory must be created prior to executing the command):

`docker exec smars-db-1 sh -c 'exec mongodump -d smars --archive' > ~/mongodump/all-collections.archive`

7. Next, delete the database volume at /var/lib/docker/volumes/mongo, and restart the stack to verify that the test save file created earlier is no longer available.

8. Next, run the restore command with the stack still running, and verify that the save game file is once again accessible. This was the command that was used successfully:

`docker exec -i smars-db-1 sh -c 'mongorestore --archive' < all-collections.archive`

9. Next, install the AWS CLI on your test instance so that it can communicate with your S3 bucket. Document the installation steps so they can be scripted later:

- sudo apt install unzip
- sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
- sudo unzip awscliv2.zip
- sudo ./aws/install
- Configure access permissions for your CLI (see steps 11 - 14 below for more on that!)

10. Use the AWS CLI to copy the archive file to your S3 bucket. Once it has been verified that the file was copied successfully, tear down all the dev infrastructure with the destroyInfra.sh tool from your dev VM command line. Copy command for S3 bucket transfer:

`aws s3 cp ~/mongodump/all-collections.archive s3://smars-dev-bucket`

to retrieve the backed up file from S3 bucket use this command (making sure that the destination directory already exists):

`aws s3 cp s3://smars-dev-bucket/smars.archive ~/smarsrestore`

11. Create a new Terraform resource, an IAM Role (aws_iam_role resource) that will be used to attach an access policy for the S3 bucket to the server EC2 instance.

12. Next, still in Terraform, create an IAM policy resource (aws_iam_policy) to be associated with the role created in the previous step, that gives permission to read and write items to the Development S3 bucket. Once this has been validated we can add the code for the S3 bucket creation to terraform and use a variable inside the 'resource' attribute for this policy, to point to the bucket for the appropriate environment. For now though, since we're operating with a bucket created outside of terraform, we can just hard-code its name into the script.

13. Next, create an attachment resource (aws_iam_policy_attachment) that will link your Policy resource to the Role created in step 11. This attachment resource is like a junction that allows you to fuse the policy and the role together so that when the role is given to an instance PROFILE (on which more in a second) it will carry with it the specifications in the POLICY.

14. Create an Instance Profile resource (aws_iam_instance_profile) that is associated to the ROLE created in step 11. This will be the resource that is given to the instance, as its iam_instace_profile attribute.

15. Add the iam_instance_profile attribute to the server instance, to give it the access rights outlined in the policy. A bit convoluted the first time, but it's a good system for managing resource access permissions once you get the hang of it I'll bet!

16. Finally, update the instance's user_data script to add the unzip / AWS installation steps listed on step 9 to install unzip and the AWS CLI. Then let's get ready to fire this thing up and see if it works!

17. Re-launch the dev/test infrastructure, and once it is finished booting up, pull the saved database archive from the dev s3 bucket (as shown in step 10), and run the database restore command (as shown in step 8) to import the saved data from our old 'production' server.

18. Create a new shell script file that runs the database dump command and saves the output in a file named for the current date, and then runs the S3 copy-to command to store the file in the backup bucket.

19. Launch a fresh test instance. Create a Cron schedule to routinely call the database dump script every night at midnight, EST (or earlier if you want to validate it right away). Create some new user accounts and save files (list them separately) and then leave the server on long enough to validate the Cron schedule is working.

20. Add the commands used to generate the cron job to the server instance's user_data script. That file's getting awfully big, eh?

21. On the Dev S3 bucket, create a policy for the S3 bucket to automatically delete archives that are more than 3 days old.

22. Rebuild the project's infrastructure to validate the cron table job's integration. You should now be able to get a full database save if you hurry.

23. Tear down and rebuild the dev environment one more time, and practice the database restoral procedure (and write it down) while you're at it.

24. Manually create an S3 bucket for the Staging environment, with retention rules to expire objects after 14 days and delete them after 28 days.

25. Remove the reference to this chapter from the main.tf file, and then merge to master. Then, launch a build on the staging environment. If successful, move on to the next chapter.

## Chapter Eleven: Container Logs

### Difficulty Estimate: 3 (for what is expected to be a fairly straightforward implementation with only semi-new technology)

### Date: June 21, 2023

The last DevOps feature to be added before practicing a live update and subsequent production deployment will be to add a Cron job to export the log files from the game's backend container. In the future it might be desireable to do the same for the database, but we can safely put that in the 'DevOps future improvements' Saga (which, by the way, should also be a thing - maybe look into Trello again to organize and sort future development work, fun though it is to use this single, massive log file?). This should be a fairly simple affair, following the standard DevOps playbook: do it a first time manually, and then do it with a script, and then call that script with a Cron job added to the project's existing Cron table. The log files can be pushed to the S3 bucket for the same environment, and a new 30-day retention policy that specifically targets log files will be added to the bucket to prevent it from becoming too heavy. Once this is done it will be time for a quick live-update practice, and then we can finally get back to developing the game!

Exit Criteria:

- [DONE] Backend container log file is updated on an hourly basis and saved in the logs directory on the server instance
- [DONE] Container logs are copied to the S3 bucket for the correct environment on an hourly basis

1. First, some Dev environment management: this whole dev/test dichotomy is starting to become a nuisance to manage, but since we still need a "local mode" for the server to run in HTTP instead of HTTPS mode for local development, it is necessary to modify the backend's index.ts to use the HTTP server when the environment is called 'local-dev' instead of 'dev.' Apply this change in the current cloud development deployment, and then modify the .env variable on the local environment. Then do a grep for the word 'test' to make sure it's all rectified.

2. Manually extract the backend container's logs to a local file / directory on the development instance, to see what they look like, how big they are, etc. Use this command:

`docker logs smars-backend-1 > ~/logs/docker/smars-backend-1.log`

3. Update the terraform user_data script to create a directory within the logs folder for the docker container logs. This directory must exist for the log files to be placed there without error.

4. Expand on the previous command to make it add new log entries to the existing log file (or create a new one the first time it's run) every hour, using the Docker logs --since option, (note the relative syntax for the "--since 1h" option, which in this case means 'all log entries in the last hour; also note the double greater-than sign, which denotes an appending rather than an overwriting action for the log file):

`docker logs smars-backend-1 --since 1h >> ~/logs/docker/smars-backend-1.log`

5. Add a new line to the crontab (by hand) that calls the command above every hour; validate that this works over a period of hours by playing the game and checking that the log file is continually updated with the new events from every hour, without duplicating or overwriting the previous hours' entries.

6. Make a script that calls the docker log command on step 4, and then copies the log file to the S3 bucket like we do for the DB backups.

7. Make a third script file called createCronJobs that sets up both the database backup and logfile update jobs; db backup occurs one minute after midnight and the logging update should be called every hour on the hour (Cron expression: 0 \* \* \* \*).

8. Transfer all 3 of these utility scripts into a new scripts folder, so as to not clutter up the root of the project's directory.

9. Extract the big user_data script from your main.tf file into its own file called configure_instance.sh within the Terraform directory, and then import it into the main.tf file for the aws_instance resource to use, so that we can de-clutter that file a bit.

10. Do another push, followed by a full TF plan/apply/validate cycle to verify that all of these changes are working properly and haven't broken anything before proceeding to tackle the question of the database restoral procedure.

11. An issue has been detected where the database re-load creates duplicate entries for objects (e.g. modules and connectors) that are already present in the database at the time of the restore command's execution. Fix this by scripting the database restore commands so that they can be called with a single command, and make the user enter the date when calling the script (e.g. something like `bash restoredatabase 2023-06-21`). Put the database script in the scripts directory and then test it on the dev machine. If successful, delete, clean up the branch-specific code and merge this sucker!

## Chapter Twelve: Staging Update Test on the Cloud

### Difficulty Estimate: 6 (For full dress rehearsal of all existing workflows, plus significant thought devoted to workflow planning, documentation, and future task planning/roadmapping)

### Date: June 27, 2023

The final thing to do before taking the system live will be to practice the full stack deployment, including database backup/restore, followed by a simple update to the game's frontend, in the staging environment. The first goal here will be to do a full walkthrough of the deployment procedure to verify that everything works properly in a non-development environment, that the database backup system works well, and that the game works well with the Staging S3 bucket. Once this is established, and any necessary final improvements are made to the game's infrastructure (e.g. adding, at minimum, the game's S3 bucket creation to Terraform?!) it will be time to do a quick update to the game's frontend, to figure out the workflow for future updates to the game once it's in production. Key questions to be addressed during this procedure will be: what can be automated vs what has to be done 'by hand' for each update? how much of a disruption it is to the game's (currently only) running server instance? Can we 'offshore' much of the down time needed for an update by building the new docker image elsewhere? (this last question is more of a rhetorical one, of course). Once this process has been understood, and the minimal requirements for an initial production deployment have been met, we can launch the game's first production server, tell all our buddies, and begin the next phase of the actual game's development (looks like game UX, storyline and assets are back on the menu boys!).

Dress Rehearsal Exit Criteria:

- [DONE] Game is deployed from staging environment with one command and is playable at https://staging.freesmars.com
- [DONE] After > 1 hour game container logs are available in staging S3 bucket
- [DONE] Log files are updated and uploaded every hour after the server's launch
- [DONE] After > 24 hours game backup files are available in staging S3 bucket
- [DONE] If database is dropped, backup file can be used to restore its contents
- [DONE] Game can be played consistently by people on several devices for at least 3 days

Update Procedure Criteria:

- [DONE] Game can be updated to a new version in the staging environment
- [DONE] Players can easily experience the upgrade by refreshing their browser
- [DONE] Players' save data is preserved after an update

Pseudo-Update Criteria:

- [DONE] Game's copyright date updated to 2023 via VERSION_INFO frontend constant
- [DONE] Simplified introductory message at the start of the game
- [DONE] Basic random events have a small chance of occurring every hour in lieu of poetry rehearsals at midnight
- [DONE] Backend database functions have fewer, more informative console logs
- [DONE] [STRETCH] login page/account creation tab index issue fixed for password confirm field

1. From the staging environment - or should I perhaps call it a "workspace?" - on the local VM (which has become the de facto launching platform for terraforming, it seems) run the startPlan and startDeploy commands from an updated master branch checkout. Wait about 15 minutes and then check to see if the game is up and running at the staging URL.

2. Create a user profile and start a new game, and play it for a while, then save your game. Do the same on at least 2 other computers, and write down the names and passwords for the test users you created. Make sure that each user has at least one save file associated with their name, and write down the names of all save files to keep track of them. They will be needed to verify the database restore procedure.

3. After one day, download the backend's log file from the S3 bucket and examine it.

4. After one day, download that game's most recent database archive and deploy it to the local dev machine's mongo service to verify its integrity.

5. After two days, drop the database in the staging environment. Then run the database restore command for yesterday's backup file, and validate by logging in as all of the test users created on step 2, to ensure they have been recreated. Also check all of the build option lists to ensure no duplicate structures have been created.

6. After the database restore process has been completed, also log into the database container with the 'docker exec' command and look at its mongo database/collections directly to watch them in action. That's pretty much it for the deployment testing as it currently stands, so if you get this far with no snags, congratulations, you're an outstanding DevOps guy!

7. Now we need to think about updating this sucker. First, add a simple bit of code to your main.tf script to create an S3 bucket for the current environment. Then, copy the latest log and backup files from the current Staging S3 bucket to your hard drive, and delete it by hand. Test your new S3 bucket code by running a Terraform apply from the local staging "workspace" (as it's now called) and then uploading the log and backup files to it. Finally, restore the database running on the server instance with that backup file to ensure a full connection from instance to bucket and back (maybe we can force a database backup to save the current db to the new bucket before over-writing it with the restored one).

8. Next, start work on the code changes that will be introduced as our first "update," starting with the copyright date on the login page. Add two new frontend constants, RELEASE_YEAR and RELEASE_VERSION, both of which are strings. The year will be the current year, and the release version can be '0.1.0' for now. Update the login screen to display both of these values and fire up the local dev environment to test/fine-tune it.

9. Rewrite the game's introductory greeting message, and possibly include some logic to make the fonts slightly larger for modals with less than x characters.

10. Add a couple of new random events with comical messages and see what effects can be used (we can't give the player more resources other than money just yet since we need to find a way to add stuff to a specific module and not just artificially boost the economy's display value). Don't worry about adding new random event functionality for now, just focus on the "personality" of the messages.

11. In the backend's server functions, go in and try to reduce the number of console log messages to just one per operation. Also, for the messages that are kept, add some more details to make them more informative (e.g. opening DB connection... to do what?)

12. See if you can figure out what's wrong with the tab order for the login page and fix it if you can! ADDENDUM: It was super easy, it was just a matter of attaching them to the page in the right order!

13. Once all of these updates have been validated in the local dev environment, merge all changes to the master branch and prepare to rehearse the update procedure.

14. Now, take a minute to reflect on how we'll update this sucker on the cloud. The most obvious procedure would be to simply initiate a git pull from the master branch on the server machine, then wipe its docker images and re-build using docker compose up, but this involves a lengthy down time of about 10 minutes (ADDENDUM: No more than 7 minutes) which is not ideal. This may nonetheless be acceptable for now, but rehearse that workflow and document its steps, and then we can spend some time brainstorming to see if there's a better way (or rather, how we might go about implementing a better way, of which several ideas spring to mind).

15. Validate the results of the update process that was used in the previous step, to ensure that players can access the update via a browser refresh and/or cache clearing, and that their save data is still there. Once this is validated we have all of the prerequisites to launch in a production environment. Yay.

# Volume III: Project Management and Continuous Improvement on the Web (SMARS 1.0.1 + )

### Date Started: July 9, 2023

The third stage in SMARS's development will be geared towards making the game, now reliably deployed at https://freesmars.com, more fun and enjoyable for the player, while also continuously improving the game's stability and ease of development experience for its creator. Project management software will be used to help with brainstorming, arranging and prioritizing ideas for future improvements to the game. New work will be divided into three categories of improvement: developing new application features for the game, working on the game's production stack, and creating content for the game, to better take advantage of new features as they are added.

Unlike the previous volume, but like the first one, this stage of development does not have any specific completion requirements. However, progress will be directed towards a number of medium sized groups of complementary features/content bundles that we can call "patch updates" whose requirements will be spelled out in detail in this log file. Aside from that, this log file will continue to record the notes, plans and other minutiae of the game's development day-to-day work, but the exit criteria for each issue will reside on the project management board to avoid wasting time duplicating information. As time goes by, more data may also be recorded in the project management tickets instead of in this file, if it proves to be an easier way of retrieving information.

A new chapter/feature branch nomenclature scheme will also be adopted to match up with the issue numbers created by GitHub Issues while also identifying what type of work is being done, and in fact the branch creation can be done entirely via GitHub issues. As of now, new feature branches should follow the format:

<issue number>-<category>-<branch-title>

e.g. 36-application-better-random-events

or

41-production-setup-aws-billing-alerts

Naming issues this way will help with long-term issue debugging and code traceability efforts, increasing the speed with which new features and content can be added to the game.

## Chapter One: Better Random Events

### Difficulty Estimate: 6 (For complete overhaul of the random events system, and expanding Engine functionalities for more diverse random event outcomes)

### Date: July 9, 2023

The game's random events system is a very promising way to add complexity and unpredictability to the game, as well as being an way to add some storyline elements and show a bit of the game's personality. However, before we can add a large selection of more interesting random events we need to improve the game's ability to handle complex event resolutions and move the whole system over to the backend to save the Engine's resources and allow us to pull random events from the game's database instead of the frontend's constants file.

Exit Criteria:

- [DONE] Random events are from the backend, not the frontend constants file
- [DONE] The Engine requests random elements from the backend when a random event fires (probability check can remain in frontend)
- [DONE] The Engine sends certain information about the state of the game when requesting a random event
- [DONE] The backend has its own logic for deciding which random event to send - it processes the information sent from the frontend
- [DONE] The types of outcomes that a random event can lead to are more diverse and interesting (resource gain/loss, morale effects, etc.)
- [STRETCH] If the random event is an oxygen leak, do an 'oxygen leak' animation on the target module!

Some preliminary test events will need to be created for this chapter, but a separate, content issue will be created upon the feature's completion as well.

1. Create a new type, RandomEventData, which has a karma value as well as a magnitude value, and a data component which is an ordinary EventData type object.

2. Create a new World Builder function that can add random event data of the above type to the database's random_events collection.

3. Create a new server function that can fetch random events from the database and return one at random.

4. Convert the existing random events in the frontend's constants file into RandomEventData objects in the world builder's newEvents file. For now we can have generic text in the modal and its resolutions, without the need to include the target module/colonist's information.

5. Push the random events to the game's database.

6. Add random events data to database seed file, and add random_events to backend database validation function that gets called at the start of the game.

7. Create an endpoint for retrieving random events and add it to the backend's index file.

8. Create a frontend server function that can retrieve a random event from the server, and have the Engine call it in lieu of reading from the constants file.

9. Add a new case for the closeModal method's switch block for the case called 'add-resource'. In it, have the Engine find a module that has at least some capacity for the resource in question, and then add that resource. Validate by adding a new event with this outcome and adding it to the database, then rigging the backend's server function to return only that event.

10. Once the add-resource case is working, use it as a prototype for remove-resource. Once again, test with a new event and rig the backend.

11. Have the Economy display update as soon as a resource-altering event is resolved, rather than waiting for the full hour to pass.

12. The next type of event will be the colonist morale changers, so let's take a moment to add a new Population class method that can either take a number (positive or negative) representing a change in morale, and then an optional second argument, which would be a list of colonists' IDs. If this argument is given, each colonist on the list receives the morale change, whenever possible (their own updateMorale method doesn't allow exceeding 100 or going below zero). If no list is provided then it simply calls the updateMorale method for every colonist.

13. Now make a new case for the closeModal switch block that calls this method, and test it with a new random event that supplies no argument at all with the values in the 'outcomes' tuple (which looks like this by the way: ["update-morale", -5, ]). Test that this outcome is applied to all of the colonists. That will actually be all for the morale methods for now; the colonist IDs list may be useful in the future but for now we will only use this basic case.

14. Take this moment to investigate why the game's difficulty is not being saved between sessions and fix this for new saves going forward. For those existing saves that are already missing the data, add a hotfix to the server's load game routine that supplies a default value of 'medium' if a save file is loaded that has no save data. Supplying this missing value in the server function will prevent the Engine from having to deal with corrupted save files, which should always be the policy.

15. Now, devote some thought as to the logic that will be used to calculate the karmic alignment and severity of random event requests, both on the Engine's side, and the server's side. How much of a role will each play in determining the type of event that is returned, and what exactly will be the calculus used by each side? Answer: Engine will keep track of the previous event's karma and magnitude, and use these, as well as the game's difficulty level and duration (high magnitude events will be blocked before year 2) to determine the next event request. The server will then pull events of the same karma as the request, and filter based on magnitude to return the best match possible.

16. Consider how to upload new random events (And by extention, other types of content as well) to one of the game's cloud databases. Document the procedure that gets the job done most efficiently:

- Create new randomEvents.json file locally in world editor folder with the new events' data
- Upload it to the S3 bucket via the AWS dashboard (there is an upload button for files/folders)
- Log into the server instance via PuTTY
- Pull the json file from the S3 bucket:
  `aws s3 cp s3://smars-${env}-bucket/randomEvents.json /tmp/smarsrestore/`
- Run the MongoImport command to add the JSON file's contents to the database container:
  `docker exec -i smars-db-1 sh -c 'mongoimport --db="smars" --collection="random_events" --jsonArray' </tmp/smarsrestore/randomEvents.json` (VALIDATED 2023-07-19)

17. Undo dev mode changes: Before commiting this code to the master branch and testing it in a staging environment, make sure that you undo all of the changes made during the course of the chapter's development: Reset the Engine's random event odds; reset the random indexer (or whatever logic now has replaced it) in the random events server function; clean up the original events in the constants file; get rid of development console logs.

18. Add the Engine's enableRandomEvents flag to the calculus for creating a random event (so that if the player has de-activated that setting no random events will occur).

## Chapter Two: Destroying Structures

### Difficulty Estimate: 8 (For refactoring that could get very nasty, and many unit tests needed for reassurance that we got it right)

### Date: July 23, 2023

Following the implementation of the game's random events system, the next essential item on the game's feature list has got to be the ability to remove Modules they had previously built. This will require revisiting some of the game's more elaborate logic for module placement, and how that interacts with more shadowy concepts such as the base's volume, floors, and of course the whole Infrastructure/InfrastructureData class distinction (has the time come for a revolution in that sphere?!)

On the way it will be necessary to consider what rules will be in play when removing Modules (deliberately distinct from Connectors, which will require their own sub-chapter), and consider questions such as:

- Can the player remove any Module they like? Consider: gravity, unique structures (comms dome) --> There will be exceptions/limits
- What happens to the resources in destroyed Modules? --> They will be exported to other modules, whenever possible
- What happens to Connectors that are attached to a destroyed module? --> Nothing (see below for more on connector removals)
- Will there be a warning/are-you-sure message? --> Yes, but only in the console for now (next chapter will upgrade this)
- What happens to the Floors data when a module is removed? --> It gets updated; same with base volume map
- BONUS: Can we illustrate/show floors in some subtle way as part of module highlighting? Or as an overlay?? --> Yes, but only in Dev mode for now

Also, in tandem with the above considerations, what is to be done about removing Connectors?

- Will they be removed with the same mouse function/button as Modules? --> YES
- Do they need to be removed first/before a Module that they're connected to? --> Not necessarily, although there will be some guardrails
- What factors would limit their removal, if any? --> Ladders annot be removed while a colonist is climbing them

Exit Criteria:

- [DONE] Player can select 'demolish' button from sidebar that will enable them to remove either a module or connector
- [DONE] When in 'demolish' mode the mouse cursor is accompanied by a little red 'X' whose center is at the point of the cursor
- [DONE] Player can deselect 'demolish' mode and return to 'inspect' mode simply by clicking on anything that isn't a module or a connector
- [DONE] Player can click on a connector while in 'demolish' mouse context to remove it
- [DONE] Player will be notified (initially via console log) that a connector cannot be removed if there is currently one or more colonists on it
- [DONE] Once removed, a connector will no longer be considered by colonists looking to gain access to a floor/module
- [DONE] Player can click on a module while in 'demolish' mouse context to remove it
- [DONE] When a module is clicked for deletion the following 3 'hard' checks are performed:
- [DONE] If the module is underneath another module it cannot be removed and the player is notified (via console message)
- [DONE] If the module is considered 'essential' it cannot be removed and the player is notified
- [DONE] If the module contains any colonists it cannot be removed and the player is notified
- [DONE] If none of the above 3 conditions are true, the following 'soft' checks are then performed:
- [DONE] If the module contains any resources, a warning is given (again, for now in the console -in the future this will be upgraded to a confirmation popup)
- [DONE] If the module's removal will strand any colonists on the remaining part of the floor, a warning is given
- [DONE] When the module demolition finally occurs, If the module contains resources, all of its resources are pushed to other modules
- If the module contains no resources, or once its resources have been pushed out, the following steps are carried out to ensure a thorough removal:
- [DONE] It is removed from the infra class's modules list
- [DONE] The Infra data class removes it from the base volume array
- [DONE] The Infra data class removes it from the Floor it is on:
- [DONE] If the module is the only module on a floor, the floor is removed entirely
- [DONE] If the module is at the edge of a multi-module floor it is removed and the floor's edges are recalculated
- [DONE] If the module is in the middle of a multi-module floor, it and all modules to its right are removed from that floor and a new floor ID is generated for the remaining module/s to its right
- [DONE] Whenever a module is removed from a floor, that floor's connector IDs list is updated
- [DONE] There must be extensive unit tests for all of these criteria, developed prior to the implementation of the features themselves

1. Start by replacing the 'Overlays' button on the sidebar with a 'demolish' button, and give it the standard yellow colouring of non-disabled mouse context buttons.

2. Then, in the mouse context manager/sidebar buttons programming, change the mouse context for the button to 'demolish' and finally have the Engine's click handler log that new context when a click is made with it.

3. Create two new, initially empty Infra class methods: removeModule and removeConnector. Initially just have them call their own names when activated.

4. Create a new Engine method, handleDemolish, that takes care of the click response for the demolish mouse context, and make it call either the removeConnector or the removeModule method as appropriate when a click occurs, as the Inspect tool handler does. If a click does not fall upon either a module or a connector reset the mouse context to 'inspect.'

5. Refactor the MouseShadow class to accept a string argument indicating the type of shadow it should make, and then create a switch case system that uses this argument to produce the various shapes for the different mouse shadow options. Update the mouse shadow unit tests once this is implemented, and add a new one for the 'demolish' context, then add a new shadow with a red 'X' for that context.

6. Create a debugging tool (and potential feature down the line): Pass P5 to the Floor class, and make it a part of the Infra class's render function. Give the Floor class a render function, and have it draw a line with a random colour along its length at the floor's elevation level. You can then wrap the call to render floors in a conditional statement to only do it when the environment is "dev" or "local_dev".

7. Add the Connector removal check, as its own Infra class method called checkForConnectorRemoval. Since it will only have one check to perform it will contain all of the logic for the following operation: Given the ID of the connector to be removed and the Population class, check each colonist to see if their current action is "climb" and their coordinates overlap with the Connector to be removed. If both of these checks are true, that means that a colonist is climbing the targeted ladder, in which case return a value of 'false' so that the remove method knows not to proceed. Develop a unit test for this checking method before writing its code. Test in game as well, by logging the check's outcome and clicking on various ladders. The method should also return true automatically for non-transport (e.g. conduit) type connectors.

8. Before adding the connector removal logic, create a new Population class method to update colonists' action stacks when a structure (connector or module) is removed: Have it check each colonist's action stack and current action, and if it finds the ID of the structure being removed, immediately resolve that colonist's current goal, allowing them to recalculate their course of action. We'll need to validate this with a unit test, naturally, and do it again in the field as soon as the removal feature is implemented.

9. Once the Connector removal check method is ready, it's time to implement the actual removal of the structure. Within the shell of the removeConnector method, after it does the check, do each of the following steps to fully remove the connector (add unit tests before coding solution):

- [DONE] Filter it out of the connectors list (Infra class)
- [DONE] Connector ID is removed from each Floor's connectors array (Infra Data / Floor classes)
- [DONE] Filter it out of the elevators list (Infra Data class)
- [DONE] Reset colonist goals if they were going to use it (Population class)

10. Add a new field to the Infra class, essentialStructures. It should be a list of strings, and by default will contain the name of the comms array ("Comms Antenna").

11. Now begin with the Module removal method, starting with its hard checks method: doHardChecksForModuleRemoval. Since it will have to perform multiple sub-checks, create a method for each of these (with its own unit test - developed prior to the actual code, naturally):

- [DONE] Check for modules above
- [DONE] Check whether module is occupied by colonists OR forms part of a floor that a colonist is currently walking on
- [DONE] Check whether module is considered an 'essential' structure (can also be done inline)

12. Next, once the hard checks are working out as desired, implement the lesser, softChecksForModuleRemoval. There will be two of these checks, each of which will require its own method and unit test:

- [DONE] Check if the module is empty
- [DONE] Check if the module's removal will strand any colonists on the floor

13. Put it all together: if the hard checks pass, and the soft checks do their thing (either printing a message or doing nothing at all) then execute the module's removal:

- [DONE] First, if it does have resources, attempt to push them to other modules wherever possible (Infra class)
- [DONE] Then, filter it out of the modules list (Infra class)
- [DONE] Tell colonists not to use it anymore (Population class)
- [DONE] Update the base volume to remove its coordinates (Infra Data class)
- Update the Floors list (Infra Data class):
- - [DONE] If the module was on its own floor, delete that floor
- - [DONE] If the module was on the edge of a floor with at least one other module, adjust that floor's appropriate edge and remove its ID from the floor's module ID list
- - [DONE] If the module was in the middle of a floor with another module to either side, remove it, and all the modules to its right from the original floor and adjust that floor's edge; then, place all of the other modules that were removed (those to the right of the removed module) into a NEW floor.
- - [DONE] Update the connector ID lists of any floors that are affected by any modules' removal

14. Fix the issue where distant floors can be merged wrongly (it's maybe picking the first floor whose elevation matches?)

## Chapter Three: In-Game Notifications

### Difficulty Estimate: 5 (for developing a new Engine subclass component, Messages, which will collect, prioritize, and render messages collected by the Engine) Addendum: This was a low estimate - a notifications system is a helluva thing to implement, it turns out!

### Date: August 1, 2023

A highly anticipated and long-overdue feature that is critical to the game's UX is to implement a simple in-game notification system that does not interrupt the player like the modal dialogues, but which displays helpful prompts to the player without pausing the game. These should be simple messages displayed by the Engine whenever a console log warning would pop up, to indicate that a command was not successful, or that there is a problem in the base that requires the player's attention such as a lack of a resource needed for production, or colonists going hungry/thirsty/etc.

Exit Criteria:

- [DONE] If the player clicks to do an action that is not permitted, an explanatory popup appears near where the click occurred:
- [DONE] When a structure cannot be demolished
- - [DONE] Module
- - [DONE] Connector
- [DONE] When a module cannot be placed
- - [DONE] Due to invalid location
- - [DONE] Due to insufficient funds
- [DONE] When a connector cannot be placed
- - [DONE] Due to invalid start location
- - [DONE] Due to invalid finish location
- - [DONE] Due to insufficient funds
- [DONE] When a mining zone cannot be assigned
- [DONE] When the game is in 'wait' mode
- [DONE] If the player clicks to do an action that succeeds, a small success message should be shown near the mouse click:
- [DONE] When a mining zone is established / removed
- [DONE] When a module is successfully placed
- [DONE] When a module is successfully demolished
- [DONE] When a connector is successfully placed
- [DONE] When a connector is succesfully removed
- [DONE] If there is an issue in the base, the player is notified by a short-lived display banner which pops up near the top of the screen:
- [DONE] When a colonist is unable to enter a module
- [DONE] When a colonist loses morale due to not eating, drinking or sleeping
- [DONE] When a colonist is not able to reach a floor / module
- [DONE] When a module cannot be found to store a resource
- [DONE] When a module has an insufficient amount of a resource
- [DONE] When there are no food production modules (and food / air is below a certain threshold)
- [DONE] When there are no water mining zones (and water is below a certain threshold)
- [DONE] When there are no solar panels (and power is below a certain threshold)
- [DONE] If a non-random event occurs, the player is notified by a short-lived display banner which pops up near the top of the screen:
- [DONE] When a new ship is launched from Earth
- [DONE] When new colonists arrive from Earth
- [DONE] When the colony's initial landing begins
- [DONE] Banners are displayed according to their urgency, and are routinely filtered and updated by the Notifications manager class
- [DONE] Popups and banners have a life expectancy that can be set individually by the Notifications manager class
- [DONE] Unit tests are created for the Notification and Popup classes and Smartian time conversion helper functions
- [DONE] At the chapter's end there are no more console log notifications of any kind that the player can see (there will still be error messages, but we'll deal with that matter later)

1. Create a new Class, Notifications, that will be the gatherer of all the messages from the various components in the game. Give it its basic fields, backlog, queue, currentDisplay and currentClickResponse, and set their default values for the constructor function.

2. Create the type definition for Message, which contains a subject (string/switch case code), a smarsTime (to keep track of when the message was created), entityID (number) and finally of course, the actual text of the message to be shown.

3. Bring the Notifications class into the Engine and import the Message type as well, and have the Engine feed some preliminary messages to the Notifications manager via its addNewMessageToBacklog method. Develop this method, and a unit test as well, before doing the integration with the Engine. Start with a mouse click during wait mode as the first message the Engine will pass to the Notifications class, and have the Notifications class print the message to the console when it receives it.

4. Add one more message, for when a module cannot be built, and validate that it enters the backlog and contains a relevant statement of the obstacle.

5. Now it's time to develop a rudimentary message filtering/prioritization system. We'll start by having it simply root out any messages with duplicate subject lines, so that multiple clicks during a wait period, or multiple failed attempts to create the same structure will not be kept in the backlog. Start by adding an updated unit test to the addMessageToBacklog method, and then update it to only allow a single instance of a message (comparing subject and text values only) in the backlog at a time.

6. Create the Popup class, with fields in its constructor for text, colour, duration and (optionally) coordinates. Also program in the default values for all of these attributes, plus other factors like text size, etc. Give it a basic render function and then of course also add a simple unit test to get things started in that direction.

7. Import the Popup class into Notifications, and create a new method for that class called createPopupFromClick, which will produce a new Popup object and save it as the currentClickResponse. Have the Engine use this instead of the backlog method when adding click-response notifications; ensure that the untreated mouse coordinates (just the pixels, ma'am) are used instead of grid location/offset values. Add the render method for Notifications to the Engine, as the final thing (i.e. top layer) to be rendered.

8. Add the rest of the click response messages and tweak their creation parameters to ensure each one appears in the correct colour, font size, etc. and also has a reasonable duration before disappearing.

9. Update the Inspec display functionality to only print the detailed readout to the console in the local / Dev environment.

10. Start to develop the mechanism for displaying non-click messages from the backlog; start by adding a new message to the backlog when new colonists are launched from Earth, or when they arrive from Earth, and verifying that those messages are in the backlog.

11. Now that we have some messages to display, develop the Notifications system's minutely update cycle: first, have it check the backlog for messages to add to the queue, by first seeing if the queue is empty, and then seeing if the backlog contains anything that can be shifted into the queue (we'll develop a more elaborate prioritization scheme presently). Once a message is placed in the queue, simply create a new popup display using the message in the queue each time the current display is empty.

12. Add notifications for the random event outcomes for "add-resource" and "subtract-resource", as well as for the "landing" event at the start of the game. Verify each in-game.

13. Add a message-collection system to the Infrastructure class: First, add a message field to the Module class, which maps to the MessageData type. Then, when a module has a console log message, such as the warning for when no more resources can be added to it, it should update its current message. Implement this by adding two new Module class methods, setMessage and clearMessage - the latter of which will be called by the Infrastructure class when it collects the message into its own messages array.

14. Use the Module's new setMessage method to create messages whenever:

- The module cannot store the full amount of an added resource
- The module tries to deduct a quantity of a resource but has 0 in stock
- The module fails to produce power due to missing resources (not yet applicable but for future nuclear modules)

15. Now, to the Infrastructure's updates section, add a minutely update method, and have the Engine call it, along with the Population class's minutely updater, every game minute.

16. Improve the Infrastructure class's resource push system, to attempt to push resources to storage modules with capacity for the entire amount being pushed, before resorting to pushing to a storage module with any capacity at all, or finally, to any module with any capacity.

17. Following the same pattern as the Modules/Infra class message system, implement messages for the colonist class to pass to the Population class. Add messages, and update the notification class to recognize messages for:

- A colonist is unable to enter a module
- A colonist loses morale
- A colonist is unable to reach a floor/module, or is stuck on their current floor
- A colonist's mining output cannot be stored due to a lack of space

18. For certain messages related to colonists becoming trapped and/or falling, make the Notifications system prioritize adding such messages to the queue first so they're shown ahead of lower-priority messages.

19. Create an Engine method, to be called as part of the hourly updates process, that checks for various factors in the base and issues general-purpose advice, such as to build solar panels or hydroponics modules, or to set up mining zones when the relevant resource/s grow scarce.

### 98. BUGFIX: Keep track of the amount of structures that have been demolished, or otherwise drop the imported structure ID's for loaded buildings, as the current system is leading to the creation of duplicate module/floor/connector serial numbers, assigned since the Infra class's internal serial number counter is behind some of the serials for loaded structures if they are from a file in which some modules have been demolished. Good sleuthing there to identify the cause of the problem, at least!

99. Clean up unconverted console logs from previous chapter.

### 100. Update the version and date information in the frontend's constants file.

## Chapter Y: Tools (Difficulty Estimate: ???)

Creating assets with P5 is very difficult right now; create an interface that will allow the creation of visual assets for new Modules and Connectors.

## Chapter Z: Environments/Debug Version (Difficulty Estimate: ???)

As the game matures, it will be more and more desirable to separate features that are used in development - console logs, test structures, in-game information displays, etc - from the production version of the game. We've already got an environment variable that the game's code can detect, so it would be possible to enable certain features only in a development environment, and then in a separate 'staging' environment it would be possible to preview the actual game experience.

## Chapter Ninety-Nine: Chapter Summary Template

### Difficulty Estimate: TBD

### Date: TBD

Description Paragraph

Exit Criteria:

- Criteria 1
- Criteria 2
- ...

### 1. Step One...

## Bug List (Severity in square brackets):

1. [2: UX] When the in-game menu is opened then closed, it resets the engine's offset to be back in the middle of the map. The offset value should persist between menu openings.

2. [8: Major gameplay issue] Ensure buildings cannot be placed BELOW the game's screen area (and by extension, that no map actions are permitted outside the map area).

3. [5: UX / Minor gameplay issue] At some, but not all x-offset values, the building shadow (and subsequent placement) pulls to the left, to the point that the cursor is outside the designated build area by what appears to be up to a full grid space.

### 4. [1: UX / Inaccurate info display] Save game dates seem to be from a different time zone?!

### 5. [3: UX / Inaccurate info display] Economy save data should really include the previous value/rate of change numbers so the player doesn't have to wait an hour for an Economy update. Also, consider how to show rates of change that occur less frequently than every hour (like colonist meals). This could still be a highly data-driven game.

### 6. [1: UX / Animation glitch] When the game speed is adjusted, it can cause moving colonists' animations to disappear for a moment before reappearing. Solve that one, if you dare! Addendum: you would need to lower each colonist's current animation frame.

7. [1: Coding Convention] Colonist class should have a unique ID field, to individuate the colony's population.

8. [1: UX / Aesthetic] When a modal popup has more than one possible resolution, the buttons for the different resolutions aren't symmetrically aligned on the horizontal axis (they are pulled slightly to the right it seems).

9. [2: UX / Inaccurate info display] The game speed indicator should always be visible, including at the game start, and when the player returns to the game from the menu.

10. [8: Major Gameplay issue] Loaded games do not allow the player to scroll all the way to the far right of the map; the section underneath the sidebar becomes unreachable when the player saves and then subsequently reloads the game.

11. [5: Save Data Completeness] Although currently not doing much, save game files do not contain the game's map type or difficulty level data - both fields contain a blank string.

12. [8: Major Gameplay issue] In some circumstances, colonists who have just begun an 'explore' goal will have an action stack that tells them to jump off of a floor, with the false belief that they are stuck up there (even when a ladder to the surface is available).

13. [8: Major Gameplay issue] In some circumstances, colonists will climb empty space (in the observed instance, the place where the climb action took place was in between two actual ladders) as though it were an actual ladder.

14. [2: UX / Inaccurate info display] The Earth date on the Earth screen is broken. It appears to not take the date from the save game data into account.

### 15. [5: Significant Gameplay issue] When a new module is placed on the ground in a position that makes it flush with an existing floor, Colonists walking across it will momentarily climb up into the air for one block before falling back down. This is likely caused by the incompleteness of the Floor creation/merging strategy used by the Infrastructure Data class.

16. [5: Significant Gameplay issue] When a Colonist has passed their need threshold for rest, their attempts to satisfy any other need are overridden since the needs calculation uses a forEach loop whose last member is 'rest.' This causes Colonists to freeze up in some circumstances, as they are not able to fulfill eat/drink needs even if the rest availability status has been set to 0 (meaning that they should ignore it and try to fulfill one of the other two needs).

### 17. [5: Significant Gameplay issue] When a Colonist is going to produce in a module on a non-ground floor, they can sometimes start to climb a ladder that is attached to that floor, but that does not go all the way to the ground where they begin to climb it. Colonist appears to climb an invisible ladder until they reach the bottom of the actual ladder, which they continue to climb to the destination. Because the Colonist does not totally freeze up this is considered only a moderate level of severity.

### 18. [1: Minor Edge Case] When the player starts a new game the initial map they're given will be the same as the one that was selected for the previous "New Game" in that browser session. It should be reset so that it is always fetched from the appropriate map collection being displayed (in this case the default map type is "polar").

### 19. [2: Inaccurate info display] When new colonists arrive via drop pod the game speed is set to 'fast' mode but the game speed indicator is not set to display this (so if you were going slow or extra fast the setting does not appear to change even though the game's speed does).

### 20. [7: Rare but Fatal Gameplay issue] If a random event fires at the same time as a pod of new colonists begins its landing descent, the game becomes frozen and unplayable as the mouse context gets set to 'Inspect' but the player is unable to close the modal window or to access the sidebar. We must add some new logic to manage how modal popups are dealt with when they coincide with other events that alter the game's normal flow and/or that alter the mouse context.

## Technical Debt Issues:

### 1. Refactoring needed to enable widespread unit testing of Engine subcomponents classes. Classes to refactor (by removing P5 from the class attributes and making it an argument to the render method instead, and/or recombining the base and data versions of the class):

- Colonist/ColonistData

- Population (no unit tests had been made due to P5! Hurray, now we can add them all!!!)

- Block (no data class exists yet - not a high priority)

- MouseShadow/MouseShadowData (also not a top priority)

### - Colonist/ColonistData

### - Infrastructure/InfrastructureData (the big one)

### - Economy/EconomyData

### 2. Refactor unit tests for classes that have already been refactored in this way:

- MouseShadow/MouseShadowData

### - Infrastructure/InfrastructureData

- Module/ModuleData

- Connector/ConnectorData

- Map/MapData

### 3. Revise the way Modules load saved data, to avoid adding to the already hideously complex getModuleInfo function. Replace it with a more elegant Module method that simply takes a ModuleSaveInfo object as its sole argument and applies the save data directly.

# Annex A: Advanced Feature Concepts (Non-UX Related - for UX See Annex)

## Section A.1: Advanced Connector Features

### 1. Add a new Infra Data class method to calculate a list of coordinate pairs for each individual section of a proposed Connector. This will be used to detect collisions with the terrain - the one possible obstacle to creating a new Connector (gravity/indoors criteria don't apply to in-between segments). We'll need a getConnectorSegments method that is updated by the Engine's validateMouseLocationForPlacement method (which will also need to be upgraded to note the difference between a new connector's start/stop phases).

### 2. Add ability to merge overlapping connectors (analogous to how floors are combined, only vertically... as well as in multi-line segments??).

### 3. Add ability for Connector renderer to operate like module renderer (using shapes data).

### 4. Integrate the 'elevators' data from the connectorData field into the data for the actual Connectors array in the Infrastructure base class... And if this is the catalyst that leads to that great merger, then undertake it boldly, and do a triumphant unit test/sanity check run when it's over!

## Section A.2: Advanced Module Features

### 1. Add a "roles" property to the Module Info type description (and thus to all existing modules in the DB) that contains a list of at least one string describing the role that a module plays (e.g. 'storage', 'dispensary', 'rest', 'science', etc.). This will help colonists figure out which module to go to when they have jobs, as well as restrict where resources can be accessed by colonists (so they have to eat at the cantina instead of being able to visit the store room instead, for instance). Addendum: This might not be the way things eventually end up going, but it's worth keeping around for consideration.

## Section A.3: Base Resource Management

### 1. There needs to be a way to ensure that production outputs are moved out of their production modules and into storage modules, to prevent waste. A possible quick fix would involve a secondary set of resource re-allocation checks by the Infra class. We could also introduce a 'logistics' role for Colonists that would involve shuttling resources and maybe other items as well from place to place, like little UPS courriers.

## Section A.4

# Annex B: UX Improvements

## Section B.1: Player Controls

### 1. Add a right-click handler to deselect whatever is currently selected and/or return the sidebar to its default (top-level) options, with Inspect mode mouse context and nothing selected.

## Section B.2: Landing Sequence

### 1. Ideally the in-game menu should always be available, so render a truncated sidebar during the landing sequence, with only the main-menu button available.

## Section B.3: Autosaves

### 1. Consider how to implement auto-saving that can either be triggered by the player quitting to the main menu, or, for real genius points, when the browser/tab is closed! Saves made in this manner would look for an existing file called "autosave" in the player's database, and overwrite it if it's found, or create a new Autosave file if one doesn't exist.

# Annex C: Aesthetics and Branding

## Section C.1: Logos and Cover Art

### 1. Design a logo for SMARS! - a small PNG file that can be used for repos, profile pictures, etc.

## Section X.1: World Editor Suite Improvements

### 1. Use shell scripts with arguments to replace manual steps in the map upload process from the World Editor suite's readme file.

### Exit Criteria for backend save/load game chapter:

- [DONE]It is possible to create a new saved game file for a given user.
- It is possible to update a saved game file for a given user.
- [DONE]It is possible to retrieve a list of saved games for a given user.
- [DONE]It is possible to retrieve all of the game data for a specific saved game file.x
