import { Component } from '@angular/core';

import { CloudFoundryEndpointService } from '../../../../features/cf/services/cloud-foundry-endpoint.service';

@Component({
  selector: 'app-card-cf-user-info',
  templateUrl: './card-cf-user-info.component.html',
  styleUrls: ['./card-cf-user-info.component.scss'],
})
export class CardCfUserInfoComponent {
  constructor(public cfEndpointService: CloudFoundryEndpointService) {}

  isAdmin(user) {
    return user && user.admin ? 'Yes' : 'No';
  }
}
