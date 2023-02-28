import { CfUserTableTestLevel, setupCfUserTableTests } from '../users-list-e2e.helper';
import { CfTopLevelPage } from './cf-top-level-page.po';
import {CfOrgLevelPage} from '../org-level/cf-org-level-page.po';

describe('Cf Users List -', () => {
  // NDT - The following is not correct by its name, i.e. it does not list all cf users, but  the list is too long
  //       So we need to get a smaller list, i.e. the list of the org
  setupCfUserTableTests(CfUserTableTestLevel.Org, (cfGuid, orgGuid) => {
    // const cfPage = CfTopLevelPage.forEndpoint(cfGuid);
    const cfPage = CfOrgLevelPage.forEndpoint(cfGuid, orgGuid);

    cfPage.navigateTo();
    cfPage.waitForPageOrChildPage();
    cfPage.loadingIndicator.waitUntilNotShown();
    return cfPage.goToUsersTab();
  });
});
