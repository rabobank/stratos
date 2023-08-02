import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MultilineTitleComponent } from './multiline-title.component';

describe('MultilineTitleComponent', () => {
  let component: MultilineTitleComponent;
  let fixture: ComponentFixture<MultilineTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultilineTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultilineTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
