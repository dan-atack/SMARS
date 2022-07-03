# The Saga of SMARS: ChangeLog and Study Notes

## Chapter One: The Creation of the Git Repo (Difficulty Estimate: 1)

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

## Chapter Two: The Typescript NodeJS Server (Difficulty Estimate: 5)

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

## Chapter Three: MongoDB (Difficulty Estimate 5, For Real This Time!)

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

## Chapter Four: Unit Tests (Difficulty Estimate: 6, since this is truly uncharted territory now)

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

## Chapter Five: DevOps It Up A Little Bit (Difficulty Estimate: 7)

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

## Chapter Six: Add P5 and separate the frontend from the backend (Difficulty Estimate: 8)

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

## Chapter Seven: Create basic app framework and login page (Difficulty Estimate: 6)

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

## Chapter Eight: Backend login functionality (Difficulty Estimate: 5)

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

## Chapter Nine: The Main Menu - Frontend edition (Difficulty Estimate: 6, since we will be adding unit tests to the frontend)

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

## Chapter Ten: Backend Functions for the New Game Screen (Difficulty Estimate: 5)

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

## Chapter Eleven: Frontend Pre-game setup screen (Difficulty Estimate: 5)

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

## Chapter Twelve: The Game Screen! (Difficulty Estimate: 8 due to large complexity and need for finalizing designs before implementation)

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

## Chapter Thirteen: Filling out the Sidebar (Difficulty Estimate: 3 - aren't we getting optimistic again!)

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

## Chapter Fourteen: Rendering the map (terrain)! (Difficulty Estimate: 5 - it's been done before but we need to consider scrolling)

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

## Chapter Fifteen: The Passage of Time (Difficulty Estimate: 3)

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

## Chapter Sixteen: Modal Dialogues (Difficulty Estimate: 5 due to planning of how and when modals will appear and be dealt with)

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

## Chapter Seventeen: Managing Buildings in the Backend (Difficulty Estimate: 5 [Hindsight: 8])

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

## Chapter Eighteen: Buildings in the Frontend (Difficulty Estimate: 6 due to regular difficulty plus a coat of rust on this here programmer!)

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

## Chapter Nineteen: Buildings in the Frontend II - Module Placement Logic (Difficulty Estimate: 6 for new dynamics development)

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

## Chapter Twenty: Saving Games (Difficulty Estimate: 3)

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

## Chapter Twenty-One: Loading Games (Difficulty Estimate: 4)

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

## Chapter Twenty-Two: It's the Economy, Stupid (Difficulty Estimate: 5 for what is expected to be a large amount of hopefully fairly simple challenges)

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

## Chapter Twenty-Three: The Colonists (Difficulty Estimate: 8 for new rules to govern colonist movements and animation)

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

## Chapter Twenty-Four: BACKDOOR UNIT TESTS (Difficulty Estimate: 7 For Refactoring and Familiarization with Jest)

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

## Chapter Twenty-Five: The Beginning of the Game (Difficulty Estimate: 6 For New Animations and New Engine Functions)

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

## Chapter 26: Buildings in the Frontend, Part III - Connectors (Difficulty Estimate: 7 - Tweaking the existing Connector a fair bit, plus adding new unit tests for connectors and infra classes, plus adding the structure shadow class)

### June 25, 2022

Adding Connectors to the game will allow the player to connect different modules for colonists to move between them, and to allow certain types of resources to be transfered between modules. Although the actual uses for these abilities will be addressed in subsequent chapters, it will be the goal of this chapter to set up all of the systems needed for placing connectors on the map, and keeping track of them with the Infrastructure class. This includes, of course, ensuring that Connector data is added to the save/load game system and thoroughly tested for proper integration and backwards compatibility. It will also be the goal of this chapter to upgrade the Infrastructure class to begin keeping track of the base's interior structure and systems (such as where all of the modules' floors are, where there are connection points, etc). Actually using this information practically (i.e. having the colonists begin to be able to walk on floors and use ladders, or pass resources between modules through pipes and ducts) is, again, out of the scope of this chapter. We will also be making heavy use of unit testing here, creating testable data classes for both the Infra and Connector classes, as well as creating the new mouseShadow class using the same type of architecture.

Exit Criteria:

