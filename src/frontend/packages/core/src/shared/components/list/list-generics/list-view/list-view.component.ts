import {
  Component,
  ComponentRef,
  Injector,
  Input,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { ListComponent } from '../../list.component';
import { IListConfig, ListConfig } from '../../list.component.types';
import { ListConfigProvider } from '../list-config-provider.types';

@Component({
    selector: 'app-list-view',
    templateUrl: './list-view.component.html',
    styleUrls: ['./list-view.component.scss']
})
export class ListViewComponent<T> implements OnDestroy {

  @Input() set config(config: ListConfigProvider<T>) {
    if (config) {
      this.create(config);
    }
  }

  @ViewChild('viewContainerRef', { read: ViewContainerRef, static: true })
  public listHost: ViewContainerRef;

  private componentRef: ComponentRef<ListComponent<unknown>>;

  constructor(
    private injector: Injector
  ) { }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }

  create(listConfig: ListConfigProvider<T>) {
    // Clean up old component
    this.ngOnDestroy();

    this.componentRef = this.listHost.createComponent(
      ListComponent,{injector: this.makeCustomConfigInjector(listConfig.getListConfig())}
    );
  }

  private makeCustomConfigInjector(listConfig: IListConfig<T>) {
    return Injector.create({
      providers: [{ provide: ListConfig, useValue: listConfig }],
      parent: this.injector
    });
  }
}
