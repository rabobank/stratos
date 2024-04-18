// This file is required by karma.conf.js and loads recursively all the .spec and framework files
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

import { APP_BASE_HREF } from '@angular/common';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
const testBed = getTestBed();
testBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);

beforeEach(() => {
  testBed.configureTestingModule({
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
  });
});

/**
 * Bump up the Jasmine timeout from 5 seconds
 */
beforeAll(() => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
});
