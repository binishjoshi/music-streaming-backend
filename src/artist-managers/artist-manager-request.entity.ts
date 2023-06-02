import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtistManger } from './artist-manager.entity';
import { Admin } from '../admins/admin.entity';

@Entity()
export class ArtistManagerRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ArtistManger, (artistManager) => artistManager.id, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  requestedBy: ArtistManger;

  @Column()
  letter: string;

  @Column('text', { array: true, default: [] })
  documents: string[];

  @Column({ default: false })
  approved: boolean;

  @ManyToOne(() => Admin, (admin) => admin.id, { onDelete: 'CASCADE' })
  approvedBy: Admin;
}
