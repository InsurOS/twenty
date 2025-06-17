import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Document, Page } from 'react-pdf';
import { useParams } from 'react-router-dom';
import {
  IconChevronLeft,
  IconChevronRight,
  IconMinus,
  IconPlus,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

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

export const DocumentSignatureEditor = () => {
  const { watch, setValue } = useFormContext<CreateSignatureFormValues>();
  const signees = watch('signees');
  const selectedSigneeId = watch('selected_signee_id');
  const selectedSignee = signees.find(
    (signee) => signee.id === selectedSigneeId,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const { signatureId } = useParams();
  const { record: attachment, loading: attachmentLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    objectRecordId: signatureId,
  });

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
    <>
      {attachmentLoading ? (
        <StyledFallback>Loading document...</StyledFallback>
      ) : attachment ? (
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
            ></Page>
          </Document>
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
              <StyledZoomLevel>{Math.round(scale * 100)}%</StyledZoomLevel>
              <IconButton
                Icon={IconPlus}
                onClick={zoomIn}
                disabled={scale >= 2}
                variant="tertiary"
              />
            </StyledZoomControls>
          </StyledPdfControls>
        </StyledPdfWrapper>
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
    </>
  );
};
