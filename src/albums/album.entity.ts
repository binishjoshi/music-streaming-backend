import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Song } from '../songs/song.entity';
import { Artist } from '../artists/artist.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  duration: number;

  @Column()
  type: 'album' | 'single' | 'ep';

  @Column()
  coverArt: string;

  @OneToMany(() => Song, (song) => song.id)
  songs: Song[];

  @ManyToOne(() => Artist, (artist) => artist.id)
  @JoinColumn()
  artist: Artist;
}
