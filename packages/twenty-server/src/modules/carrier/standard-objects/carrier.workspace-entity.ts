import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';


import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { CARRIER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';
const DOMAIN_NAME_FIELD_NAME = 'domainName';

export const SEARCH_FIELDS_FOR_CARRIER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: DOMAIN_NAME_FIELD_NAME, type: FieldMetadataType.LINKS },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.carrier,
  namePlural: 'carriers',
  labelSingular: msg`Carrier`,
  labelPlural: msg`Carriers`,
  description: msg`A carrier`,
  icon: STANDARD_OBJECT_ICONS.carrier,
  shortcut: 'C',
  labelIdentifierStandardId: CARRIER_STANDARD_FIELD_IDS.name,
})
@WorkspaceDuplicateCriteria([['name'], ['domainNamePrimaryLinkUrl']])
@WorkspaceIsSearchable()
export class CarrierWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The carrier name`,
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @WorkspaceField({
    standardId: CARRIER_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.LINKS,
    label: msg`Domain Name`,
    description: msg`The carrier website URL. We use this url to fetch the carrier icon`,
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  domainName: LinksMetadata;
}
