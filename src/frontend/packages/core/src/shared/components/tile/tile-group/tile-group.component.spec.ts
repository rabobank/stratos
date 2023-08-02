import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TileGroupComponent } from './tile-group.component';

describe('TileGroupComponent', () => {
  let component: TileGroupComponent;
  let fixture: ComponentFixture<TileGroupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TileGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
