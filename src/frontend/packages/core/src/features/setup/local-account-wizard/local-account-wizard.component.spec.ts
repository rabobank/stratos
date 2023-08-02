import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { createEmptyStoreModule } from '@stratosui/store/testing';

import { CoreModule } from '../../../core/core.module';
import { MDAppModule } from '../../../core/md.module';
import { CurrentUserPermissionsService } from '../../../core/permissions/current-user-permissions.service';
import { PageHeaderModule } from '../../../shared/components/page-header/page-header.module';
import { SharedModule } from '../../../shared/shared.module';
import { TabNavService } from '../../../tab-nav.service';
import { SetupModule } from '../setup.module';
import { LocalAccountWizardComponent } from './local-account-wizard.component';

describe('LocalAccountWizardComponent', () => {
  let component: LocalAccountWizardComponent;
  let fixture: ComponentFixture<LocalAccountWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule,
        SharedModule,
        SetupModule,
        RouterTestingModule,
        FormsModule,
        PageHeaderModule,
        ReactiveFormsModule,
        MDAppModule,
        createEmptyStoreModule(),
        NoopAnimationsModule,
      ],
      providers: [
        TabNavService,
        CurrentUserPermissionsService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalAccountWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
