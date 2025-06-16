import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  CreateSignatureFormItems,
  SignatureCreationStep,
} from '@/Signature/components/CreateSignatureFormItems';
import { DocumentSignatureEditor } from '@/Signature/components/DocumentSignatureEditor';
import { SignatureColor } from '@/Signature/constants/signatureColors';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { z } from 'zod';

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

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  signees: z
    .array(
      z.object({
        person: z.union([z.string(), z.custom<ObjectRecord>(), z.null()]),
        order: z.number().optional(),
        color: z.custom<SignatureColor>(),
      }),
    )
    .min(1, 'At least one signee is required'),
  user_only: z.boolean(),
  order_enabled: z.boolean(),
  additional_receiver_ids: z.array(z.string()).default([]),
});

export type CreateSignatureFormValues = z.infer<typeof formSchema>;

export const SignaturePage = () => {
  const [step, setStep] = useState(SignatureCreationStep.CONFIGURATION);
  const { watch, setValue } = useForm<CreateSignatureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      signees: [{ person: null }],
      user_only: false,
      order_enabled: false,
      additional_receiver_ids: [],
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', watch());
  };
  return (
    <PageContainer>
      <PageTitle title="Signature Request" />
      <PageHeader title="Signature Request">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        <form onSubmit={handleSubmit}>
          <StyledPageContainer>
            <StyledScrollWrapper componentInstanceId="signature-form">
              <CreateSignatureFormItems
                onNext={setStep}
                currentStep={step}
                watch={watch}
                setValue={setValue}
              />
            </StyledScrollWrapper>
            <StyledAttachmentContainer>
              <DocumentSignatureEditor />
            </StyledAttachmentContainer>
          </StyledPageContainer>
        </form>
      </PageBody>
    </PageContainer>
  );
};
