---
id: introduction
title: Introduction
sidebar_label: Introduction 
---

Stratos is an Open Source Web-based UI for Cloud Foundry.

For Cloud Foundry, it allows users and administrators to both manage applications running in the Cloud Foundry cluster and perform cluster management tasks.

![Stratos Application view](/images/screenshots/app-summary.png)

## Quick Start

To get started quickly, we recommend following the steps to deploy the Stratos Console as a Cloud Foundry Application - see [here](deploy/cloud-foundry/cloud-foundry).

If you have [docker](https://www.docker.com/community-edition) installed, you can quickly deploy Stratos using the all-in-one container:

```
$ docker run -p 5443:5443 splatform/stratos:stable
```

Once that has finished, you can then access Stratos by visiting https://localhost:5443.

## Deploying Stratos

Stratos can be deployed in the following environments:

1. Cloud Foundry, as an application. See [guide](deploy/cloud-foundry/cloud-foundry)
3. Docker, single container deploying all components. See [guide](deploy/all-in-one)

## Troubleshooting

Please see our [Troubleshooting](deploy/troubleshooting) page.

## Further Reading
 
Get an [Overview](overview.md) of Stratos, its components and the different ways in which it can be deployed.

Browse through features and issues in the project's [issues](https://github.com/cloudfoundry/stratos/issues) page.

What kind of code is in Stratos? We've integrated [Code Climate](https://codeclimate.com) for some code quality and maintainability metrics. Take a stroll around the [project page](https://codeclimate.com/github/cloudfoundry/stratos)

## Contributing

We very much welcome developers who would like to get involved and contribute to the development of the Stratos project. Please refer to the [Contributing guide](developer/contributing.md) for more information.

For information to help getting started with development, please read the [Developer's Guide](developer/introduction).

## Support and feedback

We have a channel (#stratos) on the Cloud Foundy Slack where you can ask questions, get support or give us feedback. We'd love to hear from you if you are using Stratos.

You can join the Cloud Foundry Slack here - https://slack.cloudfoundry.org/  - and then join the #stratos channel.

## License

The work done has been licensed under Apache License 2.0. The license file can be found [here](license).

