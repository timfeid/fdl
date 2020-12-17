import { Column, Entity as TypeormEntity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm'
import { InfoEntity } from '../info-entity'
import { Downloadable } from './downloadable.entity'
import { Tag } from './tag.entity'
import { Url } from './url.entity'

@TypeormEntity()
export class Entity extends InfoEntity {
  @Column({ unique: true })
  @Index()
  guid!: string

  @ManyToMany(() => Tag, tag => tag.entity, {eager: true})
  @JoinTable()
  tags: Tag[]

  @Column({type: 'float', nullable: true})
  ratingAverage: number

  @Column({nullable: true})
  ratingVotes: number

  @Column({nullable: true})
  trailer: string

  @OneToMany(() => Downloadable, downloadable => downloadable.entity, {eager: true})
  downloadables: Downloadable[]
}
