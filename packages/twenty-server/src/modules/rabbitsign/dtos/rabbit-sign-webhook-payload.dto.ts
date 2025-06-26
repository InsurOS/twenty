import { IsString } from 'class-validator';

export class RabbitSignWebhookPayloadDto {
  @IsString()
  folderId: string;

  @IsString()
  eventName: string;

  @IsString()
  signerEmail: string;
} 