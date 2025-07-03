import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureComplete } from '@/signature/types/Signature';
import { IconFileCheck } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentSignatureSignedAttachmentMenuItemProps = {
  signatureId: string | null;
};

export const AttachmentSignatureSignedAttachmentMenuItem = ({
  signatureId,
}: AttachmentSignatureSignedAttachmentMenuItemProps) => {
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

  const { signatureSignedAttachment } = signature;

  if (!signatureSignedAttachment) {
    return null;
  }

  return (
    <MenuItem
      text={`View Signed Document`}
      LeftIcon={IconFileCheck}
      onClick={() => window.open(signatureSignedAttachment.fullPath)}
    />
  );
};
