import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[chatScrollable]'
})

export class ScrollableDirective {

  // Assign our output property an EventEmitter
  @Output() scrollPosition = new EventEmitter();

  constructor( public el: ElementRef) 
  {

  }

  // Listen to events on the element this directive was applied to. Do something if an ionScroll Element is intercepted.
  @HostListener('ionScroll', ['$event']) async onScroll( event )
  {

    try {

      // Get the actual scroll element so we can get the total height of the scroll element ie visible + nonvisible content.
      const scrollElement = await event.target.getScrollElement();

      const top = event.detail.scrollTop;

      // Now we can get the height of the scroll element. If we just called this.el.nativeElement.scrollHeight we would  alway get the same value as offsetHeight, ie visible container height.
      const height = scrollElement.scrollHeight;

      const offset = this.el.nativeElement.offsetHeight;

      //console.log(`Top ${top} Height ${height} offset ${offset}`)

      if( top > (height - offset - 1) )
      {
        this.scrollPosition.emit('bottom');
      }

      if( top === 0)
      {
        this.scrollPosition.emit('top');
      }
    }
    catch( err ) {}
  }

}
