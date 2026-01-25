/**
 * Health check controller
 * Provides endpoint to verify API is running
 */

import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
