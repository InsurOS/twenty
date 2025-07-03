import { AttachmentSignatureAuditTrailActionItem } from '@/activities/files/components/AttachmentSignatureAuditTrailActionItem';
import { AttachmentSignatureSignedAttachmentActionItem } from '@/activities/files/components/AttachmentSignatureSignedAttachmentActionItem';
import { useGetMenuDropdownWidth } from '@/activities/files/hooks/useGetMenuDropdownWidth';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import {
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconSignature,
  IconTrash,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

type AttachmentDropdownProps = {
  onDownload: () => void;
  onDelete: () => void;
  onRename: () => void;
  scopeKey: string;
  onSignature?: () => void;
  signatureId: string | null;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  onRename,
  scopeKey,
  onSignature,
  signatureId,
}: AttachmentDropdownProps) => {
  const dropdownWidth = useGetMenuDropdownWidth({ signatureId });
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);

  const handleDownload = () => {
    onDownload();
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown();
  };

  const handleRename = () => {
    onRename();
    closeDropdown();
  };

  const handleNavigateSignaturePage = () => {
    onSignature?.();
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={dropdownWidth}>
          <DropdownMenuItemsContainer scrollable={false}>
            {Boolean(onSignature) && (
              <MenuItem
                text={signatureId ? 'View Signature' : 'Create Signature'}
                LeftIcon={IconSignature}
                onClick={handleNavigateSignaturePage}
              />
            )}
            <AttachmentSignatureAuditTrailActionItem
              signatureId={signatureId}
              type="menuItem"
            />
            <AttachmentSignatureSignedAttachmentActionItem
              signatureId={signatureId}
              type="menuItem"
            />
            <MenuItem
              text="Download"
              LeftIcon={IconDownload}
              onClick={handleDownload}
            />
            <MenuItem
              text="Rename"
              LeftIcon={IconPencil}
              onClick={handleRename}
            />
            <MenuItem
              text="Delete"
              accent="danger"
              LeftIcon={IconTrash}
              onClick={handleDelete}
            />
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
