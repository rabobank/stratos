'use strict';

var navbar = require('./navbar.po');
var helpers = require('../po/helpers.po');

module.exports = {
  showEndpoints: showEndpoints,
  goToEndpoints: goToEndpoints,
  isEndpoints: isEndpoints,
  clickAddClusterInWelcomeMessage: clickAddClusterInWelcomeMessage,
  clickAddClusterInTile: clickAddClusterInTile,
  welcomeMessage: welcomeMessage,
  registerCloudFoundryTile: registerCloudFoundryTile,
  registerCodeEngineTile: registerCodeEngineTile,
  getAddEndpoint: getAddEndpoint,
  hasRegisteredTypes: hasRegisteredTypes,
  getTileStats: getTileStats
};

function showEndpoints() {
  navbar.goToView('Endpoints');
}

function goToEndpoints() {
  return browser.get(helpers.getHost() + '/#/endpoint');
}

function isEndpoints() {
  return browser.getCurrentUrl().then(function (url) {
    return expect(url).toBe(helpers.getHost() + '/#/endpoint');
  });
}

function welcomeMessage() {
  return element(by.id('welcome-message'));
}

function clickAddClusterInWelcomeMessage(serviceType) {
  return element.all(by.css('#welcome-message span.tile-btn')).then(function (links) {
    var clickPromise = serviceType === 'hcf' ? links[0].click() : links[1].click();
    return clickPromise.then(function () {
      return browser.driver.sleep('500');
    });
  });
}

function clickAddClusterInTile(serviceType) {
  return getInstanceTile(serviceType).element(by.linkText('Register An Endpoint')).click().then(function() {
    return browser.driver.sleep('500');
  });
}

function registerCloudFoundryTile() {
  return getInstanceTile('hcf');
}

function registerCodeEngineTile() {
  return getInstanceTile('hce');
}

function getInstanceTile(serviceType) {
  return element(by.css('service-tile[service-type*="' + serviceType + '"]'));
}

function getAddEndpoint() {
  return element(by.css('form[name="form.regForm"]'));
}

function hasRegisteredTypes(serviceType) {
  return getInstanceTile(serviceType).element(by.css('ring-chart')).isPresent();
}

function getTileStats(serviceType) {
  return getInstanceTile(serviceType).all(by.css('ul.ring-chart-labels li')).then(function (listOfLi) {
    var promises = [];
    for (var i = 0; i < listOfLi.length; i++) {
      promises.push(listOfLi[i].element(by.css('.ring-chart-count')).getText().then(function (text) {
        return text;
      }));
    }
    return Promise.all(promises).then(function (result) {
      return result;
    });
  });
}
