import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Admin } from '../admins/admin.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  admin: boolean;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ default: 'opus' })
  preference: 'opus' | 'flac';

  @Column('text', { array: true, default: [] })
  likedSongs: string[];

  @Column('text', { array: true, default: [] })
  createdPlaylists: string[];

  @Column('text', { array: true, default: [] })
  followedPlaylists: string[];

  @Column({ default: false })
  isDisabled: boolean;

  @ManyToOne(() => Admin, (admin) => admin.usersDisabled)
  disabledBy: Admin;
}
