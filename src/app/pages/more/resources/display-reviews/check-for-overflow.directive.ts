import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appCheckForOverflow]'
})
export class CheckForOverflowDirective {

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef) 
              { }


  



}
