import {
  Component,
  AfterContentInit,
  Input,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TileComponent implements AfterContentInit {
  @Input() size: string;

  @HostBinding('class.app-tile-1-3') private isOneThirdFixed = false;

  ngAfterContentInit() {
    if (this.size) {
      if (this.size === '1of3') {
        this.isOneThirdFixed = true;
      }
    }
  }
}
