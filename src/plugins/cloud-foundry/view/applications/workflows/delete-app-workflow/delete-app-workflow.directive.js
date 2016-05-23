(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications')
    .directive('deleteAppWorkflow', deleteAppWorkflow);

  deleteAppWorkflow.$inject = [];

  /**
   * @memberof cloud-foundry.view.applications
   * @name deleteAppWorkflow
   * @description An delete-app-workflow directive
   * @returns {object} The delete-app-workflow directive definition object
   */
  function deleteAppWorkflow() {
    return {
      controller: DeleteAppWorkflowController,
      controllerAs: 'deleteAppWorkflowCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/delete-app-workflow.html'
    };
  }

  DeleteAppWorkflowController.$inject = [
    'app.model.modelManager',
    'app.event.eventService',
    '$q'
  ];

  /**
   * @memberof cloud-foundry.view.applications
   * @name DeleteAppWorkflowController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.event.eventService} eventService - the Event management service
   * @param {object} $q - angular $q service
   * @property {app.event.eventService} eventService - the Event management service
   * @property {object} $q - angular $q service
   * @property {object} appModel - the Cloud Foundry applications model
   * @property {object} routeModel - the Cloud Foundry route model
   * @property {object} serviceBindingModel - the Cloud Foundry service binding model
   * @property {boolean} deletingApplication - a flag indicating if the workflow in progress
   * @property {object} data - a data bag
   * @property {object} userInput - user's input about new application
   */
  function DeleteAppWorkflowController(modelManager, eventService, $q) {
    var that = this;

    this.eventService = eventService;
    this.$q = $q;
    this.appModel = modelManager.retrieve('cloud-foundry.model.application');
    this.routeModel = modelManager.retrieve('cloud-foundry.model.route');
    this.serviceBindingModel = modelManager.retrieve('cloud-foundry.model.service-binding');
    this.deletingApplication = false;

    this.eventService.$on('cf.events.START_DELETE_APP_WORKFLOW', function () {
      that.startWorkflow();
    });
  }

  angular.extend(DeleteAppWorkflowController.prototype, {
    reset: function () {
      var that = this;
      var path = 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/';
      this.data = {};
      this.userInput = {
        checkedRouteValue: _.keyBy(this.appModel.application.summary.routes, 'guid'),
        checkedServiceValue: _.keyBy(this.appModel.application.summary.services, 'guid')
      };

      this.data.workflow = {
        allowCancelAtLastStep: true,
        title: gettext('Delete App, Pipeline, and Selected Items'),
        hideStepNavStack: true,
        steps: [
          {
            templateUrl: path + 'delete-services-and-routes.html',
            nextBtnText: gettext('Delete app and associated items'),
            isLastStep: true
          }
        ]
      };

      this.options = {
        workflow: that.data.workflow,
        userInput: this.userInput,
        appModel: this.appModel
      };

      this.deleteApplicationActions = {
        stop: function () {
          that.stopWorkflow();
        },

        finish: function () {
          that.finishWorkflow();
        }
      };
    },

    /**
     * @function deleteApp
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an application
     */
    deleteApp: function () {
      var that = this;
      return this.$q.all([
        this.removeAppFromRoutes().then(function () {
          return that.tryDeleteEachRoute();
        }),
        this.deleteServiceBindings(),
        this.appModel.deleteApp(this.appModel.application.summary.guid)
      ]);
    },

    /**
     * @function removeAppFromRoutes
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description remove app from all the routes
     */

    removeAppFromRoutes: function () {
      var that = this;
      var tasks = [];
      var checkedRouteValue = this.userInput.checkedRouteValue;
      var appGuid = this.appModel.application.summary.guid;

      Object.keys(checkedRouteValue).forEach(function (guid) {
        if (checkedRouteValue[guid]) {
          tasks.push(that.removeAppFromRoutes(guid, appGuid));
        }
      });

      return this.$q.all(tasks);
    },

    /**
     * @function deleteServiceBindings
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete all service binding for the app
     */
    deleteServiceBindings: function () {
      var that = this;
      var tasks = [];
      var checkedServiceValue = this.userInput.checkedServiceValue;

      Object.keys(checkedServiceValue).forEach(function (guid) {
        if (checkedServiceValue[guid]) {
          tasks.push(that.serviceBindingModel.deleteServiceBinding(guid, { async: true }));
        }
      });

      return this.$q.all(tasks);
    },

    /**
     * @function deleteRouteIfPossible
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an route if possible
     */
    deleteRouteIfPossible: function (routeId) {
      var that = this;
      return this.$q(function (resolve, reject) {
        that.routeModel.listAllAppsForRouteWithoutStore(routeId)
          .then(function (apps) {
            if (apps.length === 0) {
              that.routeModel.deleteRoute(routeId).then(resolve, reject);
            } else {
              reject();
            }
          });
      });
    },

    /**
     * @function tryDeleteEachRoute
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description try delete each route associated with the application
     */
    tryDeleteEachRoute: function () {
      var that = this;
      var tasks = [];
      var checkedRouteValue = this.userInput.checkedRouteValue;

      Object.keys(checkedRouteValue).forEach(function (routeId) {
        if (checkedRouteValue[routeId]) {
          tasks.push(that.deleteRouteIfPossible(routeId));
        }
      });

      return this.$q.all(tasks);
    },

    /**
     * @function startWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description start workflow
     */
    startWorkflow: function () {
      this.deletingApplication = true;
      this.reset();
    },

    /**
     * @function stopWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description stop workflow
     */
    stopWorkflow: function () {
      this.deletingApplication = false;
    },

    /**
     * @function finishWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description finish workflow
     */
    finishWorkflow: function () {
      var that = this;
      this.deleteApp().then(function () {
        that.deletingApplication = false;
        that.eventService.$emit(that.eventService.events.REDIRECT, 'cf.applications.list.gallery-view');
      });
    }
  });

})();
