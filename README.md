## MOU Data

This directory contains scripts to help retrieve data from
the [Minnesota Ornithologists' Union Website](https://moumn.org)
leveraging Puppeteer to automate web browser actions.

## Setup

This project is written in TypeScript and runs in Node.js. Please read thoroughly.
Note that I am doing this on Linux, so if you're on Windows or Mac, your specific steps may be slightly different.
I'm happy to answer questions, but if the answer is found in the README, I may just refer you back here. At some point I
would like
to package this up better (single executable), but for now this is a personal project that I'm sharing.
Those that some technical/programming experience will likely have an easier time getting this set up as it exists today.

1. Clone this project
2. Install NVM (Node Version Manager), see https://github.com/nvm-sh/nvm
    1. Some easier instructions (for Linux/Mac/Windows)
       here: https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/
3. At a terminal in this (`mou-data`) directory, execute `nvm install $(cat .nvmrc)` to install the correct Node version
4. `nvm use` to switch to that Node version
5. Run `npm install` to install the project dependencies
6. Copy the sample general .env file: `cp mou-data/sample.mou.env .mou.env`
7. Edit the `.mou.env` file with your MOU login credentials.

### RQD Data Script

The `rqd-data` script retrieves the casuals, accidentals and rare RQD records from the [MOU website](https://moumn.org/cgi-bin/rqd.pl) after a specified
submitted (not observation!) date, and outputs a CSV file.

At the terminal in the `mou-data` directory, run the following command to see the available options:

```
   npm run rqd-data -- --help 
```

For example, to retrieve RQD data submitted after January 1, 2026, run:

```
   npm run rqd-data -- -d 2026-01-01
```

The above will output a csv file named rqd-records-2026-01-01.csv in the current directory.