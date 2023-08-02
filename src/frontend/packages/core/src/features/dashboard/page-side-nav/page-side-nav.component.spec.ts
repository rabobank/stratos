import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EntityMonitorFactory } from '../../../../../store/src/monitors/entity-monitor.factory.service';
import { BaseTestModulesNoShared } from '../../../../test-framework/core-test.helper';
import { TabNavService } from '../../../tab-nav.service';
import { PageSideNavComponent } from './page-side-nav.component';

describe('PageSideNavComponent', () => {
  let component: PageSideNavComponent;
  let fixture: ComponentFixture<PageSideNavComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BaseTestModulesNoShared],
      declarations: [PageSideNavComponent],
      providers: [TabNavService, EntityMonitorFactory]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
