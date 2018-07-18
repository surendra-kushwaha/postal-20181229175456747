# Postal SCM

## Overview
This application demonstrates a starter application to interact with the blockchain network defined for the Postal industry.

The blockchain network is deployed on IBM Blockchain Platform and is created using Hyperledger Fabric technology.

# Description

This application allows users the ability to create and interact at the package and dispatch level with reports that track EMS Event Codes as well as Settlement Status.

A user is able to see both the current shipment and settlement status for a package or dispatch, as well as drill down to see the entire history of EMS Event Scans and Settlement Status updates for a package. 

Currently the application also has an ability to simulate the EMS Event Codes (since we do not have the permission to subscribe to the actual EMS Event Feed) by choosing:
1. Origin Postal
2. Destination Postal
3. Date range where the scans 'occurred'
4. Size of simulation
    1. Small = 10 package
    2. Medium = 75 packages
    3. Large = 1000 packages

# Required Services

This application requires the following:

- Deployed Hyperledger blockchain network (**link to Surendra's documentation here**)
- Mongo database

# Setup Instructions

The setup takes place in three primary steps

1. Download the code
2. Configure the code to connect with your services
3. Deploy the application

## Download the Code

For Accenture employees, the code can be found in Innersource (https://innersource.accenture.com/projects/ACIT/repos/postal-scm/browse)

For non-Accenture employees, please get in touch with your Accenture point of contact to figure out the best way to access this codebase.

1. Clone the app to your local environment from your terminal using the following command:
  `
  git clone https://thomas.i.jacobs@innersource.accenture.com/scm/acit/postal-scm.git
  `
2. `cd postal-scm` into this newly created directory

## Configure the Code

The code configurations are mostly already set up. However if you have created a new Mongo DB or deployed a new blockchain network you will need to point the code in those directions.

### Mongo DB Config
The file containing the mongo DB config can be found at `./src/config/vcap-local.json`

If the Mongo DB is deployed in IBM Cloud then you can find the credentials by viewing the app within the IBM Cloud website.

Otherwise at minimum, update the URI field of the vcap-local file to the location of your database.

### Blockchain network
The file containing the blockchain network config can be found at 

`./config/blockchain_creds1.json` 

To update, just enter the details found in your connection profile from the blockchain network. More details on how to deploy the blockchain network can be found here: **Surendra's docs go here**. 

For more insight on how the network configu is referenced in the application, `blockchain_creds1.json` is referenced in the 

`./config/postalscm.json` 

file that is called by the 

`./utils/helper.js` 

file. The utils folder handles the connection with the blockchain network (amongst other things) and the application's logic can be found in the `./src/lib/postal.js` file.

## Deploy the Code
To run your application on IBM Cloud do the following (deploying on other cloud services would be similar):

1. If you do not already have a Bluemix account, [sign up here](https://console.ng.bluemix.net/registration).
2. Log into Bluemix with your own credentials.
3. Create a new application by clicking on the Create App button on the Bluemix Dashboard.
4. On the left navigation, select Cloud Foundry Apps.
5. Click on the SDK for Node.js option on the right.
6. Enter your unique application name you though of before and click the Create button.
7. Push the application to the cloud
    1. Create manifest.yml file
    ```
    applications:
    - name: GetStartedNode
    random-route: true
    memory: 128M
    ```
    2. [Download](https://console.bluemix.net/docs/cli/reference/bluemix_cli/download_cli.html#install_use) the ibmcloud cli. More info on the ibmcloud CLI can be found [here](https://console.bluemix.net/docs/cli/reference/bluemix_cli/bx_cli.html#bluemix_cli)
    3. Target the org and space where you created the application in step 6. `ibmcloud target --cf`
    4. From the working directory `ibmcloud cf push`


## Run the app locally
1. [Install Node.js][]
2. cd into this project's root directory
3. Run `npm install` to install the app's dependencies
4. Run `npm install -g yarn` to download the yarn package manager
4. Run `yarn build` to build the app's artifacts
5. Run `yarn start` to start the app
6. Access the running app in a browser at <http://localhost:3000>
[Install Node.js]: https://nodejs.org/en/download/