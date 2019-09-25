import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private afAuth: AngularFireAuth) {}

  login(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then(
        userData => {
          resolve(userData);
        },
        err => reject(err)
      );
    });
  }

  register(username: string, email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
        userData => {
          this.afAuth.auth.currentUser.updateProfile({
            displayName: username
          });
          resolve(userData);
        },
        err => reject(err)
      );
    });
  }

  getAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  // TODO: Implement auth update email, delete account
}
