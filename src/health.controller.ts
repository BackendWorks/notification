import { Controller, Get } from '@nestjs/common';
import { Public } from './decorators';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private healthCheckService: HealthCheckService,
    private mongooseHealth: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([
      () => this.mongooseHealth.pingCheck('mongoDB'),
    ]);
  }
}
