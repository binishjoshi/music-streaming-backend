import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Song } from '../songs/song.entity';

@Entity()
export class Mrs {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => Song, (song) => song.mrsIndex, { cascade: true })
  songId: Song;

  @Column('int', { array: true, default: [] })
  maxEmbedding: number[];
}
