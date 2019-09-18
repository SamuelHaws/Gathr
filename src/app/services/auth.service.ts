import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserUid: string;

  constructor(private afAuth: AngularFireAuth) {}

  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
        userData => {
          this.currentUserUid = userData.user.uid;
          resolve(userData);
        },
        err => reject(err)
      );
    });
  }

  register(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
        userData => {
          this.currentUserUid = userData.user.uid;
          resolve(userData);
        },
        err => reject(err)
      );
    });
  }

  getCurrentUserUid() {
    return this.currentUserUid;
  }

  getAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  // TODO: Implement auth update email, delete account
}
