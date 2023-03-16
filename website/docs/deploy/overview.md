---
id: overview
title: Deploying Stratos
sidebar_label: Overview
---

## Deployment Types

Stratos can be deployed in the following environments:

1. Cloud Foundry, as an application. See [guide](cloud-foundry/cloud-foundry)
3. Docker, single container deploying all components. See [guide](all-in-one)

:::note
Not all features are enabled in every environment.
:::

### Deployed in Cloud Foundry as an application

In this case, Stratos is deployed in a manner optimized for the management of a single Cloud Foundry instance.

For more information see the [guide](cloud-foundry/cloud-foundry).

### Deployed in Docker using a single container

In this case, a single Docker image is run in a container that hosts all services together. SQLite is used as the database, so any endpoint metadata registered is lost when the container is destroyed.

This deployment is recommended only for trying out the Console and for development.

## Enable/Disable Features

:::note
Some features are marked as 'Tech Preview' and are only available if tech preview features are enabled when deploying. See the [Tech Preview](tech-preview) section for more information.
:::

Frontend Packages and Backend Plugins can be removed at build time, see [here](../extensions/disable-packages) for more information.
