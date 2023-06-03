import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Admin } from '../admins/admin.entity';
import { Artist } from '../artists/artist.entity';

@Entity()
export class ArtistManger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Artist, (artist) => artist.managedBy)
  artists: Artist[];

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => Admin, { nullable: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  verifiedBy: Admin;
}
