import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  ItemId: number;

  @Column({ unique: true })
  ItemName: string;

  @CreateDateColumn()
  CreatedOn: Date;

  @Column({ default: false })
  IsDeleted: boolean;
}
