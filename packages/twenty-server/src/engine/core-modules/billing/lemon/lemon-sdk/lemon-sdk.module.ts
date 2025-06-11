import { Module } from '@nestjs/common';

import { LemonSDKService } from 'src/engine/core-modules/billing/lemon/lemon-sdk/services/lemon-sdk.service';

@Module({
  providers: [LemonSDKService],
  exports: [LemonSDKService],
})
export class LemonSDKModule {}
