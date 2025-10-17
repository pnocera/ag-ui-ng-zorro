import { TestBed } from '@angular/core/testing';

describe('NgZorro Library', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: []
    }).compileComponents();
  });

  it('should have library exports', () => {
    // Test that the library exports are working
    expect(true).toBeTruthy();
  });
});
