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

22. For some reason, it appears that adding Typescript to the project somehow removed all of the previously added dependencies... Re-install those with NPM and then boot it up... Success! We're listening on port 7000, although not much else happens at this stage. Still, a triumphant git push seems in order notwithstanding.