- [DONE] The player can select a Connector from the sidebar and click on the map to create a shadow representing its start point
- The player can click on another point on the map to specify the Connector's endpoint; the Connector is placed when this happens
- The player can cancel placement at any time by pressing the sidebar's 'back' button, or by hitting Escape
- When placing a Connector's terminus, the mouse shadow shows a preview of the segment/s that will be created
- [DONE] When placing any Connector or Module, the mouse cursor will change colour based on whether or not a location is valid
- Some Connectors are only horizontal or only vertical, and have only one segment when placed
- Some Connectors are horizontal AND vertical, and can be placed as two segments, forming an L-shape.
- The Connectors component data is its own class, and has at least 1 meaningful unit test
- [DONE] The Infrastructure component data is its own class, and has at least 1 meaningful unit test
- The MouseShadow component's data is its own class, and has at least 1 meaningful unit test
- The Infrastructure class will contain a list of 'floors', representing the surfaces within the base on which colonists can walk
- The Infrastructure class will contain another list of 'connections', representing links between different floors or modules
- Ensure all backwards compatibility with older saves (saves with obsolete connector data should simply disregard it)

Features Added:

- Infrastructure class has several of its methods in a unit-testable InfrastructureData class.
- Mouse Shadow class calculates building placement validity and changes colour accordingly.

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

### 25. Make a unit test for the Connector master placement test function.

### 98. Alter the ConnectorInfo class to contain just a few shapes to be rendered by the Connector class's (newly isolated) rendering methods.

### 99. Fix the BuildingChip component's cost calculation (located in the render block, of all places) to ensure it is workings are transparent and its readout correct (neither is currently the case).

## Chapter Y: Tools (Difficulty Estimate: ???)

Creating assets with P5 is very difficult right now; create an interface that will allow the creation of visual assets for new Modules and Connectors.

## Chapter Z: Environments (Difficulty Estimate: ???)

As the game matures, it will be more and more desirable to separate features that are used in development - console logs, test structures, in-game information displays, etc - from the production version of the game. We've already got an environment variable that the game's code can detect, so it would be possible to enable certain features only in a development environment, and then in a separate 'staging' environment it would be possible to preview the actual game experience.

### Bug List (Severity in square brackets):

### 1. [2: UX] When the in-game menu is opened then closed, it resets the engine's offset to be back in the middle of the map. The offset value should persist between menu openings.

2. [8: Major gameplay issue] Ensure buildings cannot be placed BELOW the game's screen area (and by extension, that no map actions are permitted outside the map area).

### 3. [5: UX / Minor gameplay issue] At some, but not all x-offset values, the building shadow (and subsequent placement) pulls to the left, to the point that the cursor is outside the designated build area by what appears to be up to a full grid space.

### 4. [1: UX / Inaccurate info display] Save game dates seem to be from a different time zone?!

### 5. [3: UX / Inaccurate info display] Economy save data should really include the previous value/rate of change numbers so the player doesn't have to wait an hour for an Economy update. Also, consider how to show rates of change that occur less frequently than every hour (like colonist meals).

### 6. [1: UX / Animation glitch] When the game speed is adjusted, it can cause moving colonists' animations to fly apart for a moment. Add a command for the Engine when the time speed is changed to immediately halt all colonist animations (the Engine should call a Population-level function that tells the individual colonists to reset their animation frame counts). Bonus if they can switch to the new animation speed on the fly rather than simply showing nothing until the next movement.

### 7. [1: Coding Convention] Colonist class should have a unique ID field, to individuate the colony's population.

### 8. [1: UX / Aesthetic] When a modal popup has more than one possible resolution, the buttons for the different resolutions aren't symmetrically aligned on the horizontal axis (they are pulled slightly to the right it seems).

### 9. [2: UX / Inaccurate info display] The game speed indicator should always be visible, including at the game start, and when the player returns to the game from the menu.

### 10. [1: UX / Gameplay] Restrict the base's baseVolume area to only include modules that have the pressurized trait set to true. This would limit the ability to build certain connectors starting or ending in such modules (and potentially have other cool consequences too).

### Exit Criteria for backend save/load game chapter:

- [DONE]It is possible to create a new saved game file for a given user.
- It is possible to update a saved game file for a given user.
- [DONE]It is possible to retrieve a list of saved games for a given user.
- [DONE]It is possible to retrieve all of the game data for a specific saved game file.

## Chapter XX: DevOps Interlude and First Deployment! (Aim to complete deployment by June of 2022)

- Dev mode environment variable enables some information displays in the world screen area
- Unit tests for in-game functionality (challenge yourself to think of and implement a unit test that's actually useful!)
- Build/test pipeline update
- Directory structure for frontend components before they get totally out of hand
- Deploy the backend to Heroku??
