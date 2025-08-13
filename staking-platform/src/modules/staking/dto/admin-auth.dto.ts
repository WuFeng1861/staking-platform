import { IsNotEmpty, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsNotEmpty({ message: '管理员密码不能为空' })
  @IsString({ message: '管理员密码必须是字符串' })
  password: string;
}