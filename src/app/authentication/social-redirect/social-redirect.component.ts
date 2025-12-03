import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: 'app-social-redirect',
  template: '<p>Redirecting...</p>',
})
export class SocialRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (!isPlatformBrowser(this.platformId)) return;
      const token = params['token'];
      const user = JSON.parse(atob(params['user'] || 'e30='));

      if (token) {
        localStorage.setItem('userToken', token);
        localStorage.setItem('UserInfo', JSON.stringify(user));
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
