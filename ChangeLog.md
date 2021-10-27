# The Saga of SMARS

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
