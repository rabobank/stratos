import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-choose-type',
  templateUrl: './choose-type.component.html',
  styleUrls: ['./choose-type.component.scss']
})
export class ChooseTypeComponent implements OnInit {

  public types = [{
    title: 'Stratos',
    description: 'Stratos is the gateway interface to your Cloud Foundry instances.',
    icon: '/core/assets/logo.png'
  }, {
    title: 'Minibroker',
    description: 'There`s always got to be three choices',
    icon: '/core/assets/types/osb_logo.png'
  }];

  constructor() { }

  ngOnInit(): void {
  }

}
