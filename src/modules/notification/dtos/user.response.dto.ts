import { Exclude } from 'class-transformer';

export class UserResponseDto {
  created_at: Date;
  deleted_at: Date;
  device_token: string;
  email: string;
  first_name: string;
  id: number;
  is_deleted: boolean;
  is_verified: boolean;
  last_name: string;
  phone: string;
  profile_picture: string;
  role: string;
  updated_at: Date;
  username: string;

  @Exclude()
  password: string;
}
