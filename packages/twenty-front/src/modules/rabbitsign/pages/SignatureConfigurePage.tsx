import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import styled from '@emotion/styled';
import { IconArrowLeft, IconUpload } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

// Define an interface for the attachment record
interface AttachmentRecord extends ObjectRecord {
  name: string;
  type: string;
}

// Define a MainContainer styled component as the original was removed
const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => theme.spacing(600)};
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  width: 100%;
`;

const StyledBackButton = styled(Button)`
  margin-right: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-start;
`;

const StyledSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

const StyledSectionTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  padding: ${({ theme }) => theme.spacing(6)};
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing(6)};
`;

export const SignatureConfigurePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordId, objectNameSingular } = location.state || {};
  
  const [documentName, setDocumentName] = useState('');
  
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  
  const { records, loading } = useFindManyRecords<AttachmentRecord>({
    objectNameSingular,
    filter: {
      id: {
        eq: recordId
      }
    },
    limit: 1
  });

  const attachmentRecord = records?.[0];
  
  useEffect(() => {
    if (attachmentRecord?.name) {
      setDocumentName(attachmentRecord.name);
    }
  }, [attachmentRecord]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Here you would implement the actual logic to send the document for signature
    // For now, we just go back after simulating processing
    alert('Document sent for signature!');
    navigate(-1);
  };
  
  return (
    <MainContainer>
      <PageTitle title="Configure Signature Request" />
      <StyledHeader>
        <StyledTitleContainer>
          <StyledBackButton
            variant="tertiary"
            Icon={IconArrowLeft}
            onClick={handleGoBack}
          />
          <h1>Configure Signature Request</h1>
        </StyledTitleContainer>
      </StyledHeader>
      
      <StyledCard>
        {loading ? (
          <div>Loading document information...</div>
        ) : (
          <StyledForm onSubmit={handleSubmit}>
            <StyledSectionContainer>
              <StyledSectionTitle>Document Information</StyledSectionTitle>
              <div>
                <p><strong>Document Name:</strong> {documentName}</p>
                <p><strong>Type:</strong> {attachmentRecord?.type || 'Unknown'}</p>
              </div>
            </StyledSectionContainer>
            
            <StyledSectionContainer>
              <StyledSectionTitle>Signature Recipients</StyledSectionTitle>
              <p>Configure who needs to sign this document (this is a placeholder - implement actual recipient selection UI here)</p>
            </StyledSectionContainer>
            
            <StyledSectionContainer>
              <StyledSectionTitle>Signature Settings</StyledSectionTitle>
              <p>Configure signature settings like expiration, reminders, etc. (this is a placeholder - implement actual settings UI here)</p>
            </StyledSectionContainer>
            
            <StyledButtonContainer>
              <Button
                variant="primary"
                Icon={IconUpload}
                type="submit"
                title="Send for Signature"
              />
            </StyledButtonContainer>
          </StyledForm>
        )}
      </StyledCard>
    </MainContainer>
  );
}; 