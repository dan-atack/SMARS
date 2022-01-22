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
- Modal popups display text and have up to two different 'dismiss' buttons, which can produce different outcomes in the game's Engine
- Even though it's not directly related, this chapter will see the introduction of an environment variable for Dev Mode in the game's frontend directory, and an additional Modal popup will appear at the game's start when we're in dev mode (and not when this value is removed).
- Modal popup tells you when a full Smartian day has passed (Dev Mode feature)

1. Create the Modal class (brand new class) to be deployed by the Engine. Have a bit of a think about what its layout will be first, as well as how the Engine will know when to show you one, what its handler/s will be, etc.

2. Create a new method for the Engine, generateEvent, to be called each hour by the clock advance method. Have it take an optional number argument, which will be the percentage probability of firing an event. If it is called with no arguments it should take that as a signal to fire an event from a sequential list; if it gets the probability argument then it should only fire if a random number falls within the range of likelihood, and take an event from a different list.

### 3. Create new game constants lists: random events and scheduled events, to be called by the Engine. Events in both lists should have:

- A title
- A caption/text
- A unique ID number
- A one-item list of "resolutions" that will come to represent the various options for events where the player has to choose between different outcomes (multiple outcomes are outside the scope of this ticket but it's worth preparing for them now)

### 4. Have the Engine console log the title of a scheduled event at 1:00AM on the first day.

### 5. Have the Engine console log the title of a random event (with 50% odds) by calling the random event generator once every hour until it fires.

## Chapter X: Loading Games (Forecast now says it'll be chapter 18...)

### Exit Criteria for backend save game chapter:

- It is possible to create a new saved game file for a given user.
- It is possible to update a saved game file for a given user.
- It is possible to retrieve a list of saved games for a given user.
- It is possible to retrieve all of the game data for a specific saved game file.

## Chapter XX: DevOps Interlude (Forecast says sooner is better... do item one as soon as time-keeping is finished)

- Dev mode environment variable enables some information displays in the world screen area
- Unit tests for in-game functionality (challenge yourself to think of and implement a unit test that's actually useful!)
- Build/test pipeline update
- Directory structure for frontend components before they get totally out of hand
- Deploy the backend to Heroku??
