import { SignatureComplete } from '@/signature/types/Signature';
import styled from '@emotion/styled';

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
  const getStatusInfo = () => {
    const totalSigners = signatureComplete.signers.length;
    const signedSigners = signatureComplete.signers.filter(
      (signer) => signer.status === 'SIGNED',
    ).length;

    if (signatureComplete.signatureStatus === 'SIGNED') {
      return {
        title: 'Signature Completed',
        description: `All ${totalSigners} signer${totalSigners > 1 ? 's' : ''} have completed their signatures`,
      };
    }

    if (signatureComplete.signatureStatus === 'SENT_FOR_SIGNATURE') {
      if (signedSigners === 0) {
        return {
          title: 'Signature Pending',
          description: `Signature request is created, waiting on ${totalSigners} signer${totalSigners > 1 ? 's' : ''} to complete signature`,
        };
      } else {
        return {
          title: 'Signature In Progress',
          description: `${signedSigners} of ${totalSigners} signer${totalSigners > 1 ? 's' : ''} have signed`,
        };
      }
    }

    return {
      title: 'Signature Request',
      description: 'Signature request details',
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
