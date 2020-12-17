import { Column, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { DownloadInfo, Step } from '@fdl/types'
import { BaseEntity } from './base-entity'
import { Url } from './entities/url.entity'
import { Type } from './entities/type.entity'

export abstract class InfoEntity extends BaseEntity {
  @Column()
  year: string

  @Column()
  title: string

  @Column()
  blurb: string

  @Column()
  poster: string

  @Column({nullable: true})
  backdrop: string

  @Column({nullable: true})
  season?: number | null

  @ManyToOne(() => Type, {eager: true})
  type: Type

  @Column({nullable: true})
  episode?: number | null
}
