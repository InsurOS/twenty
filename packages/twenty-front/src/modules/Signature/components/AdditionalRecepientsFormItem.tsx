import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { useFetchPeople } from '@/people/types/hooks/useFetchPeople';
import {
  StyledDeleteSigneeButton,
  StyledDescription,
  StyledSigneeContainer,
  StyledTitle,
} from '@/Signature/components/SharedStyledComponents';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

export const AdditionalRecepientsFormItem = () => {
  const { people: additionalRecepients, fetchPeople } = useFetchPeople();
  const { setValue, watch } = useFormContext<CreateSignatureFormValues>();
  const additionalRecepientIds = watch('additional_receiver_ids');
  const signees = watch('signees');
  const emails = watch('additional_receiver_emails');
  console.log(emails);

  const addAdditionalRecepient = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('additional_receiver_ids', [...additionalRecepientIds, '']);
  };

  const removeAdditionalRecepient = (index: number) => {
    const newAdditionalRecepientIds = [...additionalRecepientIds];
    newAdditionalRecepientIds.splice(index, 1);
    setValue('additional_receiver_ids', newAdditionalRecepientIds);
  };

  const getExcludedPersonIds = (): string[] => {
    const signeeIds = signees.map((signee) => signee.id).filter(isDefined);
    return [...signeeIds, ...additionalRecepientIds].filter(
      (id) => id.length > 0,
    );
  };

  useEffect(() => {
    setValue(
      'additional_receiver_emails',
      additionalRecepients.map((person) => person.emails?.primaryEmail ?? ''),
    );
  }, [additionalRecepients, setValue]);

  return (
    <>
      <StyledTitle>Additional Recipients</StyledTitle>
      <StyledDescription>
        Send finished documents to these recipients (they won't need to sign)
      </StyledDescription>
      {additionalRecepientIds.map((recepientId, index) => (
        <StyledSigneeContainer key={index}>
          <FormRelationToOneFieldInput
            label="Additional Recepient"
            objectNameSingular="person"
            defaultValue={recepientId}
            onChange={(value) => {
              const personId = value as string;
              const updatedAdditionalRecepientIds = [...additionalRecepientIds];
              updatedAdditionalRecepientIds[index] = personId;
              setValue(
                'additional_receiver_ids',
                updatedAdditionalRecepientIds,
              );
              fetchPeople(updatedAdditionalRecepientIds);
            }}
            excludedRecordIds={getExcludedPersonIds()}
          />

          <StyledDeleteSigneeButton
            Icon={IconX}
            onClick={() => removeAdditionalRecepient(index)}
            variant="tertiary"
            size="small"
          />
        </StyledSigneeContainer>
      ))}
      <Button
        Icon={IconPlus}
        title="Add Additional Recepient"
        onClick={addAdditionalRecepient}
      />
    </>
  );
};
