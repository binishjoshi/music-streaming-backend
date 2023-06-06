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

  @Column('float', { default: 0 })
  duration: number;

  @Column()
  type: 'album' | 'single' | 'ep';

  @Column()
  coverArt: string;

  @Column('date')
  releaseDate: Date;

  @OneToMany(() => Song, (song) => song.album, { onDelete: 'CASCADE' })
  songs: Song[];

  @ManyToOne(() => Artist, (artist) => artist.albums, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  artist: Artist;
}
