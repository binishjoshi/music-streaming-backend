import { Expose } from 'class-transformer';

export class AdminDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  username: string;
}
