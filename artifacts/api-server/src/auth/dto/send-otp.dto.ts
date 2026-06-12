import { IsEmail, IsIn } from "class-validator";

export class SendOtpDto {
  @IsEmail()
  email!: string;

  @IsIn(["login", "reset"])
  purpose!: "login" | "reset";
}
