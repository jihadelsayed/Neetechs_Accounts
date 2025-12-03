import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-sign-out",
  templateUrl: "./sign-out.component.html",
  styleUrls: ["./sign-out.component.scss"],
})
export class SignOutComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  host: any;
  pathname: any;
  language: any;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      /**
       * Phase 1 auth cleanup: the accounts portal now centralizes its logout
       * behaviour.  When the sign‑out component initializes in the browser
       * environment it performs the following steps:
       *   1. Remove the single source of truth keys (`userToken`, `UserInfo`).
       *      We intentionally leave `darkMode` alone so user preferences
       *      persist across sessions.  We also clear any legacy keys that
       *      might still exist for safety.
       *   2. Expire cookies on the root domain so other subdomains
       *      (neetechs.com, myaccount.neetechs.com) do not automatically
       *      resurrect the session.
       *   3. If this page is running inside an iframe, send a postMessage
       *      to the parent window to notify it of the logout.  This allows
       *      the parent site to clear its own storage and react accordingly.
       *   4. Redirect the browser to the host passed in via the query
       *      string.  If no host is provided, default to neetechs.com.
       */
      const keysToClear = ['userToken', 'UserInfo'];
      keysToClear.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      });
      // Also clear some known legacy keys for good measure
      ['token', 'accessToken', 'apiKey', 'roles', 'userInfo'].forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {
          /* ignore */
        }
      });

      // Expire cookies at the root domain.  We include both userToken and
      // UserInfo to be thorough.  The expires date in the past ensures
      // browsers remove them immediately.
      document.cookie =
        'userToken=; domain=.neetechs.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      document.cookie =
        'UserInfo=; domain=.neetechs.com; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      // Notify the parent window (if any) that we have logged out.  The
      // AuthorizationComponent in the parent listens for this and cleans
      // up its own storage.  Only send the message if we are actually
      // nested in a parent to avoid unintended cross‑window messages.
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'logout' }, '*');
        }
      } catch {
        // ignore errors if postMessage fails
      }

      // Determine the final destination based on query parameters.  The
      // accounts app expects `host` and `pathname` in the URL so it can
      // return the user to where they came from.  If neither exists,
      // fallback to the top‑level domain.
      const params = this.route.snapshot.queryParams;
      const redirectHost: string | undefined = params['host'];
      const redirectPath: string | undefined = params['pathname'];
      let destination: string;
      if (redirectHost) {
        destination = `https://${redirectHost}${redirectPath || ''}`;
      } else {
        destination = 'https://neetechs.com/';
      }
      window.location.href = destination;
    }
  }
}
