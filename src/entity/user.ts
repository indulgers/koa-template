import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid") // 主键标识，使用 uuid 随机数
  id!: string;

  @Column({ nullable: true })
  username!: string;

  @Column()
  password!: string;
}
