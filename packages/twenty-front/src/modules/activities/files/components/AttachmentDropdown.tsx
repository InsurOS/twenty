import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
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
  isSignatureEnabled?: boolean;
};

export const AttachmentDropdown = ({
  onDownload,
  onDelete,
  onRename,
  scopeKey,
  isSignatureEnabled = false,
}: AttachmentDropdownProps) => {
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useCloseDropdown();

  const handleDownload = () => {
    onDownload();
    closeDropdown(dropdownId);
  };

  const handleDelete = () => {
    onDelete();
    closeDropdown(dropdownId);
  };

  const handleRename = () => {
    onRename();
    closeDropdown(dropdownId);
  };

  const handleCreateSignature = () => {
    console.log('create signature');
    closeDropdown();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={
        <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Narrow}>
          <DropdownMenuItemsContainer scrollable={false}>
            {isSignatureEnabled && (
              <MenuItem
                text="Create Signature"
                LeftIcon={IconSignature}
                onClick={handleCreateSignature}
                disabled
              />
            )}
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
