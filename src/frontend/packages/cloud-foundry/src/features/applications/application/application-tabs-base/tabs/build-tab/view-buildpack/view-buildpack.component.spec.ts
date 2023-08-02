import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewBuildpackComponent } from './view-buildpack.component';

describe('ViewBuildpackComponent', () => {
  let component: ViewBuildpackComponent;
  let fixture: ComponentFixture<ViewBuildpackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewBuildpackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewBuildpackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
