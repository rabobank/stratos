import { TestBed, inject } from '@angular/core/testing';

import { CfSecurityGroupsListConfigService } from './cf-security-groups-list-config.service';
import { getBaseTestModules } from '../../../../../test-framework/cloud-foundry-endpoint-service.helper';

describe('CfSecurityGroupsListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CfSecurityGroupsListConfigService],
      imports: [...getBaseTestModules]

    });
  });

  it('should be created', inject([CfSecurityGroupsListConfigService], (service: CfSecurityGroupsListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
