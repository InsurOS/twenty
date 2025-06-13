import { Module } from '@nestjs/common';

import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [TwentyORMModule],
  providers: [RabbitSignJob],
})
export class RabbitSignJobModule {}
