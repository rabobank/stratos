import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabNavService } from '../../../../../../core/src/tab-nav.service';
import {
  generateCfActiveRouteMock,
  generateCfBaseTestModules,
} from '../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { InviteUsersCreateComponent } from './invite-users-create/invite-users-create.component';
import { InviteUsersComponent } from './invite-users.component';

describe('InviteUsersComponent', () => {
  let component: InviteUsersComponent;
  let fixture: ComponentFixture<InviteUsersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        InviteUsersComponent,
        InviteUsersCreateComponent
      ],
      imports: generateCfBaseTestModules(),
      providers: [
        generateCfActiveRouteMock(),
        HttpClient,
        HttpHandler,
        TabNavService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
