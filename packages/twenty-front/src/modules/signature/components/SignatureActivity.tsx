import { AttachmentSignatureAuditTrailActionItem } from '@/activities/files/components/AttachmentSignatureAuditTrailActionItem';
import { AttachmentSignatureSignedAttachmentActionItem } from '@/activities/files/components/AttachmentSignatureSignedAttachmentActionItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureActivityRow } from '@/signature/components/SignatureActivityRow';
import { SignatureStatusHeader } from '@/signature/components/SignatureStatusHeader';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconClockHour8, IconSignature } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import {
  Signature,
  SignatureActivityItem,
  SignatureComplete,
  SignatureSignerStatus,
  SignatureStatus,
} from '../types/Signature';

type SignatureActivityProps = {
  signature: Signature;
};

type SignatureActivityWithSignatureCompleteProps = {
  signatureComplete: SignatureComplete;
};

const StyledTimelineContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0 ${({ theme }) => theme.spacing(6)};
  justify-content: flex-start;
`;

const StyledActivityGroupContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 24px;
`;

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledSignatureActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin: ${({ theme }) => theme.spacing(6)};
  margin-top: 0;
`;

export const SignatureActivity = ({ signature }: SignatureActivityProps) => {
  const { t } = useLingui();
  const {
    record: signatureComplete,
    loading: signatureCompleteLoading,
    error: signatureCompleteError,
  } = useFindOneRecord<SignatureComplete>({
    objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_SIGNATURE,
    objectRecordId: signature.id,
  });

  if (signatureCompleteLoading) {
    return (
      <StyledLoaderContainer>
        <Loader />
      </StyledLoaderContainer>
    );
  }

  if (!signatureComplete || isDefined(signatureCompleteError)) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="noFile" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No Document`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`No document was found for this signature request.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <SignatureActivityWithSignatureComplete
      signatureComplete={signatureComplete}
    />
  );
};

const SignatureActivityWithSignatureComplete = ({
  signatureComplete,
}: SignatureActivityWithSignatureCompleteProps) => {
  const { t } = useLingui();

  const generateSignatureActivities = (): SignatureActivityItem[] => {
    const activities: SignatureActivityItem[] = [];
    const signatureTitle = signatureComplete.title;

    activities.push({
      id: 'signature-created',
      type: 'SIGNATURE_CREATED',
      title: t`Signature request created`,
      description: t`"${signatureTitle}" was created`,
      createdAt: signatureComplete.createdAt,
      icon: <IconSignature />,
    });

    signatureComplete.signers.forEach((signer) => {
      // Always add notification activity when signer is created
      activities.push({
        id: `signer-${signer.id}-notified`,
        type: 'SIGNER_NOTIFIED',
        title: t`Signer notified`,
        description: t`A signer was notified to sign the document`,
        createdAt: signer.createdAt,
        icon: <IconClockHour8 />,
        signerId: signer.personId,
      });

      // Add signing activity if the signer has signed
      if (signer.status === SignatureSignerStatus.SIGNED) {
        activities.push({
          id: `signer-${signer.id}-signed`,
          type: 'SIGNER_SIGNED',
          title: t`Signer signed`,
          description: t`A signer completed their signature`,
          createdAt: signer.updatedAt,
          icon: <IconCheck />,
          signerId: signer.personId,
        });
      }
    });

    if (
      signatureComplete.signatureStatus === 'SIGNED' ||
      signatureComplete.signatureStatus === 'COMPLETED'
    ) {
      const allSignersSigned = signatureComplete.signers.every(
        (signer) => signer.status === 'SIGNED',
      );
      if (allSignersSigned) {
        activities.push({
          id: 'signature-completed',
          type: 'SIGNATURE_COMPLETED',
          title: t`Signature request completed`,
          description: t`All signers have completed their signatures`,
          createdAt: signatureComplete.updatedAt,
          icon: <IconCheck />,
        });
      }
    }

    return activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const activities = generateSignatureActivities();
  const isActivitiesEmpty = activities.length === 0;

  if (isActivitiesEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
      >
        <AnimatedPlaceholder type="emptyTimeline" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No signature activity yet`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`There is no activity associated with this signature request.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <div>
      <SignatureStatusHeader signatureComplete={signatureComplete} />
      {signatureComplete.signatureStatus === SignatureStatus.COMPLETED && (
        <StyledSignatureActionsContainer>
          <AttachmentSignatureAuditTrailActionItem
            signatureId={signatureComplete.id}
            type="button"
          />
          <AttachmentSignatureSignedAttachmentActionItem
            signatureId={signatureComplete.id}
            type="button"
          />
        </StyledSignatureActionsContainer>
      )}
      <StyledTimelineContainer>
        <StyledActivityGroupContainer>
          <StyledActivityGroupBar />
          {activities.map((activity, index) => (
            <SignatureActivityRow
              key={activity.id}
              activity={activity}
              isLastActivity={index === activities.length - 1}
            />
          ))}
        </StyledActivityGroupContainer>
      </StyledTimelineContainer>
    </div>
  );
};
