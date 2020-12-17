import { Column, Entity } from 'typeorm'
import { BaseEntity } from '../base-entity'

@Entity()
export class Rss extends BaseEntity {
  @Column({ unique: true })
  name!: string

  @Column()
  url!: string

  @Column()
  lastGrabbedAt!: Date
}
