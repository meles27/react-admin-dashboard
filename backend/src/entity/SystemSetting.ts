import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  activationDate: Date;

  @Column({ type: "timestamp", nullable: true })
  expiryDate: Date;
}
