import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn } from 'typeorm';
import { ServiceDetails } from './service-details.entity';

@Entity()
export class Technician {
  @PrimaryGeneratedColumn()
  TecId: number;

  @Column()
  Name: string;

  @Column({ unique: true })
  MobileNumber: string;

  @Column({ default: false })
  IsDeleted: boolean;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @OneToMany(() => ServiceDetails, service => service.Technician)
  services: ServiceDetails[];
}
