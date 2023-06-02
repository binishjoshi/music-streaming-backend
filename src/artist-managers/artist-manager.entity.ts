import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Admin } from '../admins/admin.entity';

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

  @Column('text', { array: true, default: [] })
  artists: string[];

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => Admin, { nullable: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  verifiedBy: Admin;
}
