import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { testSCFEndpoint, testSCFEndpointGuid } from '@stratosui/store/testing';

import { TabNavService } from '../../../../../core/src/tab-nav.service';
import { EntityCatalogHelpers } from '../../../../../store/src/entity-catalog/entity-catalog.helper';
import { EntityCatalogEntityConfig } from '../../../../../store/src/entity-catalog/entity-catalog.types';
import { endpointEntityType, stratosEntityFactory } from '../../../../../store/src/helpers/stratos-entity-factory';
import { NormalizedResponse } from '../../../../../store/src/types/api.types';
import { WrapperRequestActionSuccess } from '../../../../../store/src/types/request.types';
import {
  generateCfBaseTestModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { EntityRelationSpecHelper } from '../../../../test-framework/entity-relations-spec-helper';
import { cfEntityFactory } from '../../../cf-entity-factory';
import { organizationEntityType, spaceEntityType } from '../../../cf-entity-types';
import { SpaceQuotaDefinitionComponent } from './space-quota-definition.component';

describe('SpaceQuotaDefinitionComponent', () => {
  let component: SpaceQuotaDefinitionComponent;
  let fixture: ComponentFixture<SpaceQuotaDefinitionComponent>;
  const cfGuid = testSCFEndpointGuid;
  const orgGuid = '123';
  const spaceGuid = '123';

  const helper = new EntityRelationSpecHelper();

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SpaceQuotaDefinitionComponent
      ],
      imports: generateCfBaseTestModules(),
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { cfGuid, orgGuid, spaceGuid },
              params: { quotaId: 'guid' }
            }
          }
        },
        generateTestCfEndpointServiceProvider(),
        TabNavService,
      ]

    })
      .compileComponents();


    const stratosEndpointEntityConfig: EntityCatalogEntityConfig = stratosEntityFactory(endpointEntityType);
    const stratosEndpointEntityKey = EntityCatalogHelpers.buildEntityKey(
      stratosEndpointEntityConfig.entityType,
      stratosEndpointEntityConfig.endpointType
    );

    const orgEndpointEntityConfig: EntityCatalogEntityConfig = cfEntityFactory(organizationEntityType);
    const orgEntityKey = EntityCatalogHelpers.buildEntityKey(orgEndpointEntityConfig.entityType, orgEndpointEntityConfig.endpointType);
    const org = helper.createEmptyOrg(orgGuid, 'org');

    const spaceEndpointEntityConfig: EntityCatalogEntityConfig = cfEntityFactory(spaceEntityType);
    const spaceEntityKey = EntityCatalogHelpers.buildEntityKey(
      spaceEndpointEntityConfig.entityType,
      spaceEndpointEntityConfig.endpointType
    );
    const space = helper.createEmptyOrg(spaceGuid, 'space');

    const mappedData = {
      entities: {
        [stratosEndpointEntityKey]: {
          [testSCFEndpoint.guid]: testSCFEndpoint
        },
        [orgEntityKey]: {
          [org.entity.guid]: org
        },
        [spaceEntityKey]: {
          [space.entity.guid]: space
        }
      },
      result: [testSCFEndpoint.guid]
    } as NormalizedResponse;
    const store = TestBed.get(Store);
    store.dispatch(new WrapperRequestActionSuccess(mappedData, {
      type: 'POPULATE_TEST_DATA',
      ...stratosEndpointEntityConfig
    }, 'fetch'));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceQuotaDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
