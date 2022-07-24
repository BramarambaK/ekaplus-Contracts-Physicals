import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ContractsComponent } from './contracts.component';

describe('ContractsComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        ContractsComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ContractsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'contractsUI'`, () => {
    const fixture = TestBed.createComponent(ContractsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('contractsUI');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(ContractsComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to contractsUI!');
  });
});
