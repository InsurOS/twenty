import { Attachment } from '@/activities/files/types/Attachment';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import {
  SignatureComplete,
  SignatureStatus,
} from '@/signature/types/Signature';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconClockHour8,
  TooltipDelay,
} from 'twenty-ui/display';

const StyledCalendarIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
`;

type AttachmentRowStatusIconProps = {
  attachment: Attachment;
};

type AttachmentRowStatusIconWithSignatureProps = {
  signature: SignatureComplete;
};

const MapSignatureStatusToIcon: Record<SignatureStatus, React.ElementType> = {
  [SignatureStatus.PROCESSING]: IconClockHour8,
  [SignatureStatus.SENT_FOR_SIGNATURE]: IconClockHour8,
  [SignatureStatus.SIGNED]: IconCheck,
  [SignatureStatus.COMPLETED]: IconCheck,
  [SignatureStatus.FAILED]: IconAlertCircle,
};

const MapSignatureStatusToText: Record<SignatureStatus, string> = {
  [SignatureStatus.PROCESSING]: 'Signature Pending',
  [SignatureStatus.SENT_FOR_SIGNATURE]: 'Signature Pending',
  [SignatureStatus.SIGNED]: 'Signature Completed',
  [SignatureStatus.COMPLETED]: 'SignatureCompleted',
  [SignatureStatus.FAILED]: 'SignatureFailed',
};

const DefaultCalendarIcon = () => {
  const theme = useTheme();
  return (
    <StyledCalendarIconContainer>
      <IconCalendar size={theme.icon.size.md} />
    </StyledCalendarIconContainer>
  );
};

export const AttachmentRowStatusIcon = ({
  attachment,
}: AttachmentRowStatusIconProps) => {
  const { signatureId } = attachment;

  const { record: signature, loading } = useFindOneRecord<SignatureComplete>({
    objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_SIGNATURE,
    objectRecordId: signatureId ?? '',
    skip: !isDefined(signatureId),
  });

  if (loading) {
    return <DefaultCalendarIcon />;
  }
  if (!signature) {
    return <DefaultCalendarIcon />;
  }

  return <AttachmentRowStatusIconWithSignature signature={signature} />;
};

const AttachmentRowStatusIconWithSignature = ({
  signature,
}: AttachmentRowStatusIconWithSignatureProps) => {
  const theme = useTheme();
  const { signatureStatus } = signature;
  const componentId = `attachment-status-icon-${signature.id}`;

  const MapSignatureStatusToColor: Record<SignatureStatus, string> = {
    [SignatureStatus.PROCESSING]: theme.color.orange30,
    [SignatureStatus.SENT_FOR_SIGNATURE]: theme.color.orange30,
    [SignatureStatus.SIGNED]: theme.color.green30,
    [SignatureStatus.COMPLETED]: theme.color.green30,
    [SignatureStatus.FAILED]: theme.color.red30,
  };

  const Icon = MapSignatureStatusToIcon[signatureStatus];
  const color = MapSignatureStatusToColor[signatureStatus];
  const text = MapSignatureStatusToText[signatureStatus];

  return (
    <StyledCalendarIconContainer>
      <Icon size={theme.icon.size.md} color={color} id={componentId} />
      {createPortal(
        <AppTooltip
          anchorSelect={`#${componentId}`}
          place="top"
          content={text}
          delay={TooltipDelay.shortDelay}
        />,
        document.body,
      )}
    </StyledCalendarIconContainer>
  );
};
