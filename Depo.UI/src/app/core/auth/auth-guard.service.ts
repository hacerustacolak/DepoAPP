import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';
@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public authService: AuthenticationService, public router: Router) {}
  canActivate(): boolean {
    if (!this.authService.isAuthorized()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}