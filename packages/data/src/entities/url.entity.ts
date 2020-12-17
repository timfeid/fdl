import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../base-entity'
import { Url as UrlInterface} from '@fdl/types'
import { Download } from './download.entity'
import { Downloadable } from './downloadable.entity'

@Entity()
export class Url extends BaseEntity implements UrlInterface {
  @Column()
  url: string

  @Column({nullable: true})
  contentLength: number | null

  @ManyToMany(() => Download)
  @JoinTable()
  download: Download

  @ManyToMany(() => Downloadable)
  @JoinTable()
  downloadable: Downloadable
}
