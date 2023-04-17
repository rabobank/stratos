import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabNavService } from '../../../../../../../core/src/tab-nav.service';
import {
  generateCfBaseTestModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import {
  CloudFoundryOrganizationServiceMock,
} from '../../../../../../test-framework/cloud-foundry-organization.service.mock';
import { CfUserPermissionDirective } from '../../../../../shared/directives/cf-user-permission/cf-user-permission.directive';
import { CloudFoundryOrganizationService } from '../../../services/cloud-foundry-organization.service';
import { CloudFoundryOrganizationSpacesComponent } from './cloud-foundry-organization-spaces.component';

describe('CloudFoundryOrganizationSpacesComponent', () => {
  let component: CloudFoundryOrganizationSpacesComponent;
  let fixture: ComponentFixture<CloudFoundryOrganizationSpacesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CloudFoundryOrganizationSpacesComponent,
        CfUserPermissionDirective
      ],
      imports: generateCfBaseTestModules(),
      providers: [
        ...generateTestCfEndpointServiceProvider(),
        { provide: CloudFoundryOrganizationService, useClass: CloudFoundryOrganizationServiceMock },
        TabNavService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudFoundryOrganizationSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
