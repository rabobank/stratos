import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TokenEndpointComponent } from './token-endpoint.component';

describe('TokenEndpointComponent', () => {
  let component: TokenEndpointComponent;
  let fixture: ComponentFixture<TokenEndpointComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TokenEndpointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
