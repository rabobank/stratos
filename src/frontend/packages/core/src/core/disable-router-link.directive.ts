import { Directive, Input, Optional } from '@angular/core';
import { RouterLink } from '@angular/router';

@Directive({
  selector: '[routerLink][appDisableRouterLink]'
})
export class DisableRouterLinkDirective {

  @Input() appDisableRouterLink: boolean;

  constructor(
    // Inject routerLink
    @Optional() routerLink: RouterLink,
    @Optional() routerLinkWithHref: RouterLink
  ) {

    const link = routerLink || routerLinkWithHref;

    // Save original method
    const onClick = link.onClick;

    // Replace method
    link.onClick = (...args) => {
      if (this.appDisableRouterLink) {
        return routerLinkWithHref ? false : true;
      } else {
        return onClick.apply(link, args);
      }
    };
  }

}
