import { SignatureComplete } from '@/signature/types/Signature';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

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

  const getStatusInfo = () => {
    const totalSigners = signatureComplete.signers.length;
    const signedSigners = signatureComplete.signers.filter(
      (signer) => signer.status === 'SIGNED',
    ).length;

    if (signatureComplete.signatureStatus === 'SIGNED') {
      return {
        title: t`Signature Completed`,
        description: t`All ${totalSigners} signer${totalSigners === 1 ? '' : 's'} have completed their signatures`,
      };
    }

    if (signatureComplete.signatureStatus === 'SENT_FOR_SIGNATURE') {
      if (signedSigners === 0) {
        return {
          title: t`Signature Pending`,
          description: t`Signature request is created, waiting on ${totalSigners} signer${totalSigners === 1 ? '' : 's'} to complete signature`,
        };
      } else {
        return {
          title: t`Signature In Progress`,
          description: t`${signedSigners} of ${totalSigners} signer${totalSigners === 1 ? '' : 's'} have signed`,
        };
      }
    }

    return {
      title: t`Signature Request`,
      description: t`Signature request details`,
    };
  };

  const { title, description } = getStatusInfo();

  return (
    <StyledStatusHeader>
      <StyledStatusTitle>{title}</StyledStatusTitle>
      <StyledStatusDescription>{description}</StyledStatusDescription>
    </StyledStatusHeader>
  );
};
