import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryColumn()
    id: number;

    @Column({ length: 255 })
    name: string;
}
