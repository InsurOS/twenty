export type Signature = {
  id: string;
  attachmentId: string;
  title: string;
  message: string;
  createdAt: string;
  folderId: string;
  updatedAt: string;
  deletedAt: string;
  signatureStatus: SignatureStatus;
  workspaceMemberId: string;
  __typename: 'RabbitSignSignature';
};

export enum SignatureStatus {
  PROCESSING = 'PROCESSING',
  SENT_FOR_SIGNATURE = 'SENT_FOR_SIGNATURE',
  SIGNED = 'SIGNED',
  FAILED = 'FAILED',
}
