import { Component, OnInit } from '@angular/core';

import { TableCellCustom } from '../../../../../../../../core/src/shared/components/list/list.types';
import { APIResource } from '../../../../../../../../store/src/types/api.types';
import { IServiceInstance } from '../../../../../../cf-api-svc.types';
import { userProvidedServiceInstanceEntityType } from '../../../../../../cf-entity-types';

@Component({
  selector: 'app-table-cell-service-last-op',
  templateUrl: './table-cell-service-last-op.component.html',
  styleUrls: ['./table-cell-service-last-op.component.scss']
})
export class TableCellServiceLastOpComponent extends TableCellCustom<APIResource<IServiceInstance>> implements OnInit {

   
  isUserProvidedServiceInstance: Boolean;

  ngOnInit() {
    this.isUserProvidedServiceInstance = this.entityKey === userProvidedServiceInstanceEntityType;
  }
}
