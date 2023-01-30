import { Controller, Get } from '@nestjs/common';
import { Public } from './core/decorators';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private healthCheckService: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @Public()
  public async getHealth() {
    return this.healthCheckService.check([]);
  }
}
