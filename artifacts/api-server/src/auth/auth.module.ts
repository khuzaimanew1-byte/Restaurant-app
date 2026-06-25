import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthRepo } from "./auth.repo.js";
import { AuthSvc } from "./auth.service.js";
import { MailSvc } from "./email.service.js";

@Module({
  controllers: [AuthController],
  providers: [AuthSvc, AuthRepo, MailSvc],
  exports: [AuthSvc],
})
export class AuthMod {}
