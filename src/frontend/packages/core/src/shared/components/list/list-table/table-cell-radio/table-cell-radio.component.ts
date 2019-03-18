import { Component, Input, OnInit } from '@angular/core';

import { TableCellCustom } from '../../list.types';

@Component({
  selector: 'app-table-cell-radio',
  templateUrl: './table-cell-radio.component.html',
  styleUrls: ['./table-cell-radio.component.scss']
})
export class TableCellRadioComponent<T> extends TableCellCustom<T> implements OnInit {
  disable: boolean;

  private r: T;
  @Input('row')
  get row() { return this.r; }
  set row(row: T) {
    this.r = row;
    if (row) {
      this.updateDisabled();
    }
  }

  ngOnInit() {
    this.updateDisabled();
  }

  updateDisabled() {
    this.disable = this.config ? this.config.isDisabled(this.row) : false;
  }
}
