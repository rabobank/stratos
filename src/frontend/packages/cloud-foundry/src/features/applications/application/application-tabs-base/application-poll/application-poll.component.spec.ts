import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { generateTestApplicationServiceProvider } from '../../../../../../test-framework/application-service-helper';
import { generateCfBaseTestModules } from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { ApplicationPollingService } from '../application-polling.service';
import { ApplicationEnvVarsHelper } from '../tabs/build-tab/application-env-vars.service';
import { ApplicationStateService } from './../../../../../shared/services/application-state.service';
import { ApplicationPollComponent } from './application-poll.component';

describe('ApplicationPollComponent', () => {
  let component: ApplicationPollComponent;
  let fixture: ComponentFixture<ApplicationPollComponent>;

  const appId = '1';
  const cfId = '2';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationPollComponent],
      providers: [
        ApplicationPollingService,
        generateTestApplicationServiceProvider(cfId, appId),
        ApplicationEnvVarsHelper,
        ApplicationStateService,
      ],
      imports: generateCfBaseTestModules()
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
