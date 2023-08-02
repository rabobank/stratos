import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabNavService } from '../../../../../../../../../core/src/tab-nav.service';
import {
  generateActiveRouteCfOrgSpaceMock,
  generateCfBaseTestModules,
} from '../../../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { CloudFoundrySpaceServiceMock } from '../../../../../../../../test-framework/cloud-foundry-space.service.mock';
import {
  CardCfSpaceDetailsComponent,
} from '../../../../../../../shared/components/cards/card-cf-space-details/card-cf-space-details.component';
import { CfUserService } from '../../../../../../../shared/data-services/cf-user.service';
import {
  CfUserPermissionDirective,
} from '../../../../../../../shared/directives/cf-user-permission/cf-user-permission.directive';
import {
  CloudFoundryUserProvidedServicesService,
} from '../../../../../../../shared/services/cloud-foundry-user-provided-services.service';
import { CardCfRecentAppsComponent } from '../../../../../../home/card-cf-recent-apps/card-cf-recent-apps.component';
import {
  CompactAppCardComponent,
} from '../../../../../../home/card-cf-recent-apps/compact-app-card/compact-app-card.component';
import { CloudFoundryEndpointService } from '../../../../../services/cloud-foundry-endpoint.service';
import { CloudFoundryOrganizationService } from '../../../../../services/cloud-foundry-organization.service';
import { CloudFoundrySpaceService } from '../../../../../services/cloud-foundry-space.service';
import { CloudFoundrySpaceSummaryComponent } from './cloud-foundry-space-summary.component';

describe('CloudFoundrySpaceSummaryComponent', () => {
  let component: CloudFoundrySpaceSummaryComponent;
  let fixture: ComponentFixture<CloudFoundrySpaceSummaryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CloudFoundrySpaceSummaryComponent,
        CardCfSpaceDetailsComponent,
        CardCfRecentAppsComponent,
        CompactAppCardComponent,
        CfUserPermissionDirective
      ],
      imports: generateCfBaseTestModules(),
      providers: [
        generateActiveRouteCfOrgSpaceMock(),
        CloudFoundryEndpointService,
        { provide: CloudFoundrySpaceService, useClass: CloudFoundrySpaceServiceMock },
        CloudFoundryOrganizationService,
        TabNavService,
        CfUserService,
        CloudFoundryUserProvidedServicesService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudFoundrySpaceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
