import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[listHost]',
})
export class ListHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
