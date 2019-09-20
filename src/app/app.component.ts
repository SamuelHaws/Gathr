import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Gathr';

  constructor(private router: Router) {}

  isGroupRouteActivated() {
    console.log(this.router.url);
    return this.router.url.includes('/group/');
  }
}
