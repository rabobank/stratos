import { APIResource } from '../../../../store/src/types/api.types';
import { IApp } from '../../cf-api.types';

export class Route {
  constructor(
    public domain_guid: string,
    public space_guid: string,
    public host?: string,
    public path?: string,
    public port?: number
  ) {}
}

export interface RouteMode {
  id: string;
  label: string;
  submitLabel: string;
}

export class CfRoute {
  domain_guid: string;
  space_guid: string;
  path?: string;
  host?: string;
  port?: number;
  apps?: APIResource<IApp>[];
}
