This Python project contains some utilities to help with [Minnesota Ornithologists' Union](https://moumn.org/) (MOU) data retrieval.
The website is rather dated and has no API, and we can take advantage of its unsophisticated security to pull data using web automation.
Because the data is pulled using [Puppeteer](https://pptr.dev/), it wraps a Node.js application.
You don't have to install Node, since it is bundled in the project as a dependency.

To run:

1. Execute `source ./setup.sh` to set up the virtual environment and install dependencies.
   1. The script must be sourced as shown!
   2. This will install dependencies and run the build for the Node.js portion of the project.
   1. The script will copy the `sample.env` file to `.env`.
   2. It also sets up githooks to update dependencies and rebuild the Node.js portion when code is pulled from the repo.
1. Edit the `.env` file with your MOU login credentials.
2. Then you can run a script using `python mou_data_python/<script_name> [args]`.
   1. For example, to run the RQD data retrieval script: `python mou_data_python/rqd_data.py -h` to see the available options.

See the `mou_data_node` directory for more details on the Node.js portion of the project. 
You can run the Node.js scripts directly if you prefer - the [README](mou_data_node/README.md) in that directory has more information.

For those who are more interested in the technical approach, this project illustrates:

1. Using Puppeteer to log into a website and retrieve data.
2. Wrapping a Node.js application to be used in a Python project.
3. Leveraging Node.js transform streams and async generators to handle a potentially large amount of data while avoiding performance and memory issues.