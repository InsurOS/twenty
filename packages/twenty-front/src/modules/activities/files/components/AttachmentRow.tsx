import { ActivityRow } from '@/activities/components/ActivityRow';
import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { AttachmentIcon } from '@/activities/files/components/AttachmentIcon';
import { Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/record-field/contexts/FieldContext';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/const/previewable-extensions.const';
import { AppPath } from '@/types/AppPath';
import { createPortal } from 'react-dom';
import { pdfjs } from 'react-pdf';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { isNavigationModifierPressed } from 'twenty-ui/utilities';
import {
  formatToHumanReadableDate,
  formatToHumanReadableDateWithoutYear,
} from '~/utils/date-utils';
import { getFileNameAndExtension } from '~/utils/file/getFileNameAndExtension';
import { getAppPath } from '~/utils/navigation/getAppPath';
import { AttachmentRowStatusIcon } from './AttachmentRowStatusIcon';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  width: 100%;
  overflow: auto;
  flex: 1;
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledLink = styled.a`
  align-items: center;
  appearance: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  text-align: left;
  text-decoration: none;
  width: 100%;

  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledLinkContainer = styled.div`
  overflow: auto;
  width: 100%;
`;

const StyledAttachmentDate = styled.span`
  text-align: right;
  width: 44px;
`;

type AttachmentRowProps = {
  attachment: Attachment;
  onPreview?: (attachment: Attachment) => void;
};

export const SIGNATURE_MODAL_ID = 'signature-modal';

export const AttachmentRow = ({
  attachment,
  onPreview,
}: AttachmentRowProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { name: originalFileName, extension: attachmentFileExtension } =
    getFileNameAndExtension(attachment.name);

  const fileExtension =
    attachmentFileExtension?.toLowerCase().replace('.', '') ?? '';
  const isPreviewable = PREVIEWABLE_EXTENSIONS.includes(fileExtension);

  const [attachmentFileName, setAttachmentFileName] =
    useState(originalFileName);

  const attachmentDateTooltipComponentId = `attachment-date-${attachment.id}`;

  const { destroyOneRecord: destroyOneAttachment } = useDestroyOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const handleDelete = () => {
    destroyOneAttachment(attachment.id);
  };

  const { updateOneRecord: updateOneAttachment } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });

  const handleRename = () => {
    setIsEditing(true);
  };

  const saveAttachmentName = () => {
    setIsEditing(false);

    const newFileName = `${attachmentFileName}${attachmentFileExtension}`;

    updateOneAttachment({
      idToUpdate: attachment.id,
      updateOneRecordInput: { name: newFileName },
    });
  };

  const handleOnBlur = () => {
    saveAttachmentName();
  };

  const handleOnChange = (newFileName: string) => {
    setAttachmentFileName(newFileName);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveAttachmentName();
    }
  };

  const handleDownload = () => {
    downloadFile(
      attachment.fullPath,
      `${attachmentFileName}${attachmentFileExtension}`,
    );
  };

  const handleOpenDocument = (e: React.MouseEvent) => {
    // Cmd/Ctrl+click opens new tab, right click opens context menu
    if (isNavigationModifierPressed(e) === true) {
      return;
    }

    // Only prevent default and use preview if onPreview is provided
    if (isDefined(onPreview)) {
      e.preventDefault();
      onPreview(attachment);
    }
  };

  const signatureEnabled = attachment.type === 'TextDocument';

  return (
    <FieldContext.Provider
      value={
        {
          recordId: attachment.id,
        } as GenericFieldContextType
      }
    >
      <ActivityRow disabled>
        <StyledLeftContent>
          <AttachmentIcon attachmentType={attachment.type} />
          {isEditing ? (
            <TextInput
              value={attachmentFileName}
              onChange={handleOnChange}
              onBlur={handleOnBlur}
              autoFocus
              onKeyDown={handleOnKeyDown}
            />
          ) : (
            <StyledLinkContainer>
              {isPreviewable ? (
                <StyledLink
                  onClick={handleOpenDocument}
                  href={attachment.fullPath}
                >
                  <OverflowingTextWithTooltip text={attachment.name} />
                </StyledLink>
              ) : (
                <StyledLink
                  href={attachment.fullPath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OverflowingTextWithTooltip text={attachment.name} />
                </StyledLink>
              )}
            </StyledLinkContainer>
          )}
        </StyledLeftContent>
        <StyledRightContent>
          <AttachmentRowStatusIcon attachment={attachment} />
          <StyledAttachmentDate id={attachmentDateTooltipComponentId}>
            {formatToHumanReadableDateWithoutYear(attachment.createdAt)}
          </StyledAttachmentDate>
          {createPortal(
            <AppTooltip
              anchorSelect={`#${attachmentDateTooltipComponentId}`}
              place="top"
              content={formatToHumanReadableDate(attachment.createdAt)}
              delay={TooltipDelay.shortDelay}
            />,
            document.body,
          )}
          <AttachmentDropdown
            scopeKey={attachment.id}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRename={handleRename}
            onSignature={
              signatureEnabled
                ? () => {
                    navigate(
                      getAppPath(AppPath.Signature, {
                        attachmentId: attachment.id,
                      }),
                    );
                  }
                : undefined
            }
            signatureId={attachment.signatureId}
          />
        </StyledRightContent>
      </ActivityRow>
    </FieldContext.Provider>
  );
};
