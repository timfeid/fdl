import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity as TypeormEntity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '../base-entity'
import { Url as UrlInterface} from '@fdl/types'
import { Download } from './download.entity'
import { Entity } from './entity.entity'

@TypeormEntity()
export class Tag extends BaseEntity {
  @Column()
  text: string

  @ManyToMany(() => Entity)
  @JoinTable()
  entity: Entity

  get category () {
    if (this.text.match(/[0-9]{3,4}p/)) {
      return 'quality'
    }
    if (!isNaN(parseInt(this.text, 10))) {
      return 'year'
    }
    return 'other'
  }
}
