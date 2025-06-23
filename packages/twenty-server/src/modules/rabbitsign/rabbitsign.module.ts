import { Module } from '@nestjs/common';
import { CreateOneRabbitSignSignatureInput } from './dtos/create-one-rabbit-sign-signature.input';
import { CreateOneRabbitSignSignatureOutput } from './dtos/create-one-rabbit-sign-signature.output';
import { RabbitSignResolver } from './rabbitsign.resolver';
import { RabbitSignKeyService } from './rabbitsignkey.service';
import { RabbitSignSignatureService } from './rabbitsignsignature.service';

@Module({
  providers: [
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
    RabbitSignKeyService,
    RabbitSignSignatureService,
    RabbitSignResolver,
  ],
  exports: [
    CreateOneRabbitSignSignatureInput,
    CreateOneRabbitSignSignatureOutput,
  ],
})

export class RabbitSignModule {}
