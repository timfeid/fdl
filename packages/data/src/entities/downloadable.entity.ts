import { Column, Entity as TypeormEntity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { Url } from './url.entity'
import { BaseEntity } from '../base-entity'
import { Entity } from './entity.entity'

@TypeormEntity()
export class Downloadable extends BaseEntity {

  @Column({ unique: true })
  @Index()
  guid!: string

  @Column({nullable: true})
  referrer: string | null

  @Column()
  quality!: string

  @ManyToMany(() => Url, url => url.downloadable, {eager: true})
  @JoinTable()
  urls: Url[]

  @ManyToOne(() => Entity)
  @JoinColumn()
  entity: Entity
}
