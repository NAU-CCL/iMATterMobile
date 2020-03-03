import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecoveryCodePage } from './recovery-code.page';

describe('RecoveryCodePage', () => {
  let component: RecoveryCodePage;
  let fixture: ComponentFixture<RecoveryCodePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoveryCodePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecoveryCodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
