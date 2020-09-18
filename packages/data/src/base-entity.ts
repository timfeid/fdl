import { BaseEntity as Base, BeforeInsert, BeforeUpdate, Column, Index, PrimaryGeneratedColumn } from 'typeorm'

export class BaseEntity extends Base {

  @PrimaryGeneratedColumn()
  public id!: number

  @Column()
  @Index()
  public createdAt!: Date

  @Column()
  @Index()
  public updatedAt!: Date

  @BeforeInsert()
  public addCreatedAt() {
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }

  @BeforeUpdate()
  public updateUpdatedAt() {
    this.updatedAt = new Date()
  }
}
