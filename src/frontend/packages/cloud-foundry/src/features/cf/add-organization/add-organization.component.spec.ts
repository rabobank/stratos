import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabNavService } from '../../../../../core/src/tab-nav.service';
import { generateCfBaseTestModules } from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { AddOrganizationComponent } from './add-organization.component';
import { CreateOrganizationStepComponent } from './create-organization-step/create-organization-step.component';

describe('AddOrganizationComponent', () => {
  let component: AddOrganizationComponent;
  let fixture: ComponentFixture<AddOrganizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddOrganizationComponent, CreateOrganizationStepComponent],
      imports: generateCfBaseTestModules(),
      providers: [TabNavService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
