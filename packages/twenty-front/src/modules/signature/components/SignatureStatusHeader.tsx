import { SignatureComplete } from '@/signature/types/Signature';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';

const StyledStatusHeader = styled.div`
  margin-bottom: 0;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledStatusTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledStatusDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SignatureStatusHeader = ({
  signatureComplete,
}: {
  signatureComplete: SignatureComplete;
}) => {
  const { t } = useLingui();

  const totalSigners = signatureComplete.signers.length;
  const signedSigners = signatureComplete.signers.filter(
    (signer) => signer.status === 'SIGNED',
  ).length;

  const getStatusInfo = () => {
    if (signatureComplete.signatureStatus === 'SIGNED') {
      return {
        title: t`Signature Completed`,
      };
    }

    if (signatureComplete.signatureStatus === 'SENT_FOR_SIGNATURE') {
      if (signedSigners === 0) {
        return {
          title: t`Signature Pending`,
        };
      } else {
        return {
          title: t`Signature In Progress`,
        };
      }
    }

    return {
      title: t`Signature Request`,
    };
  };

  const { title } = getStatusInfo();

  const renderDescription = () => {
    if (signatureComplete.signatureStatus === 'SIGNED') {
      if (totalSigners === 1) {
        return <Trans>All 1 signer have completed their signatures</Trans>;
      } else {
        return (
          <Trans>
            All {totalSigners} signers have completed their signatures
          </Trans>
        );
      }
    }

    if (signatureComplete.signatureStatus === 'SENT_FOR_SIGNATURE') {
      if (signedSigners === 0) {
        if (totalSigners === 1) {
          return (
            <Trans>
              Signature request is created, waiting on 1 signer to complete
              signature
            </Trans>
          );
        } else {
          return (
            <Trans>
              Signature request is created, waiting on {totalSigners} signers to
              complete signature
            </Trans>
          );
        }
      } else {
        if (totalSigners === 1) {
          return <Trans>{signedSigners} of 1 signer have signed</Trans>;
        } else {
          return (
            <Trans>
              {signedSigners} of {totalSigners} signers have signed
            </Trans>
          );
        }
      }
    }

    return <Trans>Signature request details</Trans>;
  };

  return (
    <StyledStatusHeader>
      <StyledStatusTitle>{title}</StyledStatusTitle>
      <StyledStatusDescription>{renderDescription()}</StyledStatusDescription>
    </StyledStatusHeader>
  );
};
