import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-details-card',
  templateUrl: './details-card.component.html',
  styleUrls: ['./details-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DetailsCardComponent {
  @Input()
  title: string;

  @Input()
  busy: boolean;
}
