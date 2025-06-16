import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PageHeaderToggleCommandMenuButton } from '@/ui/layout/page-header/components/PageHeaderToggleCommandMenuButton';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PageTitle } from '@/ui/utilities/page-title/components/PageTitle';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { Suspense, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
    IconChevronLeft,
    IconChevronRight,
    IconMinus,
    IconPlus,
    IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import {
    AnimatedPlaceholder,
    AnimatedPlaceholderEmptyContainer,
    AnimatedPlaceholderEmptySubTitle,
    AnimatedPlaceholderEmptyTextContainer,
    AnimatedPlaceholderEmptyTitle,
    EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  signees: z
    .array(
      z.object({
        person: z.union([z.string(), z.custom<ObjectRecord>(), z.null()]),
        order: z.number().optional(),
      }),
    )
    .min(1, 'At least one signee is required'),
  user_only: z.boolean(),
  order_enabled: z.boolean(),
  additional_receiver_ids: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const StyledPageContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSigneeContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOrderSelect = styled.div`
  width: 100px;
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

const StyledPdfWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const StyledFallback = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBooleanFieldContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledPdfControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  background-color: transparent;
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.primary};
  }
`;

const StyledZoomControls = styled.div`
  align-items: center;
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledZoomLevel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  min-width: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const StyledPageNumber = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.primary};
  }
`;

const StyledDeleteSigneeButton = styled(IconButton)`
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledScrollWrapper = styled(ScrollWrapper)`
  min-width: 340px;
  width: 340px;
`;

export const SignaturePage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const { signatureId } = useParams();
  const { record: attachment, loading: attachmentLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    objectRecordId: signatureId,
  });

  const { control, watch, setValue, getValues } = useForm<FormValues>({
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

  const { records: people } = useFindManyRecords({
    objectNameSingular: 'person',
    limit: 100,
  });

  const personOptions = people.map((person) => ({
    label: `${person.name.firstName} ${person.name.lastName}`,
    value: person.id,
  }));

  const orderEnabled = watch('order_enabled');
  const signees = watch('signees');

  const addSignee = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('signees', [...signees, { person: null }]);
  };

  const removeSignee = (index: number) => {
    if (signees.length > 1) {
      const newSignees = [...signees];
      newSignees.splice(index, 1);
      setValue('signees', newSignees);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log('Form submitted:', watch());
  };

  const getExcludedPersonIds = (currentIndex: number): string[] => {
    const selectedPersonIds = signees
      .filter((signee, index) => {
        if (index === currentIndex) return false;
        return typeof signee.person === 'string' && signee.person.length > 0;
      })
      .map((signee) => signee.person as string);

    const additionalReceiverIds = watch('additional_receiver_ids');
    return [...selectedPersonIds, ...additionalReceiverIds];
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  return (
    <PageContainer>
      <PageTitle title="Signature Request" />
      <PageHeader title="Signature Request">
        <PageHeaderToggleCommandMenuButton />
      </PageHeader>
      <PageBody>
        <StyledPageContainer>
          <StyledScrollWrapper componentInstanceId="signature-form">
            <StyledForm onSubmit={handleSubmit}>
              <FormTextFieldInput
                label="Title"
                defaultValue=""
                placeholder="Enter Signature Request Title"
                onChange={(value) => setValue('title', value)}
              />

              <FormTextFieldInput
                label="Message"
                defaultValue=""
                placeholder="Enter Signature Request Message"
                onChange={(value) => setValue('message', value)}
                multiline
              />

              {signees.map((field, index) => (
                <StyledSigneeContainer key={index}>
                  <FormRelationToOneFieldInput
                    label="Signee"
                    objectNameSingular="person"
                    defaultValue={field.person}
                    onChange={(value) => {
                      const newSignees = [...signees];
                      newSignees[index] = {
                        ...newSignees[index],
                        person: value as ObjectRecord | null,
                      };
                      setValue('signees', newSignees);
                    }}
                    excludedRecordIds={getExcludedPersonIds(index)}
                  />
                  {orderEnabled && (
                    <StyledOrderSelect>
                      <FormSelectFieldInput
                        label="Order"
                        defaultValue={(index + 1).toString()}
                        onChange={(value) => {
                          const newSignees = [...signees];
                          newSignees[index] = {
                            ...newSignees[index],
                            order: parseInt(value as string),
                          };
                          setValue('signees', newSignees);
                        }}
                        options={Array.from(
                          { length: signees.length },
                          (_, i) => ({
                            label: `${i + 1}`,
                            value: `${i + 1}`,
                          }),
                        )}
                      />
                    </StyledOrderSelect>
                  )}
                  {index > 0 && (
                    <StyledDeleteSigneeButton
                      Icon={IconX}
                      onClick={() => removeSignee(index)}
                      variant="tertiary"
                      size="small"
                    />
                  )}
                </StyledSigneeContainer>
              ))}

              <Button Icon={IconPlus} title="Add Signee" onClick={addSignee} />

              <StyledBooleanFieldContainer>
                <FormBooleanFieldInput
                  label="I am the only signee"
                  defaultValue={false}
                  onChange={(value) => setValue('user_only', Boolean(value))}
                />

                <FormBooleanFieldInput
                  label="Enable signing order"
                  defaultValue={false}
                  onChange={(value) => {
                    setValue('order_enabled', Boolean(value));
                    if (value === true) {
                      const newSignees = signees.map((signee, index) => ({
                        ...signee,
                        order: index + 1,
                      }));
                      setValue('signees', newSignees);
                      return;
                    }
                    setValue(
                      'signees',
                      signees.map(({ person }) => ({ person })),
                    );
                  }}
                />
              </StyledBooleanFieldContainer>

              <FormMultiSelectFieldInput
                label="Send Finished Documents to Additional Recepients"
                defaultValue={watch('additional_receiver_ids')}
                options={personOptions}
                onChange={(value) => {
                  if (Array.isArray(value)) {
                    setValue('additional_receiver_ids', value);
                  }
                }}
                placeholder="Select additional recipients"
              />
            </StyledForm>
          </StyledScrollWrapper>
          <StyledAttachmentContainer>
            {attachmentLoading ? (
              <StyledFallback>Loading document...</StyledFallback>
            ) : attachment ? (
              <Suspense
                fallback={<StyledFallback>Loading PDF...</StyledFallback>}
              >
                <StyledPdfWrapper>
                  <Document
                    file={attachment.fullPath}
                    onLoadSuccess={onDocumentLoadSuccess}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                </StyledPdfWrapper>
                <StyledPdfControls>
                  <IconButton
                    Icon={IconChevronLeft}
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    variant="tertiary"
                  />
                  <StyledPageNumber>
                    Page {pageNumber} of {numPages || '-'}
                  </StyledPageNumber>
                  <IconButton
                    Icon={IconChevronRight}
                    onClick={goToNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    variant="tertiary"
                  />
                  <StyledZoomControls>
                    <IconButton
                      Icon={IconMinus}
                      onClick={zoomOut}
                      disabled={scale <= 0.5}
                      variant="tertiary"
                    />
                    <StyledZoomLevel>
                      {Math.round(scale * 100)}%
                    </StyledZoomLevel>
                    <IconButton
                      Icon={IconPlus}
                      onClick={zoomIn}
                      disabled={scale >= 2}
                      variant="tertiary"
                    />
                  </StyledZoomControls>
                </StyledPdfControls>
              </Suspense>
            ) : (
              <AnimatedPlaceholderEmptyContainer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
              >
                <AnimatedPlaceholder type="noFile" />
                <AnimatedPlaceholderEmptyTextContainer>
                  <AnimatedPlaceholderEmptyTitle>
                    No Document
                  </AnimatedPlaceholderEmptyTitle>
                  <AnimatedPlaceholderEmptySubTitle>
                    No document was found for this signature request.
                  </AnimatedPlaceholderEmptySubTitle>
                </AnimatedPlaceholderEmptyTextContainer>
              </AnimatedPlaceholderEmptyContainer>
            )}
          </StyledAttachmentContainer>
        </StyledPageContainer>
      </PageBody>
    </PageContainer>
  );
};
