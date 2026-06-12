import { IsEmail } from "class-validator";

export class CheckDto {
  @IsEmail()
  email!: string;
}
