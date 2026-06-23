import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
