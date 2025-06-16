import {
  CreateSignatureFormItems,
  SignatureCreationStep,
} from '@/Signature/components/CreateSignatureFormItems';
import { DocumentSignatureEditor } from '@/Signature/components/DocumentSignatureEditor';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useState } from 'react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const StyledPageContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const StyledAttachmentContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  position: relative;
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  min-width: 340px;
  width: 340px;
`;

export const SignaturePage = () => {
  const [step, setStep] = useState(SignatureCreationStep.CONFIGURATION);

  return (
    <PageContainer>
      <PageTitle title="Signature Request" />
      <PageHeader title="Signature Request">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        <StyledPageContainer>
          <StyledScrollWrapper componentInstanceId="signature-form">
            <CreateSignatureFormItems onNext={setStep} currentStep={step} />
          </StyledScrollWrapper>
          <StyledAttachmentContainer>
            <DocumentSignatureEditor />
          </StyledAttachmentContainer>
        </StyledPageContainer>
      </PageBody>
    </PageContainer>
  );
};
