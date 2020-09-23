import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../base-entity'
import { Type } from './type.entity'
import {DownloadInfo, Step} from '@fdl/types'
import { Url } from './url.entity'

@Entity()
export class Download extends BaseEntity implements DownloadInfo {
  @Column()
  year: string

  @Column()
  title: string

  @Column()
  blurb: string

  @Column()
  poster: string

  @Column({nullable: true})
  season?: number | null

  @Column({nullable: true})
  startedAt: Date | null

  @Column({nullable: true})
  completedAt: Date | null

  @Column({nullable: true})
  referrer: string | null

  // @ManyToOne(() => Episode)
  // episode?: Episode

  @Column({nullable: true})
  episode?: number | null

  @ManyToOne(() => Type, {eager: true})
  type: Type

  @ManyToMany(() => Url, url => url.download, {eager: true})
  @JoinTable()
  urls: Url[]

  // @Column({
  //   type: 'enum',
  //   enum: Step,
  // })
  @Column({type: String, default: Step.QUEUE})
  step: Step
}