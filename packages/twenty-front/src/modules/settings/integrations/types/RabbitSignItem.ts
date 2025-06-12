export type RabbitSignKeyItem = {
  id: string;
  key: {
    id: string;
    secret: string;
  };
  workspaceMemberId: string;
  createdAt: string;
  __typename: 'RabbitSignKeyItem';
};
