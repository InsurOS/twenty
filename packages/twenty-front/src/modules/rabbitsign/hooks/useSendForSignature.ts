import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

type UseSendForSignatureProps = {
  objectNameSingular: string;
};

/**
 * Hook to handle sending a document for signature via RabbitSign
 */
export const useSendForSignature = ({ objectNameSingular }: UseSendForSignatureProps) => {
  const navigate = useNavigate();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const sendForSignature = useCallback(
    (recordId: string) => {
      // Navigate to the signature configuration page with the document ID and metadata
      navigate(`/rabbitsign/configure`, {
        state: {
          recordId,
          objectMetadataId: objectMetadataItem.id,
          objectNameSingular: objectMetadataItem.nameSingular,
        },
      });
    },
    [navigate, objectMetadataItem],
  );

  return {
    sendForSignature,
  };
}; 