import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { SignatureComplete } from '@/signature/types/Signature';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { isDefined } from 'twenty-shared/utils';

type UseGetMenuDropdownWidthProps = {
  signatureId: string | null;
};

export const useGetMenuDropdownWidth = ({
  signatureId,
}: UseGetMenuDropdownWidthProps) => {
  const { record: signature, loading: signatureLoading } =
    useFindOneRecord<SignatureComplete>({
      objectNameSingular: CoreObjectNameSingular.RABBIT_SIGN_SIGNATURE,
      objectRecordId: signatureId ?? '',
      skip: !signatureId,
    });

  if (signatureLoading) {
    return GenericDropdownContentWidth.Narrow;
  }

  if (!signature) {
    return GenericDropdownContentWidth.Narrow;
  }

  if (isDefined(signature.signatureSignedAttachment)) {
    return GenericDropdownContentWidth.Medium;
  }

  return GenericDropdownContentWidth.Narrow;
};
