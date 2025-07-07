import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { gql, useMutation } from '@apollo/client';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

const CREATE_RABBIT_SIGN_SIGNATURE_WITH_EXTERNAL = gql`
  mutation CreateRabbitSignSignatureWithExternalCall(
    $input: CreateOneRabbitSignSignatureInput!
  ) {
    createRabbitSignSignatureWithExternalCall(input: $input) {
      id
    }
  }
`;

export const useCreateSignature = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Attachment,
  });
  const computedRecordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });
  const { findOneRecordQuery: findOneAttachmentQuery } = useFindOneRecordQuery({
    objectNameSingular: CoreObjectNameSingular.Attachment,
    recordGqlFields: computedRecordGqlFields,
  });

  const apolloCoreClient = useContext(ApolloCoreClientContext);

  const [createSignatureMutation, { loading, error }] = useMutation(
    CREATE_RABBIT_SIGN_SIGNATURE_WITH_EXTERNAL,
    { client: apolloCoreClient ?? undefined },
  );

  const createSignature = async (formValues: CreateSignatureFormValues) => {
    if (!currentWorkspaceMember) {
      throw new Error('No current workspace member found');
    }

    // Convert signatures to JSON string for the DTO
    const signaturesJson = JSON.stringify(formValues.signatures || []);

    const result = await createSignatureMutation({
      variables: {
        input: {
          title: formValues.title,
          message: formValues.message,
          signatureStatus: 'PROCESSING',
          workspaceMemberId: currentWorkspaceMember.id,
          filename: formValues.file_name,
          attachmentId: formValues.attachment_id,
          signaturesData: signaturesJson,
        },
      },
      refetchQueries: [
        {
          query: findOneAttachmentQuery,
          variables: { objectRecordId: formValues.attachment_id },
        },
      ],
    });

    return result.data.createRabbitSignSignatureWithExternalCall;
  };

  return {
    createSignature,
    loading,
    error,
  };
};
