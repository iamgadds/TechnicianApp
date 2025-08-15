import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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

  @OneToMany(() => ServiceDetails, service => service.Technician)
  services: ServiceDetails[];
}
