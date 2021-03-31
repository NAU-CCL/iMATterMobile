import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewChallengePage } from './viewChallenge.page';

describe('ViewChallengePage', () => {
    let component: ViewChallengePage;
    let fixture: ComponentFixture<ViewChallengePage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ ViewChallengePage ],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ViewChallengePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
