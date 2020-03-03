import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChatInitPage } from './chat-init.page';

describe('ChatInitPage', () => {
  let component: ChatInitPage;
  let fixture: ComponentFixture<ChatInitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatInitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatInitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
