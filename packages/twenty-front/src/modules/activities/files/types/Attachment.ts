import { Person } from '@/people/types/Person';
import { SignatureComplete } from '../../../signature/types/Signature';

export type Attachment = {
  id: string;
  name: string;
  fullPath: string;
  type: AttachmentType;
  companyId: string;
  personId: string;
  authorId: string;
  createdAt: string;
  __typename: string;
  signatureId: string | null;
};

export type AttachmentType =
  | 'Archive'
  | 'Audio'
  | 'Image'
  | 'Presentation'
  | 'Spreadsheet'
  | 'TextDocument'
  | 'Video'
  | 'Other';

export type AttachmentComplete = Attachment & {
  person: Omit<Person, 'email'> & {
    emails: {
      __typename: 'Emails';
      primaryEmail: string;
      additionalEmails: string[];
    };
  };
  signature: SignatureComplete | null;
};
