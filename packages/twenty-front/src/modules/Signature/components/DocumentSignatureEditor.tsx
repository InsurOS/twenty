import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Document, Page } from 'react-pdf';
import { useParams } from 'react-router-dom';
import {
  IconCalendar,
  IconCheckbox,
  IconChevronLeft,
  IconChevronRight,
  IconLetterCaseUpper,
  IconMinus,
  IconPlus,
  IconSignature,
  IconTextScan2,
  IconX,
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

enum SignatureType {
  SIGNATURE = 1,
  INITIALS = 2,
  DATE = 3,
  TEXT = 4,
  CHECKBOX = 5,
}

const MapSignatureTypeToIcon = {
  [SignatureType.SIGNATURE]: <IconSignature size={16} />,
  [SignatureType.INITIALS]: <IconLetterCaseUpper size={16} />,
  [SignatureType.DATE]: <IconCalendar size={16} />,
  [SignatureType.TEXT]: <IconTextScan2 size={16} />,
  [SignatureType.CHECKBOX]: <IconCheckbox size={16} />,
};

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

const StyledPage = styled(Page)`
  position: relative;
`;

const hexToRGBA = (hex: string, alpha: number): string => {
  // Remove the hash if it exists
  const cleanHex = hex.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Convert alpha to hex (0-255)
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');

  // Return hex with alpha
  return `#${cleanHex}${alphaHex}`;
};

const StyledSignatureBox = styled.div<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}>`
  background-color: ${({ color }) => hexToRGBA(color, 0.2)};
  border: 2px solid ${({ color }) => color};
  cursor: move;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  height: ${({ height }) => height}px;
  left: ${({ x }) => x}px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: ${({ y }) => y}px;
  user-select: none;
  width: ${({ width }) => width}px;
`;

const StyledSignatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSignatureLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledRemoveButton = styled(IconButton)`
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.light};
  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledSignatureName = styled.span<{
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}>`
  background: ${({ color }) => color};
  border-radius: 4px;
  color: ${({ theme }) => theme.font.color.inverted};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  left: ${({ x }) => x}px;
  padding: 2px 8px;
  pointer-events: none;
  position: absolute;
  text-align: left;
  top: ${({ y, height }) => y + height + 18}px;
  width: ${({ width }) => width}px;
  white-space: nowrap;
`;

const StyledSignatureRemoveButton = styled(IconButton)<{
  x: number;
  y: number;
  width: number;
}>`
  position: absolute;
  left: ${({ x, width }) => x + width + 6}px;
  top: ${({ y }) => y - 12}px;
  z-index: 11;
  background: ${({ theme }) => theme.color.red};
  color: ${({ theme }) => theme.font.color.inverted};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${({ theme }) => theme.color.red50};
  }
