import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Song } from '../songs/song.entity';

@Entity()
export class Genre {
  @PrimaryColumn()
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Song, (song) => song.id)
  songs: Song[];
}
