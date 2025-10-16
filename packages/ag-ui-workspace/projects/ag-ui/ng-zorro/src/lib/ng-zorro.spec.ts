import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgZorro } from './ng-zorro';

describe('NgZorro', () => {
  let component: NgZorro;
  let fixture: ComponentFixture<NgZorro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgZorro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgZorro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
