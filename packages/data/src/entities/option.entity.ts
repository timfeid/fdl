import { AfterInsert, AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, AfterUpdate } from 'typeorm'
import { BaseEntity } from '../base-entity'

@Entity()
export class Option extends BaseEntity {
  @Column({ unique: true })
  name!: string

  @Column()
  value!: string
}
