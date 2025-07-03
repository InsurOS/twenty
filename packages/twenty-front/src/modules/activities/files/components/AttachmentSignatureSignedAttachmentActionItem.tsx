import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureComplete } from '@/signature/types/Signature';
import { IconFileCheck } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentSignatureSignedAttachmentActionItemProps = {
  signatureId: string | null;
  type: 'menuItem' | 'button';
};

export const AttachmentSignatureSignedAttachmentActionItem = ({
  signatureId,
  type = 'menuItem',
}: AttachmentSignatureSignedAttachmentActionItemProps) => {
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

  if (type === 'menuItem') {
    return (
      <MenuItem
        text={`View Signed Document`}
        LeftIcon={IconFileCheck}
        onClick={() => window.open(signatureSignedAttachment.fullPath)}
      />
    );
  }

  if (type === 'button') {
    return (
      <Button
        title="View Signed Document"
        Icon={IconFileCheck}
        onClick={() => window.open(signatureSignedAttachment.fullPath)}
      />
    );
  }
};
