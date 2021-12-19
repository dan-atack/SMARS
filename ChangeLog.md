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

Well, the first phase of this chapter was a bit of a freebie, now to start the actual work!

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

## Chapter Seven: Create basic app framework, and make it mobile-friendly (Difficulty Estimate: 6)

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
