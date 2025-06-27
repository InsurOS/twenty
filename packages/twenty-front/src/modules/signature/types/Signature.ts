import { Attachment } from '@/activities/files/types/Attachment';

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

export enum SignatureSignerStatus {
  NOTIFIED = 'NOTIFIED',
  SIGNED = 'SIGNED',
}

export type SignatureSigner = {
  id: string;
  createdAt: string;
  deletedAt: string;
  updatedAt: string;
  personId: string;
  signatureId: string;
  signingOrder: number;
  status: SignatureSignerStatus;
  __typename: 'RabbitSignSignatureSigner';
};

export type SignatureComplete = Signature & {
  attachment: Attachment;
  signers: SignatureSigner[];
};

export type SignatureActivityItem = {
  id: string;
  type:
    | 'SIGNATURE_CREATED'
    | 'SIGNER_SIGNED'
    | 'SIGNER_NOTIFIED'
    | 'SIGNATURE_COMPLETED';
  title: string;
  description: string;
  createdAt: string;
  icon: React.ReactNode;
  signerId?: string;
};
