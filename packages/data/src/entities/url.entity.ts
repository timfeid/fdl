import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../base-entity'
import { Url as UrlInterface} from '@fdl/info'
import { Download } from './download.entity'

@Entity()
export class Url extends BaseEntity implements UrlInterface {
  @Column()
  url: string

  @ManyToOne(() => Download)
  download: Download
}
