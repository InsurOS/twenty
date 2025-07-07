import { AttachmentComplete } from '@/activities/files/types/Attachment';
import { currentUserState } from '@/auth/states/currentUserState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import {
  CreateSignatureFormItems,
  SignatureCreationStep,
} from '@/signature/components/CreateSignatureFormItems';
import { DocumentSignatureEditorWithAttachment } from '@/signature/components/DocumentSignatureEditor';
import { SignatureActivity } from '@/signature/components/SignatureActivity';
import {
  getSignatureColor,
  SignatureColor,
} from '@/signature/constants/signatureColors';
import { SignatureComplete } from '@/signature/types/Signature';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { z } from 'zod';
import { User } from '~/generated/graphql';

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

const StyledLoaderContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export type CreateSignatureFormValues = {
  title: string;
  message: string;
  signees: Array<{
    id: string | null;
    order?: number;
    color: SignatureColor;
    name?: string;
    email?: string;
  }>;
  signatures: Array<{
    name: string;
    email: string;
    x: number;
    y: number;
    width: number;
    height: number;
    page_index: number;
    field_type: number;
    signee_id: string;
    index: number;
  }>;
  user_signature: boolean;
  order_enabled: boolean;
  additional_receiver_ids: string[];
  additional_receiver_emails: string[];
  selected_signee_id: string | undefined;
  file_name: string;
  attachment_id: string;
};

export const SignaturePageWithAttachment = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValue(currentUserState);
  const { attachmentId } = useParams();
  const {
    record: attachment,
    loading: attachmentLoading,
    error: attachmentError,
  } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    objectRecordId: attachmentId,
  });

  if (attachmentLoading) {
    return (
      <PageContainer>
        <PageTitle title={t`Signature Request`} />
        <PageHeader title={t`Signature Request`}>
          <PageHeaderToggleCommandMenuButton />
        </PageHeader>
        <PageBody>
          <StyledLoaderContainer>
            <Loader />
          </StyledLoaderContainer>
        </PageBody>
      </PageContainer>
    );
  }
  if (!attachment || isDefined(attachmentError) || !currentUser) {
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
    <SignaturePage
      attachment={attachment as AttachmentComplete}
      currentUser={currentUser as User}
    />
  );
};

export const SignaturePage = ({
  attachment,
  currentUser,
}: {
  attachment: AttachmentComplete;
  currentUser: User;
}) => {
  const { findOneRecord: fetchSignature } =
    useLazyFindOneRecord<SignatureComplete>({
      objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_SIGNATURE,
    });
  const { t } = useLingui();
  const { person, signature } = attachment;
  const [step, setStep] = useState(SignatureCreationStep.CONFIGURATION);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const getFormSchema = () =>
    z
      .object({
        title: z.string().min(1, t`Title is required`),
        message: z.string().min(1, t`Message is required`),
        signees: z
          .array(
            z.object({
              id: z.union([z.string(), z.null()]),
              order: z.number().optional(),
              color: z.custom<SignatureColor>(),
              name: z.string().optional(),
              email: z.string().email().optional(),
            }),
          )
          .min(1, t`At least one signee is required`)
          .refine(
            () => {
              // Only validate order uniqueness if order_enabled is true
              // This will be checked in the parent object validation
              return true;
            },
            {
              message: t`At least one signee is required`,
            },
          ),
        signatures: z
          .array(
            z.object({
              name: z.string(),
              email: z.string().email(),
              x: z.number(),
              y: z.number(),
              width: z.number(),
              height: z.number(),
              page_index: z.number(),
              field_type: z.number(),
              signee_id: z.string(),
              index: z.number(),
            }),
          )
          .default([]),
        user_signature: z.boolean(),
        order_enabled: z.boolean(),
        additional_receiver_ids: z.array(z.string()).default([]),
        additional_receiver_emails: z.array(z.string().email()).default([]),
        selected_signee_id: z.union([z.string(), z.undefined()]),
        file_name: z.string(),
        attachment_id: z.string(),
      })
      .refine(
        (data) => {
          // If order is not enabled, skip validation
          if (!data.order_enabled) {
            return true;
          }

          // Get all signees with defined orders
          const signeesWithOrder = data.signees.filter(
            (signee) => signee.id !== null && signee.order !== undefined,
          );

          // Check if all signees have an order
          if (
            signeesWithOrder.length !==
            data.signees.filter((s) => s.id !== null).length
          ) {
            return false;
          }

          // Check for duplicate orders
          const orders = signeesWithOrder.map((signee) => signee.order);
          const uniqueOrders = new Set(orders);

          return orders.length === uniqueOrders.size;
        },
        {
          message: t`Each signee must have a unique order when signing order is enabled`,
          path: ['signees'], // This will show the error on the signees field
        },
      )
      .refine(
        (data) => {
          // Get all signees with valid IDs (excluding null IDs)
          const validSignees = data.signees.filter(
            (signee) => signee.id !== null,
          );

          // If no valid signees, skip validation
          if (validSignees.length === 0) {
            return true;
          }

          // Get all signee IDs
          const signeeIds = validSignees.map((signee) => signee.id);

          // Get all signature signee IDs
          const signatureSigneeIds = data.signatures.map(
            (signature) => signature.signee_id,
          );

          // Check if each signee has at least one signature
          const signeesWithSignatures = signeeIds.filter((signeeId) =>
            signatureSigneeIds.includes(signeeId as string),
          );

          return signeesWithSignatures.length === signeeIds.length;
        },
        {
          message: t`All signees must have at least one signature field. Please add signature fields for each signee.`,
          path: ['signatures'], // This will show the error on the signatures field
        },
      );

  const methods = useForm<CreateSignatureFormValues>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      title: t`Document Signature Request`,
      message: t`Please sign the document`,
      signees: [
        {
          id: currentUser.id,
          order: 1,
          color: getSignatureColor(0),
          name: `(You) ${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
        },
        {
          id: person?.id,
          order: 2,
          color: getSignatureColor(1),
          name: `${person?.name.firstName} ${person?.name.lastName}`,
          email: person?.emails?.primaryEmail,
        },
      ],
      signatures: [],
      user_signature: true,
      order_enabled: false,
      additional_receiver_ids: [],
      additional_receiver_emails: [],
      selected_signee_id: person?.id,
      file_name: attachment.fullPath,
      attachment_id: attachment.id,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <PageContainer>
      <PageTitle title={t`Signature Request`} />
      <PageHeader title={t`Signature Request`}>
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit}>
            <StyledPageContainer>
              {signature ? (
                <StyledScrollWrapper componentInstanceId="signature-activity">
                  <SignatureActivity signature={signature} />
                </StyledScrollWrapper>
              ) : (
                <StyledScrollWrapper componentInstanceId="signature-form">
                  <CreateSignatureFormItems
                    setStep={setStep}
                    currentStep={step}
                    currentPageIndex={pageNumber - 1}
                    currentUser={currentUser}
                    attachment={attachment}
                  />
                </StyledScrollWrapper>
              )}
              <StyledAttachmentContainer>
                <DocumentSignatureEditorWithAttachment
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  numPages={numPages ?? 0}
                  setNumPages={setNumPages}
                  attachment={attachment}
                />
              </StyledAttachmentContainer>
            </StyledPageContainer>
          </form>
        </FormProvider>
      </PageBody>
    </PageContainer>
  );
};
