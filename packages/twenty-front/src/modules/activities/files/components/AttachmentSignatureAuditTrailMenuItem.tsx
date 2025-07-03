import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureComplete } from '@/signature/types/Signature';
import { IconHistory } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentSignatureAuditTrailMenuItemProps = {
  signatureId: string | null;
};

export const AttachmentSignatureAuditTrailMenuItem = ({
  signatureId,
}: AttachmentSignatureAuditTrailMenuItemProps) => {
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

  return (
    <MenuItem
      text={`View Audit Trail`}
      LeftIcon={IconHistory}
      onClick={() =>
        window.open(signatureAuditTrailDownloadAttachment.fullPath)
      }
    />
  );
};
