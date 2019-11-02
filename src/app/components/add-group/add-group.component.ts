import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Group } from '../../models/Group';
import { GroupService } from 'src/app/services/group.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.css']
})
export class AddGroupComponent implements OnInit, OnDestroy {
  // activeUserID: string;
  group: Group = {
    groupname: '',
    description: '',
    public: true,
    owner: ''
  };

  authSubscription: Subscription;

  @ViewChild('groupForm', { static: false }) form: any;

  constructor(
    private flashMessage: FlashMessagesService,
    private groupService: GroupService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuth().subscribe(auth => {
      if (auth) {
        this.group.owner = auth.displayName; // get active user username
      } else {
        console.error('NO AUTH ON ADDGROUP');
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }

  // TODO: form validation
  onSubmit({ value, valid }: { value: Group; valid: boolean }) {
    if (!valid) {
      this.flashMessage.show('Form values invalid', {
        cssClass: 'alert-danger',
        timeout: 3500
      });
    } else {
      // Add validated values to this.group
      this.group.groupname = value.groupname;
      this.group.description = value.description;
      // this.group.public = value.public;
      // Add the group to db
      this.groupService.addGroup(this.group).pipe(take(1)).subscribe(added => {
        if (added) {
          // Owner automatically joins
          this.groupService.joinGroup(this.group.groupname, this.group.owner);
          this.flashMessage.show('New group added!', {
            cssClass: 'alert-success',
            timeout: 3500
          });
          this.router.navigate(['/']);
        }
        else {
          this.flashMessage.show(`Group "${this.group.groupname}" already exists.`, {
            cssClass: 'alert-danger',
            timeout: 3500
          });
        }
      });
      
    }
  }
}
