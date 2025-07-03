import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureComplete } from '@/signature/types/Signature';
import { IconHistory } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentSignatureAuditTrailActionItemProps = {
  signatureId: string | null;
  type: 'menuItem' | 'button';
};

export const AttachmentSignatureAuditTrailActionItem = ({
  signatureId,
  type,
}: AttachmentSignatureAuditTrailActionItemProps) => {
  const { record: signature, loading: signatureLoading } =
    useFindOneRecord<SignatureComplete>({
      objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_SIGNATURE,
      objectRecordId: signatureId ?? '',
      skip: !signatureId,
    });

  if (signatureLoading) {
    return null;
  }

  if (!signature) {
    return null;
  }

  const { signatureAuditTrailDownloadAttachment } = signature;

  if (!signatureAuditTrailDownloadAttachment) {
    return null;
  }

  if (type === 'menuItem') {
    return (
      <MenuItem
        text={`View Audit Trail`}
        LeftIcon={IconHistory}
        onClick={() =>
          window.open(signatureAuditTrailDownloadAttachment.fullPath)
        }
      />
    );
  }

  if (type === 'button') {
    return (
      <Button
        title="View Audit Trail"
        Icon={IconHistory}
        onClick={() =>
          window.open(signatureAuditTrailDownloadAttachment.fullPath)
        }
      />
    );
  }
};
