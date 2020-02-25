import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HandleUserPagesPage } from './handle-user-pages.page';

describe('HandleUserPagesPage', () => {
  let component: HandleUserPagesPage;
  let fixture: ComponentFixture<HandleUserPagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HandleUserPagesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HandleUserPagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
