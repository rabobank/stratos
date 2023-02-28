import { CfRolesRemovalLevel, CfUserRemovalTestLevel, setupCfUserRemovalTests } from '../users-removal-e2e.helper';
import { CfTopLevelPage } from './cf-top-level-page.po';
import {CfOrgLevelPage} from '../org-level/cf-org-level-page.po';

describe('CF - Remove user roles (only spaces)', () => {
  setupCfUserRemovalTests(CfUserRemovalTestLevel.Cf, CfRolesRemovalLevel.Spaces, (cfGuid, orgGuid) => {
    // const cfPage = CfTopLevelPage.forEndpoint(cfGuid);
    const cfPage = CfOrgLevelPage.forEndpoint(cfGuid, orgGuid);
    cfPage.navigateTo();
    cfPage.waitForPageOrChildPage();
    cfPage.loadingIndicator.waitUntilNotShown();
    return cfPage.goToUsersTab();
  });
});

describe('CF - Remove user roles (only orgs / spaces already gone)', () => {
  setupCfUserRemovalTests(CfUserRemovalTestLevel.Cf, CfRolesRemovalLevel.OrgsSpaces, (cfGuid, orgGuid) => {
    // const cfPage = CfTopLevelPage.forEndpoint(cfGuid);
    const cfPage = CfOrgLevelPage.forEndpoint(cfGuid, orgGuid);
    cfPage.navigateTo();
    cfPage.waitForPageOrChildPage();
    cfPage.loadingIndicator.waitUntilNotShown();
    return cfPage.goToUsersTab();
  });
});
