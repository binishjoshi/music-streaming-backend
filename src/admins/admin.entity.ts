import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { User } from '../users/user.entity';
import { ArtistManagerRequest } from '../artist-managers/artist-manager-request.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @OneToMany(() => ArtistManger, (artistManager) => artistManager.id)
  artistManagersVerified: ArtistManger[];

  @Column('text', { array: true, default: [] })
  artistsVerified: string[];

  @OneToMany(() => User, (user) => user.id)
  usersDisabled: User[];

  @OneToMany(
    () => ArtistManagerRequest,
    (artistManagerRequest) => artistManagerRequest.id,
  )
  requestsVerfied: ArtistManagerRequest[];
}
