import { Module, Logger } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule }       from "./auth/auth.module.js";
import { HealthModule }     from "./health/health.module.js";
import { UsersModule }      from "./users/users.module.js";
import { UsersRepository }  from "./users/users.repository.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 15 * 60 * 1000, limit: 10 },
    ]),
    UsersModule,
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide:    "APP_INIT",
      useFactory: async (users: UsersRepository) => {
        const logger = new Logger("AppModule");
        try {
          await users.ensureAdminAccount();
          logger.log("Admin account verified.");
        } catch (err) {
          logger.error("Failed to ensure admin account:", err);
        }
      },
      inject: [UsersRepository],
    },
  ],
})
export class AppModule {}
