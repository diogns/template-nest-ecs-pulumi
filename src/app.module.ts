import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/infrastructure/nestjs/user.module';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './healthcheck.controller';

@Module({
  imports: [UserModule, TerminusModule, HttpModule, ConfigModule.forRoot()],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
