import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { Album } from '../albums/album.entity';
import { Song } from '../songs/song.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  picture: string;

  @Column()
  description: string;

  @ManyToOne(() => ArtistManger, (artistManager) => artistManager.artists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  managedBy: ArtistManger;

  @OneToMany(() => Album, (album) => album.id)
  albums: Album[];

  @OneToMany(() => Song, (song) => song.artist)
  songs: Song[];
}
