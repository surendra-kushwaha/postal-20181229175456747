## How to debug

In order to run the app with V8 inspector enabled, simply run the server in debug mode `yarn run debug` and use Visual Studio Code's debugger to attach to the running process.

## Deploying to IBM cloud

The best way to deploy the project is to build a DevOps toolchain with the ['Build your own toolchain' template](https://console.bluemix.net/devops/create). Add the Repo tool to your toolchain so that it knows where you code is stored and add a 'Delivery Pipeline' integration tool.

### Delivery Pipeline

When working with Devliery Pipeline, it's always best practice to have 2 versions of your app.

1. A development deploy where the latest changes are introduced for testing. This 'staging' deploy is used mainly for developers and project managers for testing and feedback purposes.

2. A production deploy where the stable application is hosted. This deploy will have tested features and is to be considered stable and ready to show to the client for feedback.

Each deploy will come in 3 stages: Build, Test and Deploy. For more information on the scripts needed for each stage, see the [deploy](./deploy) folder.

1. Build. It installs the needed dependencies and builds the project.

2. Test. It runs Jest and performs all unit, integration and smoke tests.

3. Deploy. Deploys app to IBM Cloud.
