import { Component, OnInit } from '@angular/core';
import {ChallengeService, Challenge, ChallengeTypes} from '../../../services/challenges/challenge-service.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AnalyticsService, Analytics, Sessions  } from 'src/app/services/analyticsService.service';
import * as firebase from 'firebase/app';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {ExpandableComponent} from '../../../components/expandable/expandable.component';


@Component({
    selector: 'app-forum',
    templateUrl: './viewChallenge.page.html',
    styleUrls: ['./viewChallenge.page.scss'],
})

export class ViewChallengePage implements OnInit {
    challenge: Challenge = {
        title: '',
        description: '',
        type: '',
        length: 0,
        coverPicture: '',
        contents: []
    };
    constructor(private challengeService: ChallengeService,
                private storage: Storage,
                private router: Router,
                private afs: AngularFirestore,
                private analyticsService: AnalyticsService,
                private alertController: AlertController,
                private activatedRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.storage.get('authenticated').then((val) => {
            if (val === 'false') {
                this.router.navigate(['/login/']);
            }
        });
    }

    ionViewWillEnter() {
// gets the id of the survey
        const id = this.activatedRoute.snapshot.paramMap.get('id');

        // if the id exists, meaning that this is an already existing survey, get the corresponding
        // survey and assign it to the Survey object delcared above
        if (id) {
            this.challengeService.getChallenge(id).subscribe(challenge => {
                this.challenge = challenge;
                console.log(this.challenge);
            });
        }
    }
}
