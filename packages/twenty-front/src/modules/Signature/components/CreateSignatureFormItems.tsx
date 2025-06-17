import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import {
  SignatureColor,
  SignatureColorCode,
  getSignatureColor,
} from '@/Signature/constants/signatureColors';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconX } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

export enum SignatureCreationStep {
  CONFIGURATION = 'configuration',
  SIGNATURE = 'signature',
}

type CreateSignatureFormItemsProps = {
  onNext: (step: SignatureCreationStep) => void;
  currentStep: SignatureCreationStep;
} & Pick<UseFormReturn<CreateSignatureFormValues>, 'watch' | 'setValue'>;

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
  justify-content: flex-end;
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
  watch,
  setValue,
}: CreateSignatureFormItemsProps) => {
  const { records: people } = useFindManyRecords({
    objectNameSingular: 'person',
    limit: 100,
  });

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedSigneeIndex, setSelectedSigneeIndex] = useState<number | null>(
    null,
  );
  const { record: selectedPerson } = useFindOneRecord({
    objectNameSingular: 'person',
    objectRecordId: selectedPersonId ?? '',
    skip: !selectedPersonId,
  });

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

  const personOptions = people.map((person) => ({
    label: `${person.name.firstName} ${person.name.lastName}`,
    value: person.id,
  }));

  const orderEnabled = watch('order_enabled');
  const signees = watch('signees');
  const selectedSigneeId = watch('selected_signee_id');
  const formValues = watch();
  console.log('formValues', formValues);
  const selectedSignee = signees.find(
    (signee) => signee.id === selectedSigneeId,
  );

  const addSignee = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSigneeIndex = signees.length;
    setValue('signees', [
      ...signees,
      { id: null, color: getSignatureColor(newSigneeIndex) },
    ]);
  };

  const removeSignee = (index: number) => {
    if (signees.length > 1) {
      const newSignees = [...signees];
      newSignees.splice(index, 1);
      setValue('signees', newSignees);
    }
  };

  const getExcludedPersonIds = (currentIndex: number): string[] => {
    const selectedPersonIds = signees
      .filter((signee, index) => {
        if (index === currentIndex) return false;
        return typeof signee.id === 'string' && signee.id.length > 0;
      })
      .map((signee) => signee.id as string);

    const additionalReceiverIds = watch('additional_receiver_ids');
    return [...selectedPersonIds, ...additionalReceiverIds];
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
            </>
          )}

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
        </>
      )}
      {currentStep === SignatureCreationStep.SIGNATURE && (
        <>
          <FormSelectFieldInput
            label="Select Signee"
            defaultValue=""
            onChange={(value) => {
              setValue('selected_signee_id', value);
            }}
            options={signees
              .filter((signee) => signee.id !== null)
              .map((signee) => {
                return {
                  label: signee.name ?? '',
                  value: signee.id as string,
                  Icon: () => (
                    <StyledColorCircle
                      color={SignatureColorCode[signee.color as SignatureColor]}
                    />
                  ),
                };
              })}
          />
        </>
      )}
      <StyledButtonContainer>
        {currentStep === SignatureCreationStep.CONFIGURATION && (
          <Button
            title="Next"
            variant="primary"
            onClick={() => {
              setValue('selected_signee_id', signees[0].id);
              onNext(SignatureCreationStep.SIGNATURE);
            }}
          />
        )}
        {currentStep === SignatureCreationStep.SIGNATURE && (
          <Button
            title="Previous"
            variant="primary"
            onClick={() => onNext(SignatureCreationStep.CONFIGURATION)}
          />
        )}
      </StyledButtonContainer>
    </StyledForm>
  );
};
