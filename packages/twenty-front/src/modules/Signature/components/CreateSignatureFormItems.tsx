import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { AdditionalrecipientsFormItem } from '@/Signature/components/AdditionalRecipientsFormItem';
import {
  StyledDescription,
  StyledTitle,
} from '@/Signature/components/SharedStyledComponents';
import { getSignatureColor } from '@/Signature/constants/signatureColors';
import { SignatureFieldType } from '@/Signature/constants/signatureFieldTypes';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCheckbox,
  IconLetterCaseUpper,
  IconPlus,
  IconSignature,
  IconTextScan2,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

export enum SignatureCreationStep {
  CONFIGURATION = 'configuration',
  SIGNATURE = 'signature',
}

type CreateSignatureFormItemsProps = {
  onNext: (step: SignatureCreationStep) => void;
  currentStep: SignatureCreationStep;
  currentPageIndex: number;
};

const StyledForm = styled.div`
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

const StyledBooleanFieldContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledDeleteSigneeButton = styled(IconButton)`
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 16px;
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 16px;
`;

export const CreateSignatureFormItems = ({
  onNext,
  currentStep,
  currentPageIndex,
}: CreateSignatureFormItemsProps) => {
  const { watch, setValue } = useFormContext<CreateSignatureFormValues>();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedSigneeIndex, setSelectedSigneeIndex] = useState<number | null>(
    null,
  );

  const { record: selectedPerson } = useFindOneRecord({
    objectNameSingular: 'person',
    objectRecordId: selectedPersonId ?? '',
    skip: !selectedPersonId,
  });
  const orderEnabled = watch('order_enabled');
  const signees = watch('signees');

  useEffect(() => {
    if (isDefined(selectedPerson) && isDefined(selectedSigneeIndex)) {
      const newSignees = [...watch('signees')];
      newSignees[selectedSigneeIndex] = {
        ...newSignees[selectedSigneeIndex],
        id: selectedPersonId,
        color: getSignatureColor(selectedSigneeIndex),
        name: `${selectedPerson?.name?.firstName} ${selectedPerson?.name?.lastName}`,
        email: selectedPerson?.emails?.primaryEmail,
      };
      setValue('signees', newSignees);
    }
  }, [selectedPerson, selectedSigneeIndex, selectedPersonId, setValue, watch]);

  const addSignee = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSigneeIndex = watch('signees').length;
    setValue('signees', [
      ...watch('signees'),
      { id: null, color: getSignatureColor(newSigneeIndex) },
    ]);
  };

  const removeSignee = (index: number) => {
    if (signees.length > 1) {
      const signeeToRemove = signees[index];
      const newSignees = [...signees];
      newSignees.splice(index, 1);
      setValue('signees', newSignees);

      // Remove all signatures associated with the removed signee
      if (isDefined(signeeToRemove.id)) {
        const currentSignatures = watch('signatures') || [];
        const remainingSignatures = currentSignatures.filter(
          (signature) => signature.signee_id !== signeeToRemove.id,
        );
        setValue('signatures', remainingSignatures);
      }
    }
  };

  const getSignatureBoxSize = (fieldType: SignatureFieldType) => {
    switch (fieldType) {
      case SignatureFieldType.SIGNATURE:
        return { width: 80, height: 15 };
      case SignatureFieldType.INITIALS:
        return { width: 30, height: 15 };
      case SignatureFieldType.TEXT:
        return { width: 80, height: 15 };
      case SignatureFieldType.DATE:
        return { width: 80, height: 15 };
      case SignatureFieldType.CHECKBOX:
        return { width: 15, height: 15 };
      default:
        return { width: 80, height: 15 };
    }
  };

  const getInitialsName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const addSignature = (fieldType: SignatureFieldType) => {
    const selectedSigneeId = watch('selected_signee_id');
    if (!selectedSigneeId) return;

    const selectedSignee = signees.find(
      (signee) => signee.id === selectedSigneeId,
    );
    if (!selectedSignee) return;

    const { width, height } = getSignatureBoxSize(fieldType);
    const initialsName = getInitialsName(selectedSignee.name ?? '');
    const currentSignatures = watch('signatures') || [];

    // Generate a unique index for the new signature
    const maxIndex =
      currentSignatures.length > 0
        ? Math.max(...currentSignatures.map((s) => s.index))
        : -1;

    const newSignature = {
      name: initialsName,
      email: selectedSignee.email ?? '',
      x: 50, // Default position from left
      y: 50, // Default position from top
      width,
      height,
      pageIndex: currentPageIndex,
      fieldType,
      signee_id: selectedSigneeId,
      index: maxIndex + 1,
    };

    setValue('signatures', [...currentSignatures, newSignature]);
  };
  const getExcludedPersonIds = (): string[] => {
    const signeeIds = signees.map((signee) => signee.id).filter(isDefined);
    const additionalrecipientIds = watch('additional_receiver_ids');
    return [...signeeIds, ...additionalrecipientIds].filter(
      (id) => id.length > 0,
    );
  };

  return (
    <StyledForm>
      {currentStep === SignatureCreationStep.CONFIGURATION && (
        <>
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

          <StyledBooleanFieldContainer>
            <FormBooleanFieldInput
              label="I am the only signee"
              defaultValue={false}
              onChange={(value) => {
                setValue('user_only', Boolean(value));
                if (value === true) {
                  setValue('signees', []);
                  setValue('order_enabled', false);
                  return;
                }
                setValue('signees', [
                  { id: null, color: getSignatureColor(0) },
                ]);
              }}
            />

            {!watch('user_only') && (
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
                    signees.map((signee, index) => ({
                      ...signee,
                      color: getSignatureColor(index),
                    })),
                  );
                }}
              />
            )}
          </StyledBooleanFieldContainer>

          <StyledTitle>Signees</StyledTitle>
          <StyledDescription>
            Add signees to the document. They will be able to sign the document.
          </StyledDescription>
          {!watch('user_only') && (
            <>
              {signees.map((field, index) => (
                <StyledSigneeContainer key={index}>
                  <FormRelationToOneFieldInput
                    label="Signee"
                    objectNameSingular="person"
                    defaultValue={field.id}
                    onChange={(value) => {
                      const personId = value as string | null;
                      setSelectedPersonId(personId);
                      setSelectedSigneeIndex(personId ? index : null);
                    }}
                    excludedRecordIds={getExcludedPersonIds()}
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
            </>
          )}

          <AdditionalrecipientsFormItem />
        </>
      )}
      {currentStep === SignatureCreationStep.SIGNATURE && (
        <>
          <FormSelectFieldInput
            label="Select Signee"
            defaultValue={watch('selected_signee_id')}
            onChange={(value) => {
              if (isDefined(value)) {
                setValue('selected_signee_id', value);
              }
            }}
            options={signees
              .filter((signee) => signee.id !== null)
              .map((signee) => {
                return {
                  label: signee.name ?? '',
                  value: signee.id as string,
                  Icon: () => <StyledColorCircle color={signee.color} />,
                };
              })}
          />
          <Button
            Icon={IconSignature}
            title="Add Signature"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.SIGNATURE)}
          />
          <Button
            Icon={IconLetterCaseUpper}
            title="Add Initials"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.INITIALS)}
          />
          <Button
            Icon={IconCalendar}
            title="Add Date"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.DATE)}
          />
          <Button
            Icon={IconTextScan2}
            title="Add Text"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.TEXT)}
          />
          <Button
            Icon={IconCheckbox}
            title="Add Checkbox"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.CHECKBOX)}
          />
        </>
      )}
      <StyledButtonContainer>
        {currentStep === SignatureCreationStep.CONFIGURATION && (
          <Button
            title="Next"
            variant="secondary"
            onClick={() => {
              if (isDefined(signees[0].id)) {
                setValue('selected_signee_id', signees[0].id);
                onNext(SignatureCreationStep.SIGNATURE);
              }
            }}
          />
        )}
        {currentStep === SignatureCreationStep.SIGNATURE && (
          <StyledBooleanFieldContainer>
            <Button
              title="Previous"
              variant="secondary"
              onClick={() => onNext(SignatureCreationStep.CONFIGURATION)}
            />
            <Button
              title="Submit"
              variant="primary"
              accent="green"
              onClick={() => onNext(SignatureCreationStep.CONFIGURATION)}
            />
          </StyledBooleanFieldContainer>
        )}
      </StyledButtonContainer>
    </StyledForm>
  );
};
