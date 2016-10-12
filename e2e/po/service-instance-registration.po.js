'use strict';

// Service instances registration helpers
var helpers = require('./helpers.po');
var loginPage = require('./login-page.po');
var navbar = require('./navbar.po');
var credentialsFormName = 'credentialsFormCtrl.credentialsForm';

module.exports = {

  registrationOverlay: registrationOverlay,
  serviceInstancesTable: serviceInstancesTable,
  connectLink: connectLink,
  disconnectLink: disconnectLink,
  doneButton: doneButton,
  connect: connect,
  disconnect: disconnect,
  completeRegistration: completeRegistration,
  registrationNotification: registrationNotification,
  serviceInstanceStatus: serviceInstanceStatus,

  credentialsForm: credentialsForm,
  credentialsFormFields: credentialsFormFields,
  connectButton: registerButton,
  cancel: cancel,
  fillCredentialsForm: fillCredentialsForm,
  registerServiceInstance: registerServiceInstance
};

function registrationOverlay() {
  return element(by.id('registration-overlay')).element(by.css('.service-registration'));
}

function serviceInstancesTable() {
  return element(by.css('service-registration')).element(by.css('table'));
}

function connectLink(rowIndex) {
  return helpers.getTableRowAt(serviceInstancesTable(), rowIndex)
    .element(by.css('[ng-click="serviceRegistrationCtrl.connect(cnsi)"]'));
}

function disconnectLink(rowIndex) {
  return helpers.getTableRowAt(serviceInstancesTable(), rowIndex)
    .element(by.css('[ng-click="serviceRegistrationCtrl.disconnect(serviceRegistrationCtrl.userCnsiModel.serviceInstances[cnsi.guid])"]'));
}

function connect(rowIndex) {
  return connectLink(rowIndex).click().then(function () {
    return browser.driver.sleep(2000);
  });
}

function disconnect(rowIndex) {
  return disconnectLink(rowIndex).click();
}

function doneButton() {
  return registrationOverlay().element(by.css('.fixed-footer button'));
}

function completeRegistration() {
  return doneButton().click();
}

function serviceInstanceStatus(rowIndex, statusClass) {
  return helpers.getTableCellAt(serviceInstancesTable(), rowIndex, 0)
    .element(by.css('.' + statusClass));
}

function registrationNotification() {
  return registrationOverlay().element(by.css('.fixed-footer .registration-notification'));
}

/**
 * Credentials Form page objects
 */
function credentialsForm() {
  return element(by.id('registration-overlay')).element(by.css('flyout'))
    .element(by.css('form[name="' + credentialsFormName + '"]'));
}

function credentialsFormFields() {
  return helpers.getFormFields(credentialsFormName);
}

function registerButton() {
  return helpers.getForm(credentialsFormName)
    .element(by.buttonText('Connect'));
}

function cancel() {
  helpers.getForm(credentialsFormName)
    .element(by.buttonText('Cancel')).click();
  browser.driver.sleep(2000);
}

function fillCredentialsForm(username, password) {
  var fields = credentialsFormFields();
  fields.get(2).clear();
  fields.get(3).clear();
  fields.get(2).sendKeys(username || '');
  fields.get(3).sendKeys(password || '');
}

function registerServiceInstance() {
  return registerButton().click().then(function () {
    return browser.driver.sleep(1000);
  });
}
