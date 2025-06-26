import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { CreateOneRabbitSignSignatureInput } from './dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from './dtos/create-one-rabbit-sign-signature.output';
import { UpdateRabbitSignSignatureWebhookInput } from './dtos/update-rabbit-sign-signature-webhook.input';
import { RabbitSignWebhookController } from './rabbitsign-webhook.controller';
import { RabbitSignResolver } from './rabbitsign.resolver';
import { RabbitSignKeyService } from './rabbitsignkey.service';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';
import { RabbitSignSignerService } from './rabbitsignsigner.service';

@Module({
  controllers: [RabbitSignWebhookController],
  providers: [
    JwtService,
    JwtWrapperService,
    FileService,
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    UpdateRabbitSignSignatureWebhookInput,
    RabbitSignKeyService,
    RabbitSignSignatureService,
    RabbitSignSignerService,
    RabbitSignResolver,
  ],
  exports: [
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    UpdateRabbitSignSignatureWebhookInput,
  ],
})

export class RabbitSignModule {}