`;

type DocumentSignatureEditorProps = {
  onPageChange?: (pageIndex: number) => void;
  pageNumber: number;
  numPages: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  setNumPages: React.Dispatch<React.SetStateAction<number>>;
};

export const DocumentSignatureEditor = ({
  onPageChange,
  pageNumber,
  numPages,
  setPageNumber,
  setNumPages,
}: DocumentSignatureEditorProps) => {
  const { watch, setValue } = useFormContext<CreateSignatureFormValues>();
  const signees = watch('signees');
  const selectedSigneeId = watch('selected_signee_id');
  const selectedSignee = signees.find(
    (signee) => signee.id === selectedSigneeId,
  );
  const [scale, setScale] = useState(1);
  const [draggedBox, setDraggedBox] = useState<{
    signeeId: string;
    signatureIndex: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const { signatureId } = useParams();
  const { record: attachment, loading: attachmentLoading } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    objectRecordId: signatureId,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    onPageChange?.(pageNumber - 1);
  }, [pageNumber, onPageChange]);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages ?? prev));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    signeeId: string,
    signatureIndex: number,
  ) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    const page = e.currentTarget
      .closest('.react-pdf__Page')
      ?.getBoundingClientRect();
    if (!page) return;
    const signature = signees.find((s) => s.id === signeeId)?.signatures[
      signatureIndex
    ];
    if (!signature) return;
    const offsetX = (e.clientX - page.left) / scale - signature.x;
    const offsetY = (e.clientY - page.top) / scale - signature.y;
    setDraggedBox({
      signeeId,
      signatureIndex,
      offsetX,
      offsetY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedBox) return;
    const page = document
      .querySelector('.react-pdf__Page')
      ?.getBoundingClientRect();
    if (!page) return;
    const newX = (e.clientX - page.left) / scale - draggedBox.offsetX;
    const newY = (e.clientY - page.top) / scale - draggedBox.offsetY;
    const newSignees = signees.map((signee) => {
      if (signee.id === draggedBox.signeeId) {
        const newSignatures = [...signee.signatures];
        newSignatures[draggedBox.signatureIndex] = {
          ...newSignatures[draggedBox.signatureIndex],
          x: newX,
          y: newY,
        };
        return { ...signee, signatures: newSignatures };
      }
      return signee;
    });
    setValue('signees', newSignees);
  };

  const handleMouseUp = () => {
    setDraggedBox(null);
  };

  const handleRemoveSignature = (signeeId: string, signatureIndex: number) => {
    const newSignees = signees.map((signee) => {
      if (signee.id === signeeId) {
        return {
          ...signee,
          signatures: signee.signatures.filter(
            (_, index) => index !== signatureIndex,
          ),
        };
      }
      return signee;
    });
    setValue('signees', newSignees);
  };

  return (
    <>
      {attachmentLoading ? (
        <StyledFallback>Loading document...</StyledFallback>
      ) : attachment ? (
        <StyledPdfWrapper
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Document
            file={attachment.fullPath}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <StyledPage
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            >
              {signees && signees?.length > 0
                ? signees.map((signee) =>
                    signee.signatures?.length > 0
                      ? signee.signatures
                          .filter(
                            (signature) =>
                              signature.pageIndex === pageNumber - 1,
                          )
                          .map((signature, index) => (
                            <>
                              <StyledSignatureName
                                x={signature.x}
                                y={signature.y}
                                width={signature.width}
                                height={signature.height}
                                color={signee.color}
                              >
                                {signature.name}
                              </StyledSignatureName>
                              <StyledSignatureRemoveButton
                                x={signature.x}
                                y={signature.y}
                                width={signature.width}
                                Icon={IconX}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSignature(signee.id ?? '', index);
                                }}
                                variant="tertiary"
                                size="small"
                              />
                              <StyledSignatureBox
                                key={`${signee.id}-${index}`}
                                x={signature.x}
                                y={signature.y}
                                width={signature.width}
                                height={signature.height}
                                color={signee.color}
                                onMouseDown={(e) =>
                                  handleMouseDown(e, signee.id ?? '', index)
                                }
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                  }}
                                >
                                  {
                                    MapSignatureTypeToIcon[
                                      Number(
                                        signature.fieldType + 1,
                                      ) as keyof typeof MapSignatureTypeToIcon
                                    ]
                                  }
                                </div>
                              </StyledSignatureBox>
                            </>
                          ))
                      : null,
                  )
                : null}
            </StyledPage>
          </Document>
          <StyledPdfControls>
            <IconButton
              Icon={IconChevronLeft}
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="tertiary"
            />
            <span>
              Page {pageNumber} of {numPages ?? '?'}
            </span>
            <IconButton
              Icon={IconChevronRight}
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages ?? pageNumber)}
              variant="tertiary"
            />
            <IconButton
              Icon={IconMinus}
              onClick={zoomOut}
              disabled={scale <= 0.5}
              variant="tertiary"
            />
            <span>{Math.round(scale * 100)}%</span>
            <IconButton
              Icon={IconPlus}
              onClick={zoomIn}
              disabled={scale >= 2}
              variant="tertiary"
            />
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
