import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  SignatureColor,
  SignatureColorCode,
  getSignatureColor,
} from '@/Signature/constants/signatureColors';
import styled from '@emotion/styled';
import { UseFormReturn } from 'react-hook-form';
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
  const personOptions = people.map((person) => ({
    label: `${person.name.firstName} ${person.name.lastName}`,
    value: person.id,
  }));

  const orderEnabled = watch('order_enabled');
  const signees = watch('signees');

  const addSignee = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSigneeIndex = signees.length;
    setValue('signees', [
      ...signees,
      { person: null, color: getSignatureColor(newSigneeIndex) },
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
        return typeof signee.person === 'string' && signee.person.length > 0;
      })
      .map((signee) => signee.person as string);

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
                  { person: null, color: getSignatureColor(0) },
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
                    defaultValue={field.person}
                    onChange={(value) => {
                      const newSignees = [...signees];
                      newSignees[index] = {
                        ...newSignees[index],
                        person: value as ObjectRecord | null,
                        color: getSignatureColor(index),
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
              // TODO: Handle signee selection for signature placement
              console.log('Selected signee:', value);
            }}
            options={signees
              .filter((signee) => signee.person !== null)
              .map((signee) => {
                const person = people.find((p) => p.id === signee.person);
                return {
                  label: person
                    ? `${person.name.firstName} ${person.name.lastName}`
                    : 'Unknown',
                  value: signee.person as string,
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
            onClick={() => onNext(SignatureCreationStep.SIGNATURE)}
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
