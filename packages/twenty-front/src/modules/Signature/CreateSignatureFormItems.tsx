import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/form-types/components/FormMultiSelectFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { IconPlus, IconX } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { z } from 'zod';

export enum SignatureCreationStep {
  CONFIGURATION = 'configuration',
  SIGNATURE = 'signature',
}

type CreateSignatureFormItemsProps = {
  onNext: (step: SignatureCreationStep) => void;
  currentStep: SignatureCreationStep;
};

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

export const CreateSignatureFormItems = ({
  onNext,
  currentStep,
}: CreateSignatureFormItemsProps) => {
  const { records: people } = useFindManyRecords({
    objectNameSingular: 'person',
    limit: 100,
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

  return (
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
            setValue('signees', [{ person: null }]);
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
                signees.map(({ person }) => ({ person })),
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
                    options={Array.from({ length: signees.length }, (_, i) => ({
                      label: `${i + 1}`,
                      value: `${i + 1}`,
                    }))}
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
