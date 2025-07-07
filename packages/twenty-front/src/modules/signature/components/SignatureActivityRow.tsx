import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Person } from '@/people/types/Person';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { formatToHumanReadableDateTime } from '~/utils/date-utils';
import { SignatureActivityItem } from '../types/Signature';

const StyledTimelineItemContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 'auto';
  justify-content: space-between;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 16px;
  width: 16px;
  margin: 5px;
  user-select: none;
  text-decoration-line: underline;
  z-index: 2;
`;

const StyledVerticalLineContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  z-index: 2;
  height: 100%;
`;

const StyledVerticalLine = styled.div`
  background: ${({ theme }) => theme.border.color.light};
  width: 2px;
  height: 100%;
`;

const StyledItemContainer = styled.div<{ isMarginBottom?: boolean }>`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  margin-bottom: ${({ isMarginBottom, theme }) =>
    isMarginBottom ? theme.spacing(3) : 0};
  min-height: 26px;
`;

const StyledActivityContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledActivityTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledActivityDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: wrap;
`;

const StyledActivityMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.light};
`;

export const SignatureActivityRow = ({
  activity,
  isLastActivity,
}: {
  activity: SignatureActivityItem;
  isLastActivity: boolean;
}) => {
  const { t } = useLingui();
  const beautifiedCreatedAt = formatToHumanReadableDateTime(activity.createdAt);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { record: person, loading: personLoading } = useFindOneRecord<Person>({
    objectNameSingular: CoreObjectNameSingular.Person,
    objectRecordId: activity.signerId || '',
    skip: activity.id === currentWorkspaceMember?.id,
  });

  let title = activity.title;
  let description = activity.description;

  // For signer-related activities, only show content when person data is available
  if (
    activity.type === 'SIGNER_NOTIFIED' ||
    activity.type === 'SIGNER_SIGNED'
  ) {
    if (personLoading) {
      title = t`Loading...`;
      description = t`Loading signer information...`;
    } else if (isDefined(person)) {
      const isCurrentUser = currentWorkspaceMember?.id === activity.signerId;
      if (isCurrentUser) {
        if (activity.type === 'SIGNER_NOTIFIED') {
          title = t`You notified`;
          description = t`You were notified to sign the document`;
        } else {
          title = t`You signed`;
          description = t`You completed your signature`;
        }
      } else {
        const displayName =
          person.name?.firstName && person.name?.lastName
            ? `${person.name.firstName} ${person.name.lastName.charAt(0)}.`
            : person.name?.firstName ||
              person.name?.lastName ||
              t`Unknown Person`;
        if (activity.type === 'SIGNER_NOTIFIED') {
          title = t`${displayName} notified`;
          description = t`${displayName} was notified to sign the document`;
        } else {
          title = t`${displayName} signed`;
          description = t`${displayName} completed their signature`;
        }
      }
    } else {
      // Fallback for when person data is not available
      title = t`Signer information unavailable`;
      description = t`Unable to load signer details`;
    }
  }

  return (
    <StyledTimelineItemContainer>
      <StyledLeftContainer>
        <StyledIconContainer>{activity.icon}</StyledIconContainer>
        {!isLastActivity && (
          <StyledVerticalLineContainer>
            <StyledVerticalLine />
          </StyledVerticalLineContainer>
        )}
      </StyledLeftContainer>
      <StyledItemContainer isMarginBottom={!isLastActivity}>
        <StyledActivityContent>
          <StyledActivityTitle>{title}</StyledActivityTitle>
          <StyledActivityDescription>{description}</StyledActivityDescription>
          <StyledActivityMeta>
            <span>{beautifiedCreatedAt}</span>
          </StyledActivityMeta>
        </StyledActivityContent>
      </StyledItemContainer>
    </StyledTimelineItemContainer>
  );
};
