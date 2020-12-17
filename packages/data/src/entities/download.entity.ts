import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../base-entity'
import { Type } from './type.entity'
import {DownloadInfo, Step} from '@fdl/types'
import { Url } from './url.entity'
import { InfoEntity } from '../info-entity'

@Entity()
export class Download extends InfoEntity implements DownloadInfo {

  @Column({nullable: true})
  startedAt: Date | null

  @Column({nullable: true})
  completedAt: Date | null

  @Column({type: String, default: Step.QUEUE})
  step: Step

  @Column({nullable: true})
  referrer: string | null

  @ManyToMany(() => Url, url => url.download, {eager: true})
  @JoinTable()
  urls: Url[]
}
