import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ForumDeatailsPage } from './forum-deatails.page';

describe('ForumDeatailsPage', () => {
  let component: ForumDeatailsPage;
  let fixture: ComponentFixture<ForumDeatailsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumDeatailsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ForumDeatailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
