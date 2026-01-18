This Python project contains some utilities to help with [Minnesota Ornithologists' Union](https://moumn.org/) (MOU) data retrieval.
Because the data is pulled using [Puppeteer](https://pptr.dev/) web automation, it wraps a Node.js application.
You don't have to install Node, because it is bundled in the project as a dependency.

To run:

1. Copy the sample.env file: `cp sample.env .env`
1. Edit the `.env` file with your MOU login credentials.
1. Execute `source ./setup.sh` to set up the virtual environment and install dependencies.
   1. The script must be sourced as shown!
1. Then you can run the scripts using `python -m mou_data_python/<script_name> [args]`.
   1. For example, to run the RQD data retrieval script: `python mou_data_python/rqd_data -h` to see the available options.`

See the `mou_data_node` directory for more details on the Node.js portion of the project. 
You can run the Node.js scripts directly if you prefer. 
There is a README in that directory with more information.