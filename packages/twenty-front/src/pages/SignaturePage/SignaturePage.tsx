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
import { FormProvider, useForm } from 'react-hook-form';
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
        id: z.union([z.string(), z.null()]),
        order: z.number().optional(),
        color: z.custom<SignatureColor>(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        signatures: z
          .array(
            z.object({
              name: z.string(),
              email: z.string().email(),
              index: z.number(),
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
              pageIndex: z.number(),
              fieldType: z.number(),
            }),
          )
          .default([]),
      }),
    )
    .min(1, 'At least one signee is required'),
  user_only: z.boolean(),
  order_enabled: z.boolean(),
  additional_receiver_ids: z.array(z.string()).default([]),
  selected_signee_id: z.union([z.string(), z.null()]),
});

export type CreateSignatureFormValues = z.infer<typeof formSchema>;

export const SignaturePage = () => {
  const [step, setStep] = useState(SignatureCreationStep.CONFIGURATION);
  const methods = useForm<CreateSignatureFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      signees: [{ id: null }],
      user_only: false,
      order_enabled: false,
      additional_receiver_ids: [],
      selected_signee_id: null,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', methods.watch());
  };

  return (
    <PageContainer>
      <PageTitle title="Signature Request" />
      <PageHeader title="Signature Request">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit}>
            <StyledPageContainer>
              <StyledScrollWrapper componentInstanceId="signature-form">
                <CreateSignatureFormItems onNext={setStep} currentStep={step} />
              </StyledScrollWrapper>
              <StyledAttachmentContainer>
                <DocumentSignatureEditor />
              </StyledAttachmentContainer>
            </StyledPageContainer>
          </form>
        </FormProvider>
      </PageBody>
    </PageContainer>
  );
};
