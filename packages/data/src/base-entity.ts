import { BaseEntity as Base, BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from 'typeorm'

export class BaseEntity extends Base {

  @PrimaryGeneratedColumn()
  public id!: number

  @Column()
  public createdAt!: Date

  @Column()
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
