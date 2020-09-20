import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate } from 'typeorm'
import { BaseEntity } from '../base-entity';
import { Type as TypeInterface} from '@fdl/types'

@Entity()
export class Type extends BaseEntity implements TypeInterface {
  @Column({ unique: true })
  name!: string
}
