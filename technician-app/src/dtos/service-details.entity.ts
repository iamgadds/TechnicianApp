import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Technician } from './technician.entity';
import { ServiceStatusEnum } from 'src/lib';
import { Item } from './item.entity';


@Entity()
export class ServiceDetails {
  @PrimaryGeneratedColumn()
  SvdId: number;

  @ManyToOne(() => Item, { eager: true })
  @JoinColumn({ name: 'ItemId' })
  Item: Item;

  @Column()
  ItemId: number;

  @Column()
  FaultMessage: string;

  @Column()
  Status: ServiceStatusEnum; // ServiceStatus value

  @Column({ nullable: true })
  TecId: number;

  @ManyToOne(() => Technician, { eager: true })
  @JoinColumn({ name: 'TecId' })  // 👈 this line ensures the FK column is bound
  Technician: Technician;


  @Column()
  IsDeleted: boolean;

  @Column({nullable: true})
  CreatedOn: Date;
}
