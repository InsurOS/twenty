import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { RABBIT_SIGN_KEY_STANDARD_FIELD_IDS, RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.rabbitSignSignature,
  namePlural: 'rabbitSignatures',
  labelSingular: msg`RabbitSignature`,
  labelPlural: msg`RabbitSignatures`,
  description: msg`A RabbitSignature request`,
  icon: 'IconSignature',
  labelIdentifierStandardId: RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSystem()
export class RabbitSignSignatureWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`The title of the RabbitSignature request`,
  })
  title: string;

  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS.signatureStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Signature Status`,
    description: msg`The status of the RabbitSignature request`,
  })
  signatureStatus: string;

  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS.pdfData,
    type: FieldMetadataType.TEXT,
    label: msg`PDF Data`,
    description: msg`Base64 encoded PDF data`,
  })
  pdfData: string;

  @WorkspaceField({
    standardId: RABBIT_SIGN_SIGNATURE_STANDARD_FIELD_IDS.signaturesData,
    type: FieldMetadataType.TEXT,
    label: msg`Signatures Data`,
    description: msg`JSON encoded signatures data`,
  })
  signaturesData: string;
  
  // Relations
  @WorkspaceRelation({
    standardId: RABBIT_SIGN_KEY_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Workspace Member`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'rabbitSignSignatures',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string;
}